# Body Part Selection Flow - Implementation Plan

## ✅ Completed (Part 1/4)
- Added `BODY_PART_GROUPS` and `SPECIFIC_BODY_PARTS` definitions to `program.ts`
- Updated `DiagnosisAssistantResponse` with `selectedBodyGroup` and `selectedBodyPart` fields
- No breaking changes to existing functionality

## 🔲 TODO (Part 2/4): Update Diagnosis Prompt

**File:** `src/app/api/prompts/diagnosisPrompt.ts`

### Changes Needed:

1. **Add body part selection logic** before pain assessment:
   ```typescript
   **BODY PART SELECTION (when no body part pre-selected):**
   1. If selectedBodyGroup is null:
      - Ask: "Which body area is bothering you?"
      - followUpQuestions: ["Neck", "Shoulders", "Arms", "Chest", "Abdomen", "Back", "Hips & Glutes", "Legs"]
      - Set selectedBodyGroup in JSON
   
   2. If selectedBodyGroup is set but selectedBodyPart is null:
      - Ask: "Which specific part of your [group]?"
      - followUpQuestions: [specific parts based on group from SPECIFIC_BODY_PARTS]
      - Set selectedBodyPart in JSON
   
   3. Once both are set, continue with normal onset → painScale → etc. flow
   ```

2. **Update JSON structure** to include:
   ```json
   {
     "selectedBodyGroup": null,
     "selectedBodyPart": null,
     ...existing fields...
   }
   ```

3. **Update flow order**:
   - Old: onset → painScale → painCharacter → ...
   - New: selectedBodyGroup → selectedBodyPart → onset → painScale → painCharacter → ...

4. **Add examples** for body part selection in the prompt

## 🔲 TODO (Part 3/4): Update Assistant Route

**File:** `src/app/api/assistant/route.ts`

### Changes Needed:

1. **Pass body part groups and specific parts** to the diagnosis prompt:
   ```typescript
   import { BODY_PART_GROUPS, SPECIFIC_BODY_PARTS } from '@/app/types/program';
   
   // In the diagnosis payload:
   const bodyPartGroups = BODY_PART_GROUPS.join(', ');
   const specificPartsJson = JSON.stringify(SPECIFIC_BODY_PARTS);
   
   // Replace in prompt:
   systemMessage = systemMessage
     .replace('{{BODY_PART_GROUPS}}', bodyPartGroups)
     .replace('{{SPECIFIC_BODY_PARTS}}', specificPartsJson);
   ```

2. **Handle empty body part** in payload:
   - If `payload.selectedBodyGroupName` is undefined/null, replace `{{BODY_PART}}` with `"(not yet selected)"`
   - The diagnosis assistant will ask for it first

## 🔲 TODO (Part 4/4): Connect to 3D Viewer

**File:** `src/app/hooks/usePartChat.ts` and `src/app/components/3d/HumanViewer.tsx`

### Changes Needed:

1. **In `usePartChat.ts`:**
   - Watch for `assistantResponse.selectedBodyGroup` changes
   - When it updates, call a callback to select that group on the 3D model
   - Watch for `assistantResponse.selectedBodyPart` changes
   - When it updates, zoom to that specific part

2. **Add callback to `usePartChat`:**
   ```typescript
   useEffect(() => {
     if (assistantResponse?.selectedBodyGroup && !selectedGroups.length) {
       onBodyGroupSelected?.(assistantResponse.selectedBodyGroup);
     }
   }, [assistantResponse?.selectedBodyGroup]);
   
   useEffect(() => {
     if (assistantResponse?.selectedBodyPart) {
       onBodyPartSelected?.(assistantResponse.selectedBodyPart);
     }
   }, [assistantResponse?.selectedBodyPart]);
   ```

3. **In `HumanViewer.tsx`:**
   - Map body group names to `bodyPartGroups` config (e.g., "Back" → `bodyPartGroups.back`)
   - Call `setSelectedGroup` when group is selected
   - Map specific part names to `AnatomyPart` objects
   - Call `setSelectedPart` when specific part is selected

4. **Add body group → config mapping:**
   ```typescript
   const BODY_GROUP_TO_CONFIG: Record<string, keyof typeof bodyPartGroups> = {
     'Neck': 'neck',
     'Shoulders': 'shoulders', // may need to add to bodyPartGroups.ts
     'Arms': 'arms', // may need to add
     'Chest': 'chest',
     'Abdomen': 'abdomen',
     'Back': 'back',
     'Hips & Glutes': 'glutes',
     'Legs': 'legs', // may need to add
   };
   ```

## Migration Strategy

### Phase 1: Add New Fields (✅ Done)
- Types updated
- No breaking changes
- All existing code still works

### Phase 2: Update Prompt
- Diagnosis assistant learns to ask for body part if not provided
- Backward compatible: if body part already selected, skip these questions

### Phase 3: Connect Backend
- Assistant route passes the body part data
- Still backward compatible

### Phase 4: Connect Frontend
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

## File Summary

**Modified:**
- ✅ `src/app/types/program.ts` - Added BODY_PART_GROUPS, SPECIFIC_BODY_PARTS
- ✅ `src/app/types/index.ts` - Added selectedBodyGroup, selectedBodyPart to DiagnosisAssistantResponse
- 🔲 `src/app/api/prompts/diagnosisPrompt.ts` - Add body part selection logic
- 🔲 `src/app/api/assistant/route.ts` - Pass body part data to prompt
- 🔲 `src/app/hooks/usePartChat.ts` - Watch for selections, trigger 3D updates
- 🔲 `src/app/components/3d/HumanViewer.tsx` - Handle body group/part selection callbacks
- 🔲 `src/app/config/bodyPartGroups.ts` - May need to add missing groups (shoulders, arms, legs)

**Next Immediate Step:**
Update `diagnosisPrompt.ts` to implement the two-step body part selection flow.

