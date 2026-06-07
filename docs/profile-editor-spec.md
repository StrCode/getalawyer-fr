# Lawyer profile editor — UI spec

Phase 2 #4. Backend: `GET/PATCH/POST/DELETE /api/lawyer/profile/*` (Law-Backend).

## Pages

| Route | Audience | Purpose |
|-------|----------|---------|
| `/dashboard/profile` | Approved lawyers | Edit all public profile sections |
| `/lawyers/[id]` | Clients | Read-only public profile (render `profile` + trust badges) |

Lawyers who are not yet **approved** can open `/dashboard/profile` but writes return `403 PROFILE_EDIT_REQUIRES_APPROVAL`. Show a banner; allow read-only preview of onboarding data.

---

## Dashboard layout

```
┌─────────────────────────────────────────────────────────────┐
│  Profile                          [View public profile ↗]   │
│  How clients see you on GetALawyer                          │
├─────────────────────────────────────────────────────────────┤
│  Profile completeness  72%  ████████░░░░                    │
│  ✓ Photo  ✓ Practice areas  ○ Add experience  ○ Availability│
├─────────────────────────────────────────────────────────────┤
│  § About & headline          [Save]                         │
│  § Office & firm             [Save]                         │
│  § Areas of practice         [Save]                         │
│  § Experience                [+ Add]  list + edit/delete    │
│  § Education                 [+ Add]  list + edit/delete    │
│  § Licenses & certifications [+ Add]  list + edit/delete    │
│  § Skills                    [+ Add]  chips + delete        │
└─────────────────────────────────────────────────────────────┘
```

**Pattern:** One card per section. Section-level save for About/Office/Practice areas; item-level CRUD for list sections (matches API).

**Related settings elsewhere:**

| Concern | Route |
|---------|-------|
| Account email/password | `/dashboard/settings` |
| Consultation types | `/dashboard/consultation-types` |
| Availability | `/dashboard/availability` |
| Avatar | Settings or profile header (TBD — may reuse client upload pattern for lawyers) |

---

## API mapping

| UI section | Method | Endpoint | Body |
|------------|--------|----------|------|
| Load all | `GET` | `/api/lawyer/profile` | — |
| About | `PATCH` | `/api/lawyer/profile/about` | `{ headline?, about? }` |
| Office & firm | `PATCH` | `/api/lawyer/profile/office` | `{ firmName?, officeStreet?, officeCity?, officeState?, officePostalCode? }` |
| Practice areas | `PUT` | `/api/lawyer/profile/practice-areas` | `{ practiceAreas: [{ specializationId, yearsOfExperience? }] }` |
| Experience | `POST` | `/api/lawyer/profile/experiences` | `{ title, organization, location?, startDate?, endDate?, isCurrent?, description? }` |
| Experience | `PATCH` | `/api/lawyer/profile/experiences/:id` | partial |
| Experience | `DELETE` | `/api/lawyer/profile/experiences/:id` | — |
| Education | `POST/PATCH/DELETE` | `/api/lawyer/profile/education` … | same pattern |
| License | `POST/PATCH/DELETE` | `/api/lawyer/profile/licenses` … | `{ name, issuingOrganization, …, credentialUrl? }` |
| Skill | `POST/PATCH/DELETE` | `/api/lawyer/profile/skills` … | `{ name }` |

Public read (clients): `GET /api/lawyers/:id` → `data.profile` (education may include `source: "onboarding"` fallback rows).

---

## Profile completeness (lawyer-only)

**Not used for search ranking.** Nudge lawyers to finish before clients see empty sections.

Computed client-side in `app/lib/profile-completeness.ts` from:

- `GET /api/lawyer/profile` payload
- `session.user.image`
- Optional: active consultation types count, availability schedule (parallel queries)

| Check | Weight | Complete when |
|-------|--------|---------------|
| `photo` | 10 | `session.user.image` is set |
| `about` | 15 | `about.about` or `about.headline` trimmed length ≥ 1 |
| `practiceAreas` | 15 | `practiceAreas.length ≥ 1` |
| `office` | 10 | `practiceInfo.officeCity` and `officeState` |
| `firm` | 5 | `practiceInfo.firmName` trimmed |
| `experience` | 10 | `experiences.length ≥ 1` |
| `education` | 10 | `education.length ≥ 1` (DB rows only in editor) |
| `skills` | 10 | `skills.length ≥ 1` |
| `consultationType` | 15 | ≥ 1 active consultation type |
| `availability` | 10 | ≥ 1 schedule row with `isAvailable: true` |

**Score:** sum of weights for completed checks / 100 → integer percent.

Each item exposes `{ id, label, complete, weight, href? }` for checklist UI and deep links (`/dashboard/consultation-types`, etc.).

---

## Public profile (`/lawyers/[id]`) sections

Render from `GET /api/lawyers/:id`:

```
Hero: name, image, firm, location, years of experience, specializations
Trust: Approved · NIN verified (badges, not numeric score)
About: profile.about.headline + profile.about.about
Experience: profile.experiences[]
Education: profile.education[] (show subtle note if source === 'onboarding')
Licenses: profile.licenses[] + isVerified badge when true
Skills: profile.skills[] as chips
Sidebar: consultation types, availability, Book CTA
```

---

## Implementation order

1. ✅ Types + API client + composable + completeness util (this PR)
2. ✅ Completeness card + editor shell + About section
3. Office + practice areas forms
4. List section modals (experience, education, license, skill)
5. Public profile section components on `/lawyers/[id]`
6. Articles module (Phase 2 #5)

---

## Files (frontend)

| File | Role |
|------|------|
| `app/types/lawyer-profile-editor.ts` | Types matching backend editor payload |
| `app/lib/api/lawyer-profile.ts` | API methods |
| `app/lib/profile-completeness.ts` | Pure completeness calculator |
| `app/composables/useLawyerProfileEditor.ts` | TanStack Query + mutations |
| `app/components/profile/ProfileCompletenessCard.vue` | Progress + checklist |
| `app/components/profile/LawyerProfileEditorShell.vue` | Dashboard lawyer profile page body |
| `app/components/profile/sections/ProfileAboutSection.vue` | About/headline form |
