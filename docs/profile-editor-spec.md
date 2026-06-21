# Lawyer profile editor — UI spec

Backend: `GET/PATCH/POST/DELETE /api/lawyer/profile/*` (Law-Backend).

## Pages

| Route | Audience | Purpose |
|-------|----------|---------|
| `/dashboard/profile` | Lawyers | Edit public profile + directory readiness |
| `/dashboard/settings` | Lawyers | Hub to profile, consultation types, availability, subscription |
| `/lawyers/[id]` | Clients | Read-only public profile |

Lawyers who are not yet **approved** can open `/dashboard/profile` but writes return `403 PROFILE_EDIT_REQUIRES_APPROVAL`. Show a banner; allow read-only preview of onboarding data.

---

## Dashboard layout (`/dashboard/profile`)

```
┌─────────────────────────────────────────────────────────────┐
│  Profile                    [View public profile ↗]       │
│  How clients see you on GetALawyer                          │
├─────────────────────────────────────────────────────────────┤
│  Directory visibility        [Visible / Hidden badge]       │
│  ✓ Approved  ✓ Subscription  ○ Tier 1 profile               │
│  Profile strength 72% ████████░░  (nudge only)              │
├─────────────────────────────────────────────────────────────┤
│  Profile checklist (Tier 1 / 2 / 3)                         │
├─────────────────────────────────────────────────────────────┤
│  § Photo (#photo)                                           │
│  § About & headline (#about)                                │
│  § Office & firm (#office)                                    │
│  § Areas of practice (#practice-areas)                      │
│  § Experience / Education / Licenses / Skills / Articles    │
└─────────────────────────────────────────────────────────────┘
```

**Pattern:** One card per section. Section-level save for About/Office/Practice areas; item-level CRUD for list sections.

**Related settings elsewhere:**

| Concern | Route |
|---------|-------|
| Consultation types | `/dashboard/consultation-types` |
| Availability | `/dashboard/availability` |
| Subscription | `/dashboard/subscription` |
| Account email/password | `/dashboard/settings` (client today; lawyer hub links back to profile) |

---

## Three-tier model

| Tier | Name | Enforced? | Purpose |
|------|------|-----------|---------|
| **1** | Ready to publish | **Yes** — gates `is_directory_visible` | Photo, headline, practice areas, office, consultation type, availability + approval + subscription |
| **2** | Good profile | No — nudge only | About bio, experience, education, firm name |
| **3** | Premium profile | No — nudge only | Skills, licenses, published articles |

**Authoritative source:** `GET /api/lawyer/profile` returns `directoryEligibility` and `profileStrength` from the backend (single fetch). The frontend checklist mirrors check IDs from `fixtures/profile-check-definitions.json` (130 total weight, strong ≥ 80%).

---

## API mapping

| UI section | Method | Endpoint |
|------------|--------|----------|
| Load all + eligibility | `GET` | `/api/lawyer/profile` |
| About | `PATCH` | `/api/lawyer/profile/about` |
| Office & firm | `PATCH` | `/api/lawyer/profile/office` |
| Practice areas | `PUT` | `/api/lawyer/profile/practice-areas` |
| Experience / Education / License / Skill / Article | CRUD | `/api/lawyer/profile/{section}` |
| Avatar | `POST` | `/api/lawyer/profile/avatar` |

Public read (clients): `GET /api/lawyers/:id` — gated by `approved AND is_directory_visible` when `DIRECTORY_USE_VISIBILITY_COLUMN=true`. Owner preview bypass unchanged.

---

## Profile check weights (pinned — total 130)

| Check ID | Tier | Weight | Tier 1 gate? |
|----------|------|--------|--------------|
| `photo` | 1 | 10 | yes |
| `headline` | 1 | 10 | yes |
| `practiceAreas` | 1 | 15 | yes |
| `office` | 1 | 10 | yes |
| `consultationType` | 1 | 15 | yes |
| `availability` | 1 | 10 | yes |
| `aboutBio` | 2 | 10 | no |
| `experience` | 2 | 10 | no |
| `education` | 2 | 10 | no |
| `firm` | 2 | 5 | no |
| `skills` | 3 | 10 | no |
| `licenses` | 3 | 10 | no |
| `articles` | 3 | 5 | no |

Client mirror: `app/lib/profile-completeness.ts` (approximate). Dashboard checklist prefers API `profileStrength.incompleteCheckIds`.

---

## Directory visibility UX

- **Approved but not visible:** amber banner + eligibility card with gate rows + Tier 1 deep links
- **View public profile:** always available to owner; tooltip when hidden from search
- **Profile strength bar:** quality nudge only — does not gate search

---

## Public profile (`/lawyers/[id]`)

Hero, about (show-more), experience, education, licenses, skills, articles, consultation options, availability, booking sidebar. See Phase 4 polish (availability summary, sidebar pricing).

---

## Key frontend files

| File | Role |
|------|------|
| `app/lib/profile-check-catalog.ts` | Check labels, tiers, hrefs from fixture |
| `app/lib/profile-completeness.ts` | 130-weight client mirror |
| `app/components/profile/LawyerDirectoryEligibilityCard.vue` | Gates + strength bar |
| `app/components/profile/ProfileStrengthChecklist.vue` | Tier-grouped checklist |
| `app/components/profile/LawyerPublishReadinessBanner.vue` | Approved-but-hidden banner |
| `app/components/profile/LawyerProfileEditorShell.vue` | Editor shell + section anchors |
