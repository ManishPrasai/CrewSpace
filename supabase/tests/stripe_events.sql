begin;
select plan(4);

select tests.create_supabase_user('stripeevtuser@example.com') as user_id \gset

-- As postgres (bypasses RLS), seed one row to prove the table isn't just
-- empty - the authenticated checks below must see 0 rows despite this.
insert into stripe_events (id, type) values ('evt_test_1', 'checkout.session.completed');

select tests.authenticate_as(:'user_id'::uuid);

select is(
  (select count(*) from stripe_events),
  0::bigint,
  'an authenticated user cannot read any row, even one that exists'
);

select throws_ok(
  $$ insert into stripe_events (id, type) values ('evt_test_2', 'invoice.payment_failed') $$,
  '42501',
  null,
  'an authenticated user cannot insert into stripe_events'
);

-- DELETE has no USING policy to match against, so (same mechanic as
-- announcements' member update/delete) it's a silent 0-row match, not
-- an exception the way INSERT's WITH CHECK failure is.
select lives_ok(
  $$ delete from stripe_events where id = 'evt_test_1' $$,
  'an authenticated user can run a delete, but RLS hides the row from it'
);

reset role;
select is(
  (select count(*) from stripe_events where id = 'evt_test_1'),
  1::bigint,
  'the row the authenticated user tried to delete is still there'
);

reset role;
select finish();
rollback;
