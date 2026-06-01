---
title: "feat: Google Login with Fresh Account"
type: feat
date: 2026-06-01
status: draft
---

# feat: Google Login with Fresh Account

## Overview

Enable users to sign in to BigBenchApp using their Google account via Supabase's Google OAuth provider. The feature must work end-to-end for **new users** (fresh accounts) — from Google consent screen through profile creation to their first logged-in session. The frontend code is already implemented; this plan covers the external configuration and verification steps needed to make Google login operational.

## Problem Statement

Currently, BigBenchApp only supports email/password authentication. Adding Google OAuth removes friction — users sign in with one click, and their profile (name, avatar) is automatically populated via the existing database trigger.

## Proposed Solution

Configure Google OAuth on both Supabase projects (dev and production) and verify the full signup flow for a fresh Google account. No code changes are needed — the implementation already exists:

| Component | File | Status |
|-----------|------|--------|
| Google sign-in button | `src/pages/Auth.tsx:125-138` | ✅ Implemented |
| OAuth redirect call | `src/pages/Auth.tsx:75-90` | ✅ Implemented |
| Auth state listener | `src/contexts/AuthContext.tsx:23-27` | ✅ Implemented |
| Profile creation trigger | `supabase/migrations/20260430105302_*.sql:40-55` | ✅ Implemented |
| Avatar display in header | `src/components/layout/Header.tsx:90` | ✅ Implemented |

## Technical Approach

### Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  User clicks │────▶│  Supabase Auth   │────▶│  Google Consent │
│  "Continua   │     │  (PKCE flow)     │     │  Screen         │
│  con Google" │     └──────────────────┘     └────────┬────────┘
└─────────────┘                                       │
                                                       ▼
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Profile     │◀────│  onAuthState     │◀────│  Redirect back  │
│  auto-created│     │  Change fires    │     │  to app (origin)│
│  (DB trigger)│     │  SIGNED_IN       │     │  with session   │
└─────────────┘     └──────────────────┘     └─────────────────┘
```

### Implementation Phases

#### Phase 1: Google Cloud Console Setup

**Tasks:**

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create new project "BigBenchApp" (or reuse existing)

2. **Configure OAuth Consent Screen**
   - Navigate to **APIs & Services → OAuth consent screen**
   - Choose **External** user type
   - App name: `BigBenchApp`
   - User support email + Developer contact: your email
   - **Scopes**: `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`
   - Add test users (your Google accounts for development)

3. **Create OAuth 2.0 Credentials (Web Client)**
   - Navigate to **Credentials → Create Credentials → OAuth client ID**
   - Application type: **Web application**
   - Name: `BigBenchApp Web`
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (Vite dev server)
     - `https://<production-domain>` (production — add when known)
   - **Authorized redirect URIs** (copy from Supabase Dashboard — see Phase 2):
     - Dev: `https://oznxvjfmjvuaircepkzz.supabase.co/auth/v1/callback`
     - Prod: `https://hzlxijaulvsvupbmdqbr.supabase.co/auth/v1/callback`
   - Click **Create**, then **save Client ID and Client Secret**

**Deliverables:** OAuth 2.0 Client ID + Secret for Web application

---

#### Phase 2: Supabase Dashboard Configuration

**Tasks:**

1. **Enable Google provider on dev project** (`oznxvjfmjvuaircepkzz`)
   - Go to **Authentication → Providers → Google**
   - Toggle ON, paste Client ID + Secret from Phase 1
   - Save
   - Copy the callback URL shown below the fields

2. **Enable Google provider on production project** (`hzlxijaulvsvupbmdqbr`)
   - Repeat same steps

3. **Configure Redirect URLs** for both projects
   - **Authentication → URL Configuration**
   - **Site URL** (prod): `https://<production-domain>`
   - **Additional Redirect URLs** (dev):
     - `http://localhost:5173/**`
     - `http://localhost:5173`
   - **Additional Redirect URLs** (prod):
     - `https://<production-domain>/**`
     - `https://<production-domain>`

4. **Sync callback URLs to Google Cloud Console**
   - Verify the Supabase callback URLs are in Google Cloud Console
   - Credentials → Your Web Client → Authorized redirect URIs

**Deliverables:** Google provider active on both Supabase projects

---

#### Phase 3: End-to-End Verification

**Test scenarios:**

1. **Fresh Google account on dev**
   - Start dev: `pnpm dev`
   - Go to `http://localhost:5173/auth`
   - Click "Continua con Google"
   - Sign in with a Google account never used with this app
   - Verify:
     - [ ] Redirects to Google consent → back to app home
     - [ ] Header shows avatar + display name from Google
     - [ ] /settings shows pre-populated name and avatar URL
     - [ ] /progress loads without errors
     - [ ] Fresh profile row exists in `profiles` table with Google data

2. **Re-login after sign out**
   - Sign out → click "Continua con Google" again
   - Should log in immediately without re-consent

3. **Existing email account with same Google email**
   - If user already has an email account with the same email as their Google account
   - Verify Supabase links identities correctly (no duplicate profile)

4. **Error states**
   - Cancel on Google consent screen → stays on `/auth`
   - Network error during OAuth → Italian error toast appears

---

#### Phase 4: Deployment

1. Merge `google-login` branch
2. Deploy to production
3. Monitor **Authentication → Logs** for 24h — check for `provider: google`, `login_method: oauth` events
4. Run Supabase security audit post-deployment

## Acceptance Criteria

- [ ] Fresh Google account creates a profile row with correct `display_name` and `avatar_url`
- [ ] User's Google display name and avatar appear in the header and settings page
- [ ] Sign out / sign back in with Google works without re-consent
- [ ] No `redirect_uri_mismatch` errors
- [ ] Both dev (`localhost:5173`) and production work
- [ ] `pnpm build` succeeds
- [ ] `pnpm lint` has no new errors

## Risks & Mitigation

| Risk | Mitigation |
|------|-----------|
| `redirect_uri_mismatch` error | Copy callback URL exactly from Supabase Dashboard (watch trailing slash, `http` vs `https`) |
| Consent screen unverified | Use "External" with test users for dev; submit for verification before production launch |
| Two Supabase projects to configure | Document both; config is identical except for callback URLs |
| Profile trigger fails for OAuth metadata | Trigger already tested with Google's `full_name` and `avatar_url` keys |

## References

- Supabase Google OAuth docs: https://supabase.com/docs/guides/auth/social-login/auth-google
- Supabase redirect URLs: https://supabase.com/docs/guides/auth/redirect-urls
- Google Cloud Console: https://console.cloud.google.com/auth/clients
- Auth flow code: `src/pages/Auth.tsx:75-90`
- Profile trigger: `supabase/migrations/20260430105302_*.sql:40-55`
