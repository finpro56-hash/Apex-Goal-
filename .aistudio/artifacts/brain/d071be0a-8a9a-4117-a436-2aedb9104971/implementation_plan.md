# Security Hardening: Database-Enforced 24h Expiry & Cache Isolation

A comprehensive security hardening update for the Apex Goal PWA that moves 24-hour session validation from bypassable client logic directly into Firestore Security Rules, purges local IndexedDB persistence on logout/expiry, and eliminates static PII from application blueprints.

### User Review & Critical Decisions

> [!IMPORTANT]
> Based on your security analysis and confirmed preferences:
> 1. **Rule-Level Session Enforcement**: Every Firestore read and write will be gated by `request.auth.token.auth_time * 1000 > request.time.toMillis() - 86400000`. Stale or tampered tokens will be rejected by the Firestore engine itself.
> 2. **Client Token Eviction & Cache Purge**: On 24-hour expiration or user logout, the application will terminate the Firestore instance and execute `clearIndexedDbPersistence(db)` alongside local storage purging to prevent physical device inspection attacks.
> 3. **PII Sanitization**: Remove all static personal email mentions from blueprints, test specs, and configuration documentation.

---

### 1. Overview & Core Concept

- **What It Does**: Upgrades the security posture of the Goal Breakdown PWA from advisory client-side checks to cryptographic, database-enforced zero-trust access control.
- **Target Audience / Persona**: Security-conscious individuals tracking sensitive personal and professional goals who require absolute confidentiality even on shared or physical mobile devices.
- **Key Value**: Guarantees that goals cannot be read or modified beyond the 24-hour window through DevTools, direct SDK exploitation, or physical extraction of browser IndexedDB caches.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Active Session Flow**: Seamless goal management with live progress rings and real-time synchronization while the 24-hour window is valid.
  2. **Expiration & Cache Purge**: When the 24-hour countdown reaches zero, the app alerts the user, securely terminates Firestore, purges IndexedDB persistence to leave zero local remnants, signs out of Firebase, and displays the clean re-authentication screen.
  3. **Seamless Re-Authentication**: User taps "Sign in with Google Mail", generating a new `auth_time` timestamp on Google's identity servers, unlocking database operations for another 24 hours.

- **Visual Feedback & Diagnostics**:
  - *Session Center Indicator*: Displays exact remaining TTL (`Xh Ym`) in the top navigation and profile drawer.
  - *Expiry Notification*: Non-intrusive alert informing the user that offline caches have been safely wiped in accordance with the 24-hour privacy policy.

---

### 3. Key Product Decisions & Trade-Offs

- **Database-Level `auth_time` vs. Backend Express Server**:
  - *Chosen Approach*: Enforcing `request.auth.token.auth_time` in `firestore.rules` combined with client token eviction.
  - *Why*: Eliminates the latency, attack surface, and deployment complexity of maintaining a separate token-revocation server while providing mathematical guarantees at the Firestore database boundary.
  - *Trade-Off*: Once 24 hours have elapsed since the user's Google sign-in prompt, any token refresh will retain the original `auth_time` until a fresh interactive sign-in occurs, naturally enforcing the strict 24-hour re-login policy.

- **Aggressive IndexedDB Purge vs. Retained Offline Cache**:
  - *Chosen Approach*: Explicitly terminate and run `clearIndexedDbPersistence(db)` on logout or session expiration.
  - *Why*: Prevents forensic recovery of private goal documents from device disk or browser storage after session eviction.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

#### Architecture & Security Boundary Diagram

```
┌────────────────────────────────────────────────────────┐
│                   Client Browser / PWA                 │
│                                                        │
│  ┌───────────────────────┐   ┌──────────────────────┐  │
│  │  24-Hour TTL Monitor  │   │  IndexedDB Cache     │  │
│  │  (Prompts Re-Auth)    │   │  [PURGED ON EXPIRY]  │  │
│  └──────────┬────────────┘   └──────────────────────┘  │
│             │                                          │
│             │ Sends Firebase ID Token                  │
│             │ (contains signed auth_time)              │
│             ▼                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Firestore SDK (getDocs, setDoc, onSnapshot)     │  │
│  └──────────────────────────┬───────────────────────┘  │
└─────────────────────────────┼──────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────┐
│              Cloud Firestore Engine                    │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │            Hardened Security Rules               │  │
│  │                                                  │  │
│  │  function isSessionActive() {                    │  │
│  │    return request.auth != null &&                │  │
│  │      request.auth.token.auth_time is int &&      │  │
│  │      request.auth.token.auth_time * 1000 >       │  │
│  │        (request.time.toMillis() - 86400000);     │  │
│  │  }                                               │  │
│  │                                                  │  │
│  │  match /{document=**}                            │  │
│  │    allow read, write: if isSessionActive() &&    │  │
│  │                          resource.userId == ...  │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

#### Planned File Updates

1. **`firestore.rules`**:
   - Define global helper `function isSessionActive()` validating `request.auth.token.auth_time * 1000 > (request.time.toMillis() - 86400000)`.
   - Inject `isSessionActive()` into all `read`, `write`, `create`, `update`, and `delete` gates across `/users`, `/goals`, `/milestones`, and `/tasks`.
   - Deploy rules via `fax.DeployRules` RPC.

2. **`src/firebase/config.ts` & `src/context/AuthContext.tsx`**:
   - Implement `purgeLocalCacheAndSignOut()` helper that cleanly terminates the Firestore client and executes `clearIndexedDbPersistence(db)` to wipe all cached goals and tasks.
   - On 24-hour expiration or manual logout, execute the complete purge routine before clearing storage tokens.
   - Force interactive `signInWithPopup(auth, googleProvider)` with prompt to ensure a fresh Google `auth_time` claim is minted.

3. **`firebase-blueprint.json` & `security_spec.md`**:
   - Scrub any static user email strings, replacing them with generic RFC-compliant placeholders.
