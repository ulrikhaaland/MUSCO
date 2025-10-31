# Musculoskeletal Assistant Architecture

## Overview

The Musculoskeletal Assistant is a **unified, mode-agnostic chat system** that supports two interaction modes:
- **`diagnosis`** - Pain assessment, red flag detection, and symptom collection
- **`explore`** - Anatomy education, exercise guidance, and training tips

Both modes share the **same infrastructure** and use **identical JSON output structures** for consistency and maintainability.

---

## Core Components

### 1. Unified Chat Path (`send_message_chat`)

**Location:** `src/app/api/assistant/route.ts` (line ~71)

**Purpose:** Single API endpoint that handles both diagnosis and explore modes.

**Flow:**
```
Frontend → send_message_chat → Mode Router (if needed) → Chat Completion → StreamParser → Structured SSE → Frontend
```

**Key Features:**
- Mode-agnostic streaming
- Uses OpenAI chat-completions API (not Assistants API)
- Automatic mode detection via router on first message
- Rate limiting for free-tier users
- Structured output via `StreamParser`

---

### 2. StreamParser

**Location:** `src/app/api/assistant/stream-parser.ts`

**Purpose:** Parses raw LLM output into structured SSE events for progressive UI updates.

**Responsibilities:**
- Extract message text and emit `text` events
- Parse `<<JSON_DATA>>...<<JSON_END>>` blocks
- Extract `followUpQuestions` and emit `followup` events incrementally
- Detect program generation patterns (e.g., "Recovery only") and augment questions with `generate: true` and `programType`
- Emit `assistant_response` events with diagnosis data
- Emit `complete` event when stream finishes
- Auto-generate "Answer in chat" fallback if no follow-ups provided

**Input:** Raw LLM text stream  
**Output:** Structured SSE events:
```typescript
{type: 'text', content: string}
{type: 'followup', question: Question}
{type: 'assistant_response', response: DiagnosisAssistantResponse}
{type: 'complete'}
```

---

### 3. Mode Router

**Location:** `src/app/api/assistant/route.ts` (line ~270-311)

**Purpose:** Automatically determine `diagnosis` vs `explore` mode on first message.

**Trigger:** When `payload.mode` is undefined and `messages.length === 0`

**Process:**
1. Call `getChatCompletion` with `chatModeRouterPrompt`
2. Parse JSON response for `{chatMode: 'diagnosis' | 'explore'}`
3. Fallback to regex-based heuristics if parsing fails
4. Default to `explore` if router fails entirely

**Models Used:** Defined in `src/app/api/assistant/models.ts`

---

### 4. System Prompts

**Diagnosis Prompt:** `src/app/api/prompts/diagnosisPrompt.ts`
- Guides LLM through structured pain assessment
- Enforces 7-question framework (onset, painScale, etc.)
- Detects red flags and triggers immediate care recommendations
- Outputs `DiagnosisAssistantResponse` JSON

**Explore Prompt:** `src/app/api/prompts/explorePrompt.ts`
- Focuses on anatomy education and exercise guidance
- Naturally guides users toward program generation
- Outputs minimal JSON (no diagnosis fields)
- Enforces program generation format with `generate: true` and `programType`

**Common Requirements:**
- Both use `<<JSON_DATA>>` wrapper
- Both require `followUpQuestions` array with `chatMode` on each option
- Both support `{{BODY_PART}}` placeholder injection
- Both respect `SESSION_LANGUAGE` from `<<LANGUAGE_LOCK>>`

---

### 5. Model Configuration

**Location:** `src/app/api/assistant/models.ts`

Centralized model definitions with environment variable overrides:
```typescript
CHAT_MODEL        // gpt-4o (diagnosis + explore)
PROGRAM_MODEL     // gpt-4.1-mini (program generation)
FOLLOWUP_MODEL    // gpt-4o-mini (unused, legacy)
ROUTER_MODEL      // gpt-4o-mini (mode routing)
```

---

## Data Flow

### Chat Message Flow

```
┌──────────────┐
│   Frontend   │
│  (useChat)   │
└──────┬───────┘
       │ sendChatMessage(message, {mode, ...})
       ▼
┌──────────────────────────────────────────────────┐
│  Backend: send_message_chat                      │
│  ┌────────────────────────────────────────────┐  │
│  │ 1. Mode Router (if needed)                 │  │
│  │    ├─ Call getChatCompletion with router   │  │
│  │    └─ Determine diagnosis vs explore       │  │
│  ├────────────────────────────────────────────┤  │
│  │ 2. Build System Message                    │  │
│  │    ├─ Select prompt (diagnosis/explore)    │  │
│  │    ├─ Inject {{BODY_PART}} placeholder     │  │
│  │    └─ Add <<LANGUAGE_LOCK>>                │  │
│  ├────────────────────────────────────────────┤  │
│  │ 3. Stream Chat Completion                  │  │
│  │    ├─ Call streamChatCompletion()          │  │
│  │    └─ Get raw LLM text chunks              │  │
│  ├────────────────────────────────────────────┤  │
│  │ 4. StreamParser                            │  │
│  │    ├─ Parse <<JSON_DATA>> blocks           │  │
│  │    ├─ Extract followUpQuestions            │  │
│  │    ├─ Detect program generation            │  │
│  │    └─ Emit structured SSE events           │  │
│  └────────────────────────────────────────────┘  │
└──────┬───────────────────────────────────────────┘
       │ SSE Stream
       ▼
┌──────────────────────────┐
│  Frontend (useChat)      │
│  ├─ text event           │─ Update message content
│  ├─ followup event       │─ Add follow-up question
│  ├─ assistant_response   │─ Update diagnosis state
│  └─ complete event       │─ Mark stream finished
└──────────────────────────┘
```

### Program Generation Flow

```
User clicks "Recovery only" button
       │
       ▼
┌─────────────────────────────┐
│ Backend: StreamParser       │
│ ├─ Detects program pattern  │
│ ├─ Augments question with:  │
│ │  ├─ generate: true         │
│ │  └─ programType: recovery  │
│ └─ Emits followup event     │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ Frontend: usePartChat       │
│ ├─ Detects generate=true    │
│ └─ Calls onGenerateProgram()│
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ HumanViewer                 │
│ ├─ Opens ExerciseQuestionnaire
│ └─ Passes diagnosis data    │
└─────────────────────────────┘
```

---

## Key Design Decisions

### 1. **Why Unified?**
- **DRY Principle:** Both modes use identical infrastructure, reducing code duplication
- **Consistent UX:** Same follow-up mechanism, same streaming behavior
- **Easier Maintenance:** Changes to one mode automatically benefit the other
- **Shared StreamParser:** Single source of truth for parsing LLM output

### 2. **Why Chat-Completions over Assistants API?**
- **Speed:** ~2-3x faster than Assistants API
- **Control:** Direct access to streaming chunks for progressive UI
- **Simplicity:** No thread/assistant management overhead
- **Flexibility:** Easier to customize system messages per request

### 3. **Why Backend Parsing?**
- **Reliability:** Server-side parsing is more robust than frontend regex
- **Consistency:** Single parser ensures uniform behavior
- **Program Detection:** Backend can augment questions with metadata before frontend receives them
- **Security:** LLM output validation happens server-side

---

## Migration Path (If Needed)

To add a new mode:
1. Create new system prompt in `src/app/api/prompts/[mode]Prompt.ts`
2. Add mode to router prompt (`routePrompt.ts`)
3. Update `send_message_chat` to handle new mode (line ~314-316)
4. Update frontend types (`src/app/types/index.ts`)
5. No changes needed to `StreamParser` or `useChat` (mode-agnostic)

---

## Troubleshooting

**Issue:** Follow-up questions not appearing  
**Fix:** Check LLM is outputting `followUpQuestions` array with `chatMode` on each item

**Issue:** Program generation not triggering  
**Fix:** Ensure `StreamParser` detects pattern (e.g., "Recovery only") and frontend checks for `generate: true`

**Issue:** Duplicate questions  
**Fix:** Verify conversation history is being passed in `messages` array

**Issue:** Wrong mode selected  
**Fix:** Check router prompt logic or explicitly pass `mode` from frontend

---

## Performance Optimization

- **Token Limits:** Diagnosis sends ALL turns, explore sends last 6 turns
- **Model Selection:** Use cheaper models for routing, powerful models for chat
- **Streaming:** Progressive UI updates as LLM generates text
- **Rate Limiting:** Free-tier token reservation prevents abuse

---

## Related Files

- `src/app/hooks/useChat.ts` - Frontend chat state management
- `src/app/hooks/usePartChat.ts` - Mode selection and follow-up handling
- `src/app/api/assistant/openai-server.ts` - OpenAI API wrappers
- `src/app/components/ui/ChatMessages.tsx` - UI rendering
- `src/app/types/index.ts` - Shared TypeScript types





