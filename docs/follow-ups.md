# Follow-ups (deferred)

Items to pick up later — not blocking launch.

## Case messaging on case detail pages

**Status:** Not wired to real API.

The main product messaging path is live at `/dashboard/messages` (real API + sockets).

These still use **mock data**:

- `app/components/case/CaseMessaging.vue`
- `app/composables/useCaseMessaging.ts`
- Used from `app/pages/dashboard/cases/[id].vue`

**When implementing:** Reuse `useMessaging()` / `ConversationThreadPanel.vue` (or wire `useCaseMessaging` to `messagingAPI.getConversation` + socket send). Resolve `conversationId` from the case record if cases are linked to conversations.
