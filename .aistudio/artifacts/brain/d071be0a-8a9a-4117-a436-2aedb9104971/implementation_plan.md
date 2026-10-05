# Goal Target Date Popup: Commit Only on Done Button Click

Update the target date popup in `GoalDetailView.tsx` to hold the selected date in local draft state, preventing premature closure when interacting with the calendar, and saving the updated date only when the user explicitly clicks the "Done" button.

### User Review & Critical Decisions

> [!IMPORTANT]
> - **Persistent Popup During Interaction**: Selecting dates on the calendar grid, picking quick horizon presets (`+1 Month`, `+3 Months`, etc.), or clearing the date will no longer close the modal immediately.
> - **Commit on Done**: Changes are persisted to Firestore via `onUpdateGoalDate` and the popup closes *only* when the user explicitly clicks the green "Done" button.
> - **Cancel/Close Affordance**: Closing via the `(X)` button or clicking outside dismisses the modal without applying unsaved date changes.
> - **Zero Outside Modifications**: As requested, changes are strictly limited to the target date popup logic inside `GoalDetailView.tsx`.

---

### 1. Overview & Core Concept

- **What It Does**: Introduces a staged editing workflow for the Goal Target Date popup. Users can freely explore dates, switch between presets, or clear dates without being prematurely dismissed back to the main view.
- **Key Value**: Improves touch ergonomics and user confidence by requiring explicit confirmation ("Done") before committing changes to the database.

---

### 2. User Experience & Visual Design

- **Draft Selection**:
  - The calendar updates visually as the user browses and picks days, showing the highlighted date immediately in the preview.
  - Quick presets update the preview without closing the modal.
  - "Clear Date" button resets the draft date without exiting the modal.
- **Explicit Save Action**:
  - A prominent emerald "Done" button (`bg-emerald-500 text-black font-bold`) saves the selected date and closes the dialog.
  - The goal header updates immediately.

---

### 3. Key Product Decisions & Trade-Offs

- **Local State Buffering**:
  - *Chosen Approach*: Track `draftTargetDate` initialized from `goal.targetDate || ''` when the popup opens.
  - *Why*: Allows multi-step adjustments and deliberate confirmation before triggering network writes.

---

### 4. Technical Architecture & Component Changes *(Technical Reference)*

#### State Flow

```
Goal Header [ Target 2026-11-20 ]
   │
   ▼ User taps target date badge
Opens Modal: draftTargetDate initialized to goal.targetDate
   │
   ├─► User picks date / clicks preset ──► Updates draftTargetDate (popup stays OPEN)
   ├─► User clicks Clear Date           ──► Clears draftTargetDate (popup stays OPEN)
   │
   ▼ User clicks "Done"
Calls onUpdateGoalDate(goal.id, draftTargetDate)
   │
   ▼ Modal closes & Firestore updates
```

#### Files to Modify:
- **`src/components/GoalDetailView.tsx`**: Add `draftTargetDate` state; connect `DatePickerInput` `onChange` to `setDraftTargetDate`; wire the "Done" button to persist `draftTargetDate` and close the dialog.
