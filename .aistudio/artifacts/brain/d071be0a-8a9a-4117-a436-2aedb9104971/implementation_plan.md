# Milestone Cards: Full Heading Visibility with Horizontal Box Containment

Display 100% of the milestone heading text (no truncation or clipping) while strictly preventing horizontal text overflow beyond the card's width in `GoalDetailView.tsx`, with zero modifications to any other part of the application.

### User Review & Critical Decisions

> [!IMPORTANT]
> - **Full Heading Text Visibility**: Milestone titles will completely display their full text on screen without being truncated or cut off with `...`.
> - **Zero Horizontal Box Overflow**: The card width is strictly bounded (`min-w-0`, `max-w-full`, `overflow-hidden`). Long titles wrap seamlessly into multiple vertical lines (`whitespace-normal`, `break-words`, `[overflow-wrap:anywhere]`, `leading-snug`).
> - **Strict Isolated Scope**: *Only* the milestone card header styling in `src/components/GoalDetailView.tsx` will be modified. All other features, components, database interactions, and styles remain 100% untouched.

---

### 1. Overview & Core Concept

- **What It Does**: Formats milestone title headers to display all text content in full by wrapping text vertically across lines, while enforcing strict horizontal box width limits so text never spills past the card boundary or crowds action buttons.
- **Key Value**: Users can read the entire milestone title at a glance with zero text loss while maintaining clean card layout ergonomics on all screen widths.

---

### 2. User Experience & Visual Design

- **Full Text Layout**:
  - Entire milestone title is rendered cleanly with `whitespace-normal` and `break-words`.
  - The step badge (`w-6 h-6 shrink-0`) stays aligned at the top-left of the multi-line title.
  - Action buttons (`Trash2` and `ChevronUp/Down`) remain anchored on the top-right with `shrink-0`, immune to being squeezed.
  - Spacing and progress indicators (`X / Y completed · Z%`) sit cleanly below the wrapped heading.

---

### 3. Key Technical Architecture & CSS Specifications

#### Visual Component Layout

```
┌────────────────────────────────────────────────────────┐
│ [1]  This is a very long milestone title that wraps  [🗑][▼]│
│      completely across multiple lines without        │
│      overflowing the horizontal box length or        │
│      clipping any of the words                       │
│      2 / 4 completed · 50%                           │
│ ────────────────────────────────────────────────────── │
│ [ 50% Progress Bar ]                                   │
└────────────────────────────────────────────────────────┘
```

#### Exact CSS Modifications in `src/components/GoalDetailView.tsx`:

1. **Card Container**:
   - `className="w-full bg-zinc-950/80 border border-zinc-900 rounded-2xl overflow-hidden transition-all duration-200"`
2. **Milestone Header Flex Row**:
   - `className="p-4 flex items-start justify-between gap-3 bg-zinc-900/40 w-full min-w-0"`
3. **Trigger Button**:
   - `className="flex-1 flex items-start gap-3 text-left min-h-[44px] min-w-0 py-0.5"`
4. **Milestone Title Heading (`<h3>`)**:
   - Remove `truncate` completely.
   - Apply `text-sm font-semibold text-zinc-100 whitespace-normal break-words [overflow-wrap:anywhere] leading-snug` (with `line-through text-zinc-500` if completed).
5. **Progress Sub-line**:
   - `className="flex items-center flex-wrap gap-2 text-[11px] text-zinc-500 mt-1 font-mono tabular-nums"`
