import { beforeEach, describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";
import { processStripeEvent } from "./webhook";

const retrieveMock = vi.fn();

vi.mock("@/lib/stripe", () => ({
  stripe: { subscriptions: { retrieve: (...args: unknown[]) => retrieveMock(...args) } },
}));

type FakeResult = { data?: unknown; error?: unknown };

function thenable(result: FakeResult) {
  return { then: (resolve: (value: FakeResult) => void) => Promise.resolve(result).then(resolve) };
}

function makeFakeAdmin(responses: Record<string, FakeResult>) {
  const calls: { table: string; method: string; args: unknown[] }[] = [];

  function from(table: string) {
    return {
      insert: (data: unknown) => {
        calls.push({ table, method: "insert", args: [data] });
        return thenable(responses[`${table}.insert`] ?? { error: null });
      },
      update: (data: unknown) => ({
        eq: (col: string, val: unknown) => {
          calls.push({ table, method: "update", args: [data, col, val] });
          return thenable(responses[`${table}.update`] ?? { error: null });
        },
      }),
      select: () => ({
        eq: () => ({
          maybeSingle: () => {
            calls.push({ table, method: "select", args: [] });
            return Promise.resolve(responses[`${table}.select`] ?? { data: null, error: null });
          },
        }),
      }),
      delete: () => ({
        eq: (col: string, val: unknown) => {
          calls.push({ table, method: "delete", args: [col, val] });
          return thenable(responses[`${table}.delete`] ?? { error: null });
        },
      }),
    };
  }

  return { client: { from }, calls };
}

let fakeAdmin: ReturnType<typeof makeFakeAdmin>;

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => fakeAdmin.client,
}));

function baseEvent(type: string, object: Record<string, unknown>): Stripe.Event {
  return { id: "evt_1", type, data: { object } } as unknown as Stripe.Event;
}

describe("processStripeEvent", () => {
  beforeEach(() => {
    retrieveMock.mockReset();
  });

  it("checkout.session.completed links the workspace then syncs the subscription", async () => {
    fakeAdmin = makeFakeAdmin({
      "stripe_events.insert": { error: null },
      "workspaces.update": { error: null },
    });
    retrieveMock.mockResolvedValue({
      status: "active",
      items: { data: [{ current_period_end: 1700000000 }] },
    });

    await processStripeEvent(
      baseEvent("checkout.session.completed", {
        metadata: { workspace_id: "ws-1" },
        client_reference_id: "ws-1",
        customer: "cus_1",
        subscription: "sub_1",
      }),
    );

    const updates = fakeAdmin.calls.filter((c) => c.table === "workspaces" && c.method === "update");
    expect(updates).toHaveLength(2);
    expect(updates[0].args[0]).toEqual({
      stripe_customer_id: "cus_1",
      stripe_subscription_id: "sub_1",
    });
    expect(updates[1].args[0]).toMatchObject({ plan: "pro", subscription_status: "active" });
    expect(retrieveMock).toHaveBeenCalledWith("sub_1");
  });

  it("customer.subscription.updated looks up the workspace by subscription id and applies free for a canceled status", async () => {
    fakeAdmin = makeFakeAdmin({
      "stripe_events.insert": { error: null },
      "workspaces.select": { data: { id: "ws-2" }, error: null },
      "workspaces.update": { error: null },
    });
    retrieveMock.mockResolvedValue({
      status: "canceled",
      items: { data: [{ current_period_end: 1700000000 }] },
    });

    await processStripeEvent(
      baseEvent("customer.subscription.updated", { id: "sub_2", status: "canceled" }),
    );

    const update = fakeAdmin.calls.find((c) => c.table === "workspaces" && c.method === "update");
    expect(update?.args[0]).toMatchObject({ plan: "free", subscription_status: "canceled" });
  });

  it("customer.subscription.updated is a no-op when no workspace matches that subscription", async () => {
    fakeAdmin = makeFakeAdmin({
      "stripe_events.insert": { error: null },
      "workspaces.select": { data: null, error: null },
    });

    await processStripeEvent(baseEvent("customer.subscription.updated", { id: "sub_orphan" }));

    expect(retrieveMock).not.toHaveBeenCalled();
    expect(fakeAdmin.calls.some((c) => c.method === "update")).toBe(false);
  });

  it("customer.subscription.deleted sets plan=free and status=canceled directly, without re-fetching", async () => {
    fakeAdmin = makeFakeAdmin({
      "stripe_events.insert": { error: null },
      "workspaces.select": { data: { id: "ws-3" }, error: null },
      "workspaces.update": { error: null },
    });

    await processStripeEvent(baseEvent("customer.subscription.deleted", { id: "sub_3" }));

    expect(retrieveMock).not.toHaveBeenCalled();
    const update = fakeAdmin.calls.find((c) => c.table === "workspaces" && c.method === "update");
    expect(update?.args[0]).toEqual({ plan: "free", subscription_status: "canceled" });
  });

  it("invoice.payment_failed reads the subscription id out of parent.subscription_details", async () => {
    fakeAdmin = makeFakeAdmin({
      "stripe_events.insert": { error: null },
      "workspaces.select": { data: { id: "ws-4" }, error: null },
      "workspaces.update": { error: null },
    });

    await processStripeEvent(
      baseEvent("invoice.payment_failed", {
        parent: { subscription_details: { subscription: "sub_4" } },
      }),
    );

    const update = fakeAdmin.calls.find((c) => c.table === "workspaces" && c.method === "update");
    expect(update?.args[0]).toEqual({ subscription_status: "past_due" });
  });

  it("an already-processed event id is skipped without touching workspaces", async () => {
    fakeAdmin = makeFakeAdmin({
      "stripe_events.insert": { error: { code: "23505" } },
    });

    await processStripeEvent(baseEvent("customer.subscription.deleted", { id: "sub_5" }));

    expect(fakeAdmin.calls.some((c) => c.table === "workspaces")).toBe(false);
  });

  it("deletes the stripe_events row and rethrows when the handler fails", async () => {
    fakeAdmin = makeFakeAdmin({
      "stripe_events.insert": { error: null },
      "workspaces.select": { data: { id: "ws-6" }, error: null },
      "workspaces.update": { error: { message: "db exploded" } },
    });

    await expect(
      processStripeEvent(baseEvent("customer.subscription.deleted", { id: "sub_6" })),
    ).rejects.toEqual({ message: "db exploded" });

    const deleteCall = fakeAdmin.calls.find((c) => c.table === "stripe_events" && c.method === "delete");
    expect(deleteCall?.args).toEqual(["id", "evt_1"]);
  });
});
