# Firestore Security Specification

## 1. Data Invariants
1. **Database-Enforced 24-Hour Active Session Invariant**:
   - Every operation is guarded by `isSessionActive()`:
     `request.auth != null && request.auth.token.auth_time is int && (request.auth.token.auth_time * 1000) > (request.time.toMillis() - 86400000)`
   - Stale tokens whose initial Google authentication occurred > 24 hours ago are rejected by the Firestore engine with `PERMISSION_DENIED`.
2. **User Identity Invariant**: Users may only access and manipulate records where `userId == request.auth.uid`.
3. **Immutable Identity Invariant**: Once created, `userId`, `goalId`, and `milestoneId` cannot be changed or transferred to another user.
4. **Master Gate / Referential Integrity**:
   - A `Milestone` cannot be created unless its parent `Goal` exists and is owned by `request.auth.uid`.
   - A `Task` cannot be created unless both its parent `Goal` and parent `Milestone` exist and are owned by `request.auth.uid`.
5. **Boundary Validation Invariant**: All strings, IDs, and payload sizes must conform to length bounds (`title.size() <= 200`, `id.size() <= 128`, `id.matches('^[a-zA-Z0-9_-]+$')`).
6. **No Blanket Queries**: All `list` rules must enforce `resource.data.userId == request.auth.uid`.
7. **Local Persistence Purge Invariant**: On 24-hour expiration or logout, the client calls `terminate(db)` and `clearIndexedDbPersistence(db)` to wipe any cached offline documents from the device.

## 2. The Dirty Dozen Malicious Payloads
1. **Spoofed User ID on Goal**: Attempting to set `userId: "attacker_uid"` on a new Goal.
2. **Stale Token Write (Post-24h Expiry)**: Making a mutation with an ID token whose `auth_time` is older than 24 hours (REJECTED by `isSessionActive`).
3. **Ghost Field Injection**: Adding unapproved fields like `isAdmin: true` or `shadowField: "exploit"` to Goal/Task.
4. **Orphan Milestone Creation**: Creating a milestone with a nonexistent `goalId`.
5. **Foreign Parent Milestone Hijack**: Creating a milestone referencing another user's goal.
6. **Orphan Task Creation**: Creating a task referencing an unowned `milestoneId`.
7. **Task Ownership Transfer**: Attempting to update `userId` on an existing Task.
8. **Goal Ownership Transfer**: Attempting to update `userId` on an existing Goal.
9. **ID Poisoning Attack**: Passing a document ID containing special characters or exceeding 128 chars.
10. **Payload Bloat Attack**: Submitting a task title exceeding 200 characters.
11. **Unauthenticated Read**: Attempting to list `/goals` without valid Auth token.
12. **Cross-User Data Scraping**: Authenticated User B attempting to `get` or `list` User A's goals.

## 3. Security Assertions
Every operation must pass `isSessionActive()`, `isValidId()`, and schema shape checks.
All documents are partitioned strictly by `userId == request.auth.uid`.
Default deny catch-all `match /{document=**} { allow read, write: if false; }` ensures no unmapped paths are exposed.
