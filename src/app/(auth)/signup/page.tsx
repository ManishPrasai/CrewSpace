import { SignUpForm } from "@/features/auth/components/SignUpForm";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="mx-auto flex max-w-sm flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold">Sign up</h1>
      <SignUpForm next={next} />
    </main>
  );
}
