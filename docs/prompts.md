# Claude Code Prompts - Crewspace

Copy these into Claude Code. Replace the parts in [brackets].

## 1. First session (kickoff)
```
Read CLAUDE.md and every file in /docs. Do not write any code yet.
Then tell me:
1. A short summary of the project in your own words
2. Anything in the docs that is unclear, missing, or contradicts itself
3. Any risks you see in the design
Wait for my answers before starting Day 0.
```

## 2. Start a task (use for every task)
```
Task: [paste one checkbox line from docs/tasks.md]

Before changing anything, inspect the relevant files and docs, then explain:
1. What you found
2. What needs to change
3. Which files you will create or modify
4. Risks or edge cases
5. How you will test it
Do not modify code yet.
```

## 3. Approve the plan
```
Plan approved. Implement only this task. Do not start the next one.
When done, run typecheck, lint, and tests (and test:db if you added a migration).
Show me the results and a short summary of what changed.
```

## 4. Senior review after each day
```
Review the changes since the last commit as a senior engineer. Look for:
- authorization gaps and RLS holes
- data leaks between workspaces
- missing input validation
- race conditions
- error messages leaking internal details
- unnecessary complexity or duplicated logic
List findings by severity. Do not fix anything yet.
```

## 5. When a test fails
```
A test is failing. Do NOT change the test yet.
Explain why it fails: is the implementation wrong or is the test wrong?
Show evidence from the requirements or database docs. Then propose a fix.
```

## 6. When the diff is too big
```
This change touches [N] files. Why does this task need that many?
Propose a smaller way to do it.
```

## 7. Security audit (Day 9)
```
Do a security audit of the whole app against docs/requirements.md and docs/database.md.
Check specifically:
- every table has RLS enabled and matching pgTAP tests
- service role client is only imported where CLAUDE.md allows
- no secrets or service role key can reach the browser bundle
- Stripe webhook verifies signatures and is idempotent
- plan/billing columns cannot be changed by users
- invitation tokens are hashed, single-use, expire, and require email match
- open redirects in auth callback and invite flow
- OWASP Top 10 issues
Report findings by severity with file references. Do not fix yet.
```

## 8. README (Day 10)
```
Write README.md for this project aimed at potential clients and developers:
what it does, screenshots placeholders, features, tech stack, architecture summary,
security approach (RLS, webhook idempotency, hashed tokens), how to run locally,
and demo login details placeholder. Plain, confident language. No exaggeration.
```
