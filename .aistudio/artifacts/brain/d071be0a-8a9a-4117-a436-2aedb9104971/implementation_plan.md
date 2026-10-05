# Navigation Streamlining: Remove Redundant Session Tab

Streamline the mobile bottom navigation bar by removing the redundant "Session" tab item, keeping session management and logout consolidated exclusively within the top bar user profile drawer.

### User Review & Critical Decisions

> [!IMPORTANT]
> - **Consolidated Session Access**: Session status, countdown timers, token refresh, and logout options remain accessible at all times by tapping the user profile avatar in the top navigation bar.
> - **Refined Bottom Bar**: `BottomTabBar.tsx` will be streamlined to a 2-tab ergonomic layout:
>   - **Goals Tab**: Overview of active and achieved goals.
>   - **Center Floating Action Button (+)**: Rapid goal creation modal trigger.
>   - **Focus Tab**: Next actionable items across all goals with real-time pending task badge.

---

### 1. Overview & Core Concept

- **What It Does**: Eliminates navigational duplication between the top bar user profile avatar and the bottom tab bar, delivering a cleaner, more focused mobile touch interface.
- **Key Value**: Simplifies thumb-zone navigation, focusing the user's attention on their core loop: creating goals and executing focus tasks.

---

### 2. User Experience & Visual Design

- **Bottom Navigation Layout**:
  - Balanced 3-element composition: `[ Goals ]` — `[ (+) Floating Add Button ]` — `[ Focus (Badge) ]`.
  - Wider touch targets ($\ge 48\times 48\text{px}$) for thumb navigation.
- **Session & Account Access**:
  - The top bar continues to show the real-time session duration counter (`23h 48m`) and Google user avatar.
  - Tapping the avatar smoothly opens the full Session & Account drawer with token validation and logout.

---

### 3. Key Product Decisions & Trade-Offs

- **Two-Tab + Center FAB Architecture**:
  - *Chosen Approach*: Update `TabKey` type to `'goals' | 'focus'` in `BottomTabBar.tsx` and `App.tsx`.
  - *Why*: Provides visual symmetry and direct access to the two primary operational views of the application without clutter.

---

### 4. Technical Architecture & Component Changes *(Technical Reference)*

#### Bottom Bar Visual Anatomy

```
┌────────────────────────────────────────────────────────┐
│                   Streamlined Bottom Nav               │
│                                                        │
│       ┌──────────────┐     ┌─────┐     ┌─────────────┐ │
│       │  🎯 Goals    │     │  +  │     │  ⚡ Focus   │ │
│       └──────────────┘     └─────┘     └─────────────┘ │
│                                                        │
│  (Session & Logout consolidated in TopNav Profile)     │
└────────────────────────────────────────────────────────┘
```

#### Files to Modify:
1. **`src/components/BottomTabBar.tsx`**:
   - Update `TabKey` to `'goals' | 'focus'`.
   - Remove `Shield` icon import and the "Session" button block.
   - Adjust flex distribution so Goals, FAB, and Focus are evenly spaced.
2. **`src/App.tsx`**:
   - Update `activeTab` state type to `'goals' | 'focus'`.
   - Remove unused `activeTab === 'profile'` conditional block.
