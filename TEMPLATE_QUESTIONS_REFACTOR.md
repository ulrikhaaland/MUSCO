# Template Questions Centralization & Router Bypass

## Problem
- Template questions like "What can you help me with?" were unnecessarily going through the router
- Template questions were hardcoded in multiple places, making maintenance difficult
- Router adds latency for questions where the mode is already known

## Solution

### 1. Created Centralized Template Questions File
**File:** `src/app/config/templateQuestions.ts`

- Defined `TemplateQuestion` interface with explicit `chatMode` field
- Created `GLOBAL_TEMPLATE_QUESTIONS` array for questions shown with no body part selected:
  - "What can you help me with?" → `explore`
  - "I have pain" → `diagnosis`
  - "Build an exercise program" → `explore`
- Created `BODY_PART_TEMPLATE_QUESTIONS` for future use when body part is selected

### 2. Updated MobileControls
**File:** `src/app/components/3d/MobileControls.tsx`

- Imported `GLOBAL_TEMPLATE_QUESTIONS`
- Replaced hardcoded buttons with `.map()` over template array
- Each button now includes `key`, `title` (description), and explicit `chatMode`

### 3. Enhanced Router Decision Logic
**File:** `src/app/hooks/logic/partChatDecision.ts`

Added clear comments explaining when router is bypassed:
- Template questions with explicit `chatMode` → **router bypassed** ✅
- First typed message (no chatMode) → **uses router** 🔄
- Follow-up questions with chatMode → **router bypassed** ✅

### 4. Updated Explore Prompt
**File:** `src/app/api/prompts/explorePrompt.ts`

Added instruction:
```
• Do NOT list follow-up options in the message text - they will be rendered as clickable buttons automatically
```

This prevents the LLM from writing "Follow-up options:" in the message body.

## Flow Diagram

```
User clicks "What can you help me with?"
       ↓
Template has chatMode: 'explore'
       ↓
decideMode() sees rawMode = 'explore'
       ↓
deferRouter = false (router bypassed!)
       ↓
modeForPayload = 'explore'
       ↓
Request goes directly to EXPLORE_MODEL
```

## Benefits
1. **Faster response:** No router latency for template questions
2. **Maintainable:** Single source of truth for all template questions
3. **Extensible:** Easy to add new templates or localize them
4. **Type-safe:** TypeScript interface ensures consistency
5. **Cleaner prompts:** LLM won't duplicate follow-up questions in message text

## Testing
When you click "What can you help me with?", check logs for:
- ✅ Should see: `event=fe_mode_decide ... modeForPayload=explore`
- ✅ Should NOT see: Router model call in backend logs
- ✅ Should go directly to explore assistant

## Future Improvements
- Add localization support for template questions
- Implement `BODY_PART_TEMPLATE_QUESTIONS` for context-specific templates
- Consider adding template questions to desktop (PartPopup)

