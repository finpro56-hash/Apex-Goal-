# Firestore Security Specification

## 1. Data Invariants
1. **User Identity Invariant**: Users may only access and manipulate records where `userId == request.auth.uid`.
2. **Immutable Identity Invariant**: Once created, `userId`, `goalId`, and `milestoneId` cannot be changed or transferred to another user.
3. **Master Gate / Referential Integrity**:
   - A `Milestone` cannot be created unless its parent `Goal` exists and is owned by `request.auth.uid`.
   - A `Task` cannot be created unless both its parent `Goal` and parent `Milestone` exist and are owned by `request.auth.uid`.
4. **Boundary Validation Invariant**: All strings, IDs, and payload sizes must conform to length bounds (`title.size() <= 200`, `id.size() <= 128`, `id.matches('^[a-zA-Z0-9_-]+$')`).
5. **No Blanket Queries**: All `list` rules must enforce `resource.data.userId == request.auth.uid`.

## 2. The Dirty Dozen Malicious Payloads
1. **Spoofed User ID on Goal**: Attempting to set `userId: "attacker_uid"` on a new Goal.
2. **Ghost Field Injection**: Adding unapproved fields like `isAdmin: true` or `shadowField: "exploit"` to Goal/Task.
3. **Orphan Milestone Creation**: Creating a milestone with a nonexistent `goalId`.
4. **Foreign Parent Milestone Hijack**: Creating a milestone referencing another user's goal.
5. **Orphan Task Creation**: Creating a task referencing an unowned `milestoneId`.
6. **Task Ownership Transfer**: Attempting to update `userId` on an existing Task.
7. **Goal Ownership Transfer**: Attempting to update `userId` on an existing Goal.
8. **ID Poisoning Attack**: Passing a document ID containing special characters or exceeding 128 chars.
9. **Payload Bloat Attack**: Submitting a task title exceeding 200 characters.
10. **Unauthenticated Read**: Attempting to list `/goals` without valid Auth token.
11. **Cross-User Data Scraping**: Authenticated User B attempting to `get` or `list` User A's goals.
12. **PII Harvesting**: Querying `/users/{targetUid}` without being `targetUid`.

## 3. Security Assertions
Every operation must pass validation helpers `isValidGoal`, `isValidMilestone`, `isValidTask`, and `isValidUserSession`.
All documents are partitioned strictly by `userId == request.auth.uid`.
Default deny catch-all `match /{document=**} { allow read, write: if false; }` ensures no unmapped paths are exposed.
