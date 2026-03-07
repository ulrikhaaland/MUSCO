# Model Viewer Interaction Spec (Cross-Platform)

Status: Active  
Applies to: Web `HumanViewer` (mobile + desktop), Flutter `ModelViewerScreen` (mobile)  
Primary goal: consistent model selection, camera behavior, and control interactions across platforms.

## 1. Scope

This spec defines:
- 3D model selection semantics (group vs part)
- control button behavior (rotate, reset, gender switch)
- chat-driven selection behavior
- expected visual/interaction outcomes for parity

This spec does **not** define:
- program generation flows
- unrelated navigation/page behavior
- backend redesign

## 2. Canonical Selection Model

There are two selection levels:
- `selectedGroup` (required parent context)
- `selectedPart` (optional child inside selected group)

Valid states:
- `none`: no group, no part
- `group-only`: group selected, part unselected
- `group+part`: group selected, specific part selected

Invalid state:
- part selected while no group is selected

## 3. Tap Behavior (User on 3D Model)

### 3.1 First tap when no group is selected
- Input: tap any anatomical object
- Result: select that object’s **group only**
- Must **not** auto-select part on same tap
- Camera moves to group focus
- X-ray/highlight for group is enabled

### 3.2 Tap inside an already selected group
- If tapped part is different from current selected part:
  - select that part (`group+part`)
  - camera moves to part
- If tapped part is the currently selected part:
  - unselect part only
  - remain in `group-only`
  - camera returns to group focus

### 3.3 Tap outside current group
- Result: switch to new group in `group-only`
- clear previous part selection
- camera moves to new group focus

## 4. Native Event Robustness Rules

Because SDKs may emit rapid select/deselect/select sequences:
- first tap to a new group must stay `group-only` (duplicate same-object select events are ignored briefly)
- deselect events must not accidentally clear group selection
- if toggling part off, group visual selection must remain active in the viewer
- matching selected objects should use neutral/object-equivalence matching, not strict raw-ID equality

## 5. Chat-Driven Selection Behavior

When chat selects body group/part (follow-up or assistant response):
- If targeting a group: end in `group-only`
- If targeting a part: end in `group+part`
- On mobile, if `keepChatOpen=false`:
  - close overlay first
  - apply model selection after close transition delay
- If `keepChatOpen=true`:
  - apply immediately without closing overlay

## 6. Control Buttons

## 6.1 Rotate
- Behavior: perform a 180° orbit around current focus (group or part)
- If orbit API is unavailable, fallback is allowed, but 180° orbit is target behavior
- Button shows rotating/disabled state while action is in progress

## 6.2 Reset
- Clears part + group selection
- Disables x-ray/highlight selection state
- Resets scene/camera to neutral/default
- Ends in `none`

## 6.3 Gender Switch
- Switches model (`male <-> female`)
- Clears selection state (`none`)
- Loads corresponding module/model
- Controls unavailable while model is loading/changing

## 7. Visual Feedback Requirements

- Group-only: group visibly highlighted in 3D model
- Group+part: selected part visibly emphasized within selected group context
- Toggle-off part: immediate visual return to group-only highlight
- Selection labels in UI must always match model visual state

## 8. Platform Parity Contract

Implementations are considered consistent only if:
- same input tap sequence produces same state transitions
- same control taps produce same camera/selection outcomes
- chat-driven selection yields same final state
- transient native event ordering differences do not change final behavior

## 9. Acceptance Test Matrix

Minimum manual checks on each platform:

1. `none -> tap part A` => `group(A)-only`
2. `group(A)-only -> tap part A1` => `group(A)+part(A1)`
3. `group(A)+part(A1) -> tap part A1` => `group(A)-only`
4. `group(A)+part(A1) -> tap part A2` => `group(A)+part(A2)`
5. `group(A)-only -> tap part B1 (other group)` => `group(B)-only`
6. chat selects group C => `group(C)-only`
7. chat selects part C2 => `group(C)+part(C2)`
8. rotate from group-only and group+part => 180° orbit behavior
9. reset from each state => `none`
10. gender switch from each state => `none` on new model

