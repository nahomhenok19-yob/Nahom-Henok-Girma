# Security Specification - melkahayu.nahom

## Data Invariants
1. Users can only edit their own profiles.
2. Posts must have a valid authorId matching the authenticated user.
3. Likes and Follows are unique and immutable once created.
4. VIP requests can only be seen by the requesting user or an admin.
5. Notifications are private to the recipient.
6. Land messages are restricted to land members if the land is marked as restricted.
7. Mood posts are public but can only be deleted/modified by the owner.
8. Gift transactions are immutable after creation.

## The "Dirty Dozen" Payloads (Denial Tests)
1. **Identity Spoofing**: Creating a post with someone else's `authorId`.
2. **Privilege Escalation**: Updating a user document to set `role: 'owner'`.
3. **Ghost Update**: Adding a field `isVerified: true` to a post.
4. **Member Bypass**: Reading messages from a restricted land the user is not a member of.
5. **Notification Peek**: Reading another user's notifications.
6. **Double Like**: Creating a second like for the same post/user combination.
7. **Terminal State Break**: Changing a VIP request status from `approved` back to `pending`.
8. **Resource Poisoning**: Using a 1MB string as a document ID for a land message.
9. **Orphaned Write**: Creating a like for a postId that does not exist.
10. **System Field Injection**: Updating a post to change the `aiComment` field manually.
11. **Immutable Break**: Changing the `followerId` of an existing follow record.
12. **Blanket Read Attack**: Executing a query for all notifications without a `userId` filter.

## Test Runner Logic
The following Firestore rules will ensure that all these payloads return `PERMISSION_DENIED`.
