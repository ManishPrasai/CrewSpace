begin;
select plan(7);

select tests.create_supabase_user('pushuser1@example.com') as user1_id \gset
select tests.create_supabase_user('pushuser2@example.com') as user2_id \gset

select tests.authenticate_as(:'user1_id'::uuid);

select lives_ok(
  $$ insert into push_subscriptions (user_id, endpoint, p256dh, auth)
     values (auth.uid(), 'https://fcm.example.com/endpoint-1', 'p256dh-1', 'auth-1') $$,
  'a user can save their own push subscription'
);

select throws_ok(
  format(
    $$ insert into push_subscriptions (user_id, endpoint, p256dh, auth)
       values (%L, 'https://fcm.example.com/endpoint-spoofed', 'p256dh-x', 'auth-x') $$,
    :'user2_id'
  ),
  '42501',
  null,
  'a user cannot save a subscription under another user_id'
);

select is(
  (select count(*) from push_subscriptions where user_id = auth.uid()),
  1::bigint,
  'the user can see their own subscription'
);

reset role;
select tests.authenticate_as(:'user2_id'::uuid);

select is(
  (select count(*) from push_subscriptions),
  0::bigint,
  'a different user sees no subscriptions at all, not even a count'
);

select lives_ok(
  $$ delete from push_subscriptions where endpoint = 'https://fcm.example.com/endpoint-1' $$,
  'a user can run a delete targeting someone else''s subscription, but RLS hides the row from it'
);

reset role;
select is(
  (select count(*) from push_subscriptions where endpoint = 'https://fcm.example.com/endpoint-1'),
  1::bigint,
  'the other user''s subscription was not actually deleted'
);

select tests.authenticate_as(:'user1_id'::uuid);

select lives_ok(
  $$ delete from push_subscriptions where endpoint = 'https://fcm.example.com/endpoint-1' $$,
  'a user can delete their own subscription'
);

reset role;
select finish();
rollback;
