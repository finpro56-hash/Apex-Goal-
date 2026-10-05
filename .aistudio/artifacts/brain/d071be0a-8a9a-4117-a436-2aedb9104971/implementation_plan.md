# Apex Goal: Minimalist Goal Breakdown PWA

A mobile-first, installable Progressive Web App that helps ambitious people conquer large objectives by decomposing them into actionable milestones and granular sub-tasks, backed by live Firestore synchronization, 24-hour Google session validation, and interactive SVG progress rings.

### User Review & Critical Decisions

> [!IMPORTANT] 
> Based on your clarifications, the application is tailored around:
> 1. **Multi-level hierarchy**: Big Goal → Strategic Milestones → Tactical Sub-tasks with recursive progress calculations.
> 2. **Clean OLED Dark Mode**: Pure pitch-black (`#000000` / `#09090b`) canvas with subtle emerald accents (`#10b981`), zero visual clutter, and strict anti-slop typography.
> 3. **Automatic Progress Rings**: Dynamic SVG stroke rings reflecting live completion percentages across milestones and overall goals.
> 4. **Session Security & 24-Hour Expiry**: Google Sign-In with Firebase Auth, client-side session token validation, 24-hour expiration threshold, and automatic token refresh/expiration gating.
> 5. **PWA Compliance**: Offline caching via `vite-plugin-pwa`, custom install drawer for Android/Desktop, and guided iOS Safari home screen instructions.

---

### 1. Overview & Core Concept

- **What It Does**: Users capture macro ambitions ("Run a Marathon", "Launch SaaS Product", "Learn Japanese") and break them into bite-sized milestones and immediate sub-tasks. Marking sub-tasks complete automatically updates milestone and parent goal progress rings in real time.
- **Target Audience / Persona**: High-focus individuals, students, creators, and professionals who need a fast, distraction-free mobile tool to overcome procrastination and execute with clarity.
- **Key Value**: Eliminates goal paralysis by converting intimidating goals into a clear visual tree of manageable pieces, synchronized across all devices and accessible offline as an installed home-screen app.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Authentication & Session Onboarding**: User signs in with their Google account (`finpro56@gmail.com`). A secure session timestamp is initialized with a 24-hour expiration window and verified on every launch and API interaction.
  2. **Goal Creation & Decomposition**: Floating quick-add button in the natural thumb zone allows creating a goal (title, target date, category tag). Inside a goal, users tap "+ Milestone" or "+ Task" with inline rapid entry (no sluggish multi-page forms).
  3. **Execution & Checkoff**: Tapping sub-task circles toggles completion with a snappy haptic-style transition, instantly updating the milestone bar and the header's SVG progress ring.
  4. **PWA Installation**: Unobtrusive in-app installation banner triggers standard Chromium/Android prompts, while iOS users receive a clear 2-step Safari "Add to Home Screen" modal.
  5. **Offline & Network Resilience**: Changes persist in local cache and synchronize to Firestore once reconnected; an offline status indicator shows connection state.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Utilitarian minimalism with tactile mobile ergonomics. Pure pitch black (`#000000`), zinc card surfaces (`#121215`), hairline borders (`rgba(255,255,255,0.08)`), and emerald highlights (`#10b981`).
  - *Zero-Pill Discipline*: Categories and dates are formatted as quiet inline text separated by typographic middots (`Fitness · Target Nov 2026 · 12 tasks`), avoiding tacky colored pill capsules.
  - *Typography*: High-legibility sans-serif headings with optical spacing, paired with tabular monospace numerals (`font-mono tabular-nums`) for percentages, counters, and countdowns.
  - *Ergonomics & Thumb Zones*: Fixed bottom navigation bar (Goals, Today/Focus, Stats, Profile) and 48px touch targets adhering to the natural one-handed reach zone.

---

### 3. Key Product Decisions & Trade-Offs

- **Hierarchical Tree vs. Flat Checklist**:
  - *Chosen Approach*: Multi-level tree (Goal → Milestones → Tasks) where milestones serve as intermediate checkpoints.
  - *Why*: Large goals easily fail when reduced to a chaotic 50-item flat list; milestones group tasks logically and provide frequent dopamine milestones.
  - *Alternatives Considered*: Flat checklist (too simplistic for big goals) or infinite nested subtrees (cumbersome to navigate on mobile screens).

- **24-Hour Session Validation & Token Refresh**:
  - *Chosen Approach*: Store a cryptographically salted session initiation timestamp in secure storage. On application foreground, token refresh, and Firestore write, verify `currentTime - sessionStartTime < 24 * 3600 * 1000`. If expired, revoke session and prompt seamless re-authentication.
  - *Why*: Fulfills the exact requirement for a 24-hour expiration window while maintaining secure Firebase token exchange without breaking offline usage.

- **PWA Service Worker Architecture**:
  - *Chosen Approach*: `vite-plugin-pwa` with auto-updating Service Worker, precaching app assets, and custom React hook (`usePWAInstall`) for native browser prompt delegation.
  - *Why*: Zero runtime overhead, reliable offline caching, and full standalone display support on Android, iOS Safari, and Chromium desktop.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

#### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────┐
│                   Browser / PWA Client                 │
│                                                        │
│  ┌─────────────────────────┐  ┌─────────────────────┐  │
│  │    PWA Service Worker   │  │  Session & Token    │  │
│  │   (Offline precaching)  │  │  Manager (24h TTL)  │  │
│  └─────────────────────────┘  └─────────────────────┘  │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │                    App Views                     │  │
│  │  ┌──────────────┐ ┌───────────────┐ ┌──────────┐ │  │
│  │  │  Goals List  │ │  Goal Detail  │ │  Focus   │ │  │
│  │  │ (Rings/Cards)│ │ (Tree Editor) │ │  Today   │ │  │
│  │  └──────────────┘ └───────────────┘ └──────────┘ │  │
│  │  ┌─────────────────────────────────────────────┐ │  │
│  │  │  Ergonomic Bottom Nav & In-App PWA Install  │ │  │
│  │  └─────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────────────┬────────────────────────────┘
                            │ Firebase Auth (Google Provider)
                            │ Firestore ABAC Rules
                            ▼
┌────────────────────────────────────────────────────────┐
│                    Firebase Backend                    │
│                                                        │
│  ┌────────────────────────┐  ┌──────────────────────┐  │
│  │     Firebase Auth      │  │  Cloud Firestore DB  │  │
│  │   (Google Sign-In)     │  │  users/{uid}/goals   │  │
│  │                        │  │  users/{uid}/milest. │  │
│  │                        │  │  users/{uid}/tasks   │  │
│  └────────────────────────┘  └──────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

#### Data Model & State

1. **`users/{userId}`**:
   - `id`: Google UID
   - `email`: User email (`finpro56@gmail.com`)
   - `displayName`: User name
   - `lastLoginAt`: Timestamp of session authentication
   - `sessionExpiresAt`: Timestamp (+24 hours from login)

2. **`goals/{goalId}`**:
   - `id`: Unique UUID
   - `userId`: Owner UID (guarded by Firestore rules)
   - `title`: Big goal name (e.g. "Launch SaaS Platform")
   - `description`: Optional motivating context
   - `category`: Category string (e.g. "Career", "Health", "Learning")
   - `targetDate`: Target completion date string
   - `completed`: Boolean
   - `totalTasks`: Number (aggregated or calculated)
   - `completedTasks`: Number
   - `createdAt` & `updatedAt`: Firestore server timestamps

3. **`milestones/{milestoneId}`**:
   - `id`: Unique UUID
   - `goalId`: Reference to parent goal
   - `userId`: Owner UID
   - `title`: Milestone name (e.g. "Phase 1: MVP Architecture")
   - `order`: Numeric sort index
   - `completed`: Boolean

4. **`tasks/{taskId}`**:
   - `id`: Unique UUID
   - `milestoneId`: Reference to parent milestone
   - `goalId`: Reference to parent goal
   - `userId`: Owner UID
   - `title`: Actionable task description
   - `completed`: Boolean
   - `completedAt`: Timestamp or null
   - `order`: Numeric sort index

#### Interactive Component & State Mapping

- **`SessionProvider`**: Manages Google Auth status, token refresh interval, and enforces the 24-hour expiration policy with an explicit expiry countdown banner and re-auth dialog.
- **`GoalsOverview`**: Renders goal cards with SVG circular progress meters, total pieces breakdown, and quick filtering (Active, Achieved, All).
- **`GoalDetailView`**: Interactive multi-level tree view allowing users to expand/collapse milestones, add tasks with keyboard 'Enter' rapid flow, and toggle completion with instant visual feedback.
- **`QuickAddGoalModal`**: Mobile-optimized bottom drawer for creating new big goals with pre-filled smart milestone templates.
- **`PWAInstallBanner`**: Contextual install trigger displayed in settings and bottom-bar when browser triggers `beforeinstallprompt` or on iOS Safari.
