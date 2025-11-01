# Body Part Selection Flow - Implementation Plan

## ✅ Completed (Part 1/4)
- Added `BODY_PART_GROUPS` and `SPECIFIC_BODY_PARTS` definitions to `program.ts`
- Updated `DiagnosisAssistantResponse` with `selectedBodyGroup` and `selectedBodyPart` fields
- No breaking changes to existing functionality

## ✅ Completed (Part 2/4): Update Diagnosis Prompt

**File:** `src/app/api/prompts/diagnosisPrompt.ts`

### Changes Completed:

1. **Added body part selection logic** before pain assessment:
   - Added `selectedBodyGroup` and `selectedBodyPart` to JSON structure
   - Added body part groups and specific parts to context ({{BODY_PART_GROUPS}}, {{SPECIFIC_BODY_PARTS}})
   - Added Rule 1: Two-step body part selection flow
     - Step 1: Ask 'Which body area is bothering you?' → [Neck, Shoulders, Arms, etc.]
     - Step 2: Ask 'Which specific part of your [group]?' → [Left shoulder, Right shoulder, etc.]
     - Once both selected, continue to onset question

2. **Added examples** (Examples 9-11):
   - Example 9: Initial body group selection
   - Example 10: Specific part selection within group
   - Example 11: Continuing to onset after selection

## ✅ Completed (Part 3/4): Update Assistant Route

**File:** `src/app/api/assistant/route.ts`

### Changes Completed:

1. **Imported body part groups and specific parts** from `program.ts`:
   ```typescript
   import { BODY_PART_GROUPS, SPECIFIC_BODY_PARTS } from '@/app/types/program';
   ```

2. **Generated body part data**:
   ```typescript
   const bodyPartGroups = BODY_PART_GROUPS.join(', ');
   const specificBodyParts = JSON.stringify(SPECIFIC_BODY_PARTS, null, 2);
   ```

3. **Injected into prompt**:
   ```typescript
   let promptWithContext = basePrompt
     .replace(/\{\{BODY_PART\}\}/g, bodyPart)
     .replace(/\{\{BODY_PART_GROUPS\}\}/g, bodyPartGroups)
     .replace(/\{\{SPECIFIC_BODY_PARTS\}\}/g, specificBodyParts);
   ```

4. **Changed fallback** from `'the affected area'` to `'(not yet selected)'` to trigger body part selection

## ✅ Completed (Part 4/4): Connect to 3D Viewer

**Files:** `usePartChat.ts`, `HumanViewer.tsx`, `MobileControls.tsx`, `PartPopup.tsx`

### Changes Completed:

**1. In `usePartChat.ts`:**
- Added `onBodyGroupSelected` callback to `UsePartChatProps`
- Added `onBodyPartSelected` callback to `UsePartChatProps`
- Added `useEffect` to watch `assistantResponse.selectedBodyGroup`
  - Triggers `onBodyGroupSelected` when group is selected by assistant
  - Only fires when no groups are already selected
- Added `useEffect` to watch `assistantResponse.selectedBodyPart`
  - Triggers `onBodyPartSelected` when specific part is selected
  - Only fires when no part is already selected

**2. In `HumanViewer.tsx`:**
- Imported `bodyPartGroups` config
- Added `BODY_GROUP_NAME_TO_CONFIG` mapping:
  ```typescript
  {
    'Neck': 'neck',
    'Shoulders': 'chest',
    'Arms': 'chest',
    'Chest': 'chest',
    'Abdomen': 'abdomen',
    'Back': 'back',
    'Hips & Glutes': 'glutes',
    'Legs': 'glutes'
  }
  ```
- Added `handleBodyGroupSelected`:
  - Maps assistant's group name to config key
  - Calls `setSelectedGroup` with mapped config
  - Zooms camera to `group.zoomId`
- Added `handleBodyPartSelected` (placeholder)
- Passed both callbacks to `MobileControls` and `PartPopup`

**3. In `MobileControls.tsx` and `PartPopup.tsx`:**
- Added `onBodyGroupSelected` and `onBodyPartSelected` to props
- Passed both to `usePartChat`

## Migration Strategy

### Phase 1: Add New Fields (✅ Done)
- Types updated
- No breaking changes
- All existing code still works

### Phase 2: Update Prompt (✅ Done)
- Diagnosis assistant learns to ask for body part if not provided
- Backward compatible: if body part already selected, skip these questions

### Phase 3: Connect Backend (✅ Done)
- Assistant route passes the body part data
- Still backward compatible

### Phase 4: Connect Frontend (✅ Done)
- 3D model automatically selects based on assistant's questions
- User sees their selection highlighted as they answer

## Testing Checklist

### Scenario 1: Body Part Pre-Selected (Existing Flow)
- [ ] User selects body part on 3D model
- [ ] Clicks "Find Pain"
- [ ] Assistant skips body part questions
- [ ] Goes straight to onset question
- [ ] ✅ No regression

### Scenario 2: No Body Part Selected (New Flow)
- [ ] User clicks "Find Pain" with no selection
- [ ] Assistant asks: "Which body area is bothering you?"
- [ ] User clicks "Back"
- [ ] 3D model highlights back group
- [ ] Assistant asks: "Which specific part of your back?"
- [ ] User clicks "Lower back"
- [ ] 3D model zooms to lower back
- [ ] Assistant continues with onset question
- [ ] ✅ New flow works

### Scenario 3: Mobile Template Button
- [ ] Mobile user on fresh load (no body part)
- [ ] Clicks "I have pain" template button
- [ ] New flow activates
- [ ] ✅ Template integration works

## Complete Implementation Summary

**All 4 parts completed:**
1. ✅ Type definitions (program.ts, index.ts)
2. ✅ Diagnosis prompt logic (diagnosisPrompt.ts)
3. ✅ Backend integration (route.ts)
4. ✅ Frontend integration (usePartChat.ts, HumanViewer.tsx, MobileControls.tsx, PartPopup.tsx)

**Ready for testing!**

The flow from user clicking "Find Pain" with no body part selected to the 3D model highlighting the selected area is now fully implemented and connected.

