# General Description of the App

## Purpose
The app's purpose is to make it easy and accessible for people to learn how to fix their musculoskeletal issues.

---

## Features

### Interactive 3D-Rendered Musculoskeletal Model
- Users can zoom, pan, and click on different parts of the model.
- Clicking on a specific part zooms in and reveals the Chat Interface.
 - Explain Selection: In Explore mode, picking a structure shows a right‑aligned BioDigital label with a loading state that streams a concise explanation (≤80 words). Desktop only (mobile explainer disabled). Users can toggle this via the desktop controls; preference is persisted in localStorage key `explainer_enabled`. Revisiting a part returns the cached text instantly without re‑streaming.

#### Chat Interface
The chat system provides an intelligent, contextual conversation experience with a dual‑mode assistant:

**Dual‑mode Architecture (shared thread)**
- **Explore mode**: Educates about anatomy, biomechanics, and exercise principles
- **Diagnosis mode**: Conducts structured pain assessment and generates recovery programs
- **Mode control**: Frontend sets an explicit `chatMode` on follow‑ups; backend runs mode‑specific assistants (Explore and Diagnosis) on the same OpenAI Thread with per‑run system instructions, including a session‑language lock. One thread per chat simplifies persistence and retrieval.

**Initial Options**
When a body part is selected, users see three primary quick-start options:
1. **"Find Pain"** - Launches diagnosis mode for pain assessment and recovery programs
2. **"Learn More"** - Activates exploration mode for educational content about anatomy/function
3. **"Build Program"** - Generates a program after assessment (recovery‑centric; exercise‑only mode has been retired)

**Interactive Chat Features**
- **Streaming Responses**: Real-time message streaming with ≤80 word responses
- **Structured Follow-up Questions**: Explore mode uses device-aware counts (mobile up to 3, desktop up to 6). Diagnosis mode is not capped by device.
- **Contextual Adaptation**: Questions adapt based on selected body part and conversation history
- **Multi-language Support**: Responds in user's language preference (English/Norwegian)
- **Free-form Input**: Text field available for custom questions beyond quick-replies
- **Auto-scrolling**: Intelligent scrolling that respects user behavior while maintaining usability
- **Error Handling**: Connection issues handled gracefully with retry options
- **Mobile Optimization**: Touch-friendly interface with smooth animations
 - **Explain Selection Labels**: Model‑anchored labels update progressively as text streams in, then finalize.

**Rate-limit UX**
- Hitting the daily free cap shows a full‑screen backdrop overlay prompting login/subscribe; underlying page state (3D model selection, chat transcript) is preserved and restored after auth.
- Explain Selection requests count toward the same daily token bucket as chat (user and anonymous, the latter keyed by cookie `musco_anon_id`). The backend emits structured warnings on limit hits, and the client applies a brief suppression window after a 429 to avoid hammering.

---

## Pricing & Access

### Free
- Explore assistant access with a daily message cap (see Limits below)
- Generate the first week program from the assessment
- Exercise library, videos, and day-by-day view
- Program calendar & progress
- No follow-up program generation (gated)

### Premium (Subscription)
- Weekly follow-up programs tailored from your feedback
- Higher model limits with priority access for faster responses
- Full exercise library with modifications and safety notes
- Calendar & progress across multiple weeks
- Multi-language content (EN/NB) across all text and UI
- Cancel anytime

---

## Access Control & Limits

The app enforces simple, transparent rules:
- Follow-up generation: Premium only. Non-paying users are prompted to subscribe when attempting to generate the next week.
- Chat/model interactions (Free): Daily message cap (default: 20 messages/day), aggregated and automatically throttled when exceeded.
- Chat/model interactions (Premium): Significantly higher limits and priority queueing (no daily cap for normal use; fair-use protections apply).
- Logging and analytics: Only high-signal checkpoints are logged (see Logging rules), with no PII.

> Implementation notes
> - Gating is enforced both client-side (navigation) and server-side where applicable (API route checks), using user subscription status in Firestore: `isSubscriber`, `subscriptionStatus`, and `currentPeriodEnd`.
> - Webhooks from Stripe (`customer.subscription.*` and `checkout.session.completed`) update these fields automatically, so access reflects the latest billing state without manual intervention.

### Subscription UX Flow
- Subscribe page: Dedicated page presenting benefits and pricing, with Monthly and Annual options. Email is prefilled when available.
- Success page: After checkout, the app confirms and returns to the page that initiated the subscribe flow (e.g., /app → /subscribe → success → /app; /program → /subscribe → success → /program), preserving chat/model state.
- Manage subscription: From Profile → Subscription card, users can open the Stripe Billing Portal to update payment method, view invoices, or cancel.
- Gating: If a non‑subscriber tries to generate a follow‑up, they’re routed to Subscribe. Subscribers proceed to the Feedback flow.
**Chat Behavior**
- **Concise Communication**: Bullet-point responses, no filler words or redundant acknowledgments
- **Progressive Disclosure**: Follow-up questions build naturally on previous responses
- **Context Awareness**: Avoids repeating information or asking duplicate questions
- **Visual Consistency**: Smooth animations, proper spacing, prevents visual jumping
- **Loading States**: Clear feedback during response generation with typing indicators

---

## State-of-the-Art LLM Integration
- Powered by OpenAI's Assistants API (Threads) with per‑run system instructions
- Session‑language lock (SESSION_LANGUAGE) ensures all user‑visible text stays in the chosen language across the thread
- **Explore mode**: Expert musculoskeletal education (exercise physiology, biomechanics, anatomy, PT principles)
- **Diagnosis mode**: Structured pain assessment using evidence-based clinical questioning protocols
- Models: Explore/Diagnosis assistants currently run on gpt‑4.1‑mini (Assistants support). Explain‑Selection uses Responses API with gpt‑5‑mini. Program generation uses Chat Completions: gpt‑5‑mini (initial) and gpt‑5 (follow‑ups).
- Context-aware responses based on selected body part, user language preference, and conversation history
- Advanced safety protocols with red flag detection for serious medical conditions
 
### Explain Selection – Streaming Microcopy
- Backend: streaming‑only endpoint `POST /api/explain-selection?stream=1` (SSE).
  - Input: `{ partId, displayName, partType, side, language: EN|NB, readingLevel }`.
  - Emits: `{"type":"delta","delta":"..."}` chunks and a `{"type":"final","payload":{"text":"..."}}` message.
- Frontend (desktop only): `useExplainSelection` starts SSE on selection, parses chunks, and updates the model label live. Responses are capped to ≤80 words. The explainer can be turned off from the desktop controls; the choice is remembered in localStorage.
- Caching: lightweight client‑side memo cache keyed by `(partId|language|readingLevel)` avoids re‑streaming on revisits.
- UI: `labels.create` shows “Loading…” with `pinGlow`; `labels.update` streams text; glow stops on final.

#### Example Workflow - Exploration Mode
1. **Selection**: User selects the bicep on the 3D model
2. **Initial Options**: Chat popup appears with: "Find Pain", "Learn More", and "Build Program" (program generation is recovery‑centric)
3. **User Action**: User clicks "Learn More" to enter exploration mode
4. **Streaming Response**: Exploration assistant streams educational content about bicep anatomy and function (≤120 words). When a structure is picked, the on‑model label also streams the same explainer.
5. **Follow-up Questions**: Three relevant quick-reply buttons appear:
   - "How to train bicep?"
   - "What is bicep function?"
   - "Build Program" (recovery‑centric)
6. **Educational Flow**: User can continue learning or transition to program generation
7. **Program Transition**: When ready, assistant naturally guides toward "Build Program" (recovery program)

#### Example Workflow - Diagnosis Mode
1. **Selection**: User selects shoulder on the 3D model
2. **User Action**: User clicks "Find Pain" to enter diagnosis mode
3. **Structured Assessment**: Diagnosis assistant conducts systematic 7‑question clinical assessment:
   - Onset and mechanism of injury
   - Specific pain location (finger-point precision)
   - Pain intensity (0–10 via five bins: 1–2, 3–4, 5–6, 7–8, 9–10)
   - Pain character (sharp, dull, burning, aching)
   - Aggravating factors
   - Relieving factors
   - Pain pattern (derived from aggravating/relieving when possible; otherwise asked explicitly)
4. **Follow-up Options**: Each question provides specific response choices (e.g., "Suddenly", "Gradually", "Unknown" for onset)
5. **Safety Screening**: Red flag detection for serious conditions requiring immediate medical care
6. **Program Selection**: Once assessment complete, users choose from two program options:
   - "Recovery Only" - Focus on healing and pain management
   - "Exercise + Recovery" - Combined approach with strengthening

---

## Recovery Program
The app generates personalized recovery programs through intelligent assessment:

**Program Generation Triggers**
- **Exploration Mode**: Assistant can guide users toward program building after educational content
- **Diagnosis Mode**: Programs offered after completing structured pain assessment
- **Direct Request**: Users can select "Build Program" from initial options
- **Context-Aware**: Programs adapt based on selected body part and conversation context

**Program Type**
- Recovery programs focus on injury rehabilitation and pain management (exercise‑only mode removed).
  Future combined programs may return; for now generation is recovery‑centric.

**Generation Process**
- **Assessment-Driven**: Programs generated only after collecting sufficient user information
- **Body Part Specific**: Targeted programs based on 3D model selection
- **Safety-First**: Red flag screening prevents program generation for serious conditions
- **Personalized Parameters**: 
  - Target areas identified from assessment
  - Activities to avoid based on pain patterns
  - Time frames determined by assistant based on diagnosis
  - Program complexity adapted to user needs

**Program Features**
- **Structured Progression**: Multi-day programs with evidence-based exercise selection
- **Contextual Integration**: Seamlessly generated within chat conversation flow
- **Safety Protocols**: Automatic exclusion of contraindicated activities
- **User-Driven Selection**: Clear program type choice presented after assessment completion
- **Flexible Approach**: Programs can be purely rehabilitative, fitness-focused, or a combination of both

### Recovery Program Library
The app features a comprehensive library of pre-built 4-week recovery programs for common musculoskeletal conditions:

**Available Recovery Programs**
- **Lower Back Pain**: Non-specific mechanical back pain with core stabilization focus
- **Runner's Knee**: Patellofemoral pain syndrome with strengthening and mobility
- **Shoulder Impingement**: Rotator cuff rehabilitation and postural correction
- **Ankle Sprain**: Progressive loading and proprioception training
- **Tennis Elbow**: Lateral epicondylitis with eccentric strengthening
- **Tech Neck**: Cervical spine mobility and postural muscle strengthening
- **Plantar Fasciitis**: Foot and calf rehabilitation with load management
- **Hamstring Strain**: Progressive loading and flexibility restoration
- **Upper Back & Core**: Postural dysfunction and thoracic mobility
- **Core Stability**: Deep core strengthening and spinal stabilization

**Program Structure**
- **4-Week Progressive Design**: Each program consists of 4 separate weekly programs (28 days total)
- **Monday-Wednesday-Friday Pattern**: Exercise days follow a 3x/week schedule (days 1, 3, 5 of each week)
- **Active Recovery Days**: Rest days include light mobility and activation exercises (RPE 3-4)
- **Progressive Loading**: Intensity and complexity increase weekly based on tissue healing phases
- **Exercise Modifications**: Each exercise includes specific modifications for different pain levels

### User Account & Program Management System

**User Profile Management (ProfilePage)**
- **Personal Information**: Name, email, phone number, date of birth, profile image upload
- **Fitness & Health Profile**: Exercise preferences, health goals, dietary preferences, target body areas
- **Pain History**: Automatically populated from recovery program assessments
- **Multi-language Support**: English/Norwegian interface with data normalization
- **Advanced Features**: Expandable sections, inline editing, auto-save, questionnaire integration

**Program Management & Calendar System**
- **Save & Access Programs**: Save generated programs to personal account with dashboard access
- **Calendar Interface (CalendarPage)**: Visual calendar showing all saved programs with progress tracking
- **Program Navigation**: Click any day to view detailed exercises, handle multiple concurrent programs
- **Progress Tracking**: Visual indicators for completed vs. upcoming sessions across all programs

### Authentication System
Secure, user-friendly authentication with email verification:

**Login Flow (AuthCodeInput & LoginPage)**
- **Email-based Authentication**: Users enter email address for account access
- **Verification Code System**: 6-digit codes sent via email for secure login
- **Code Input Interface**: 
  - Individual digit input fields with auto-focus progression
  - Paste support for copying codes from email
  - Visual feedback for valid/invalid codes
  - Automatic submission when all digits entered
- **Resend Functionality**: Users can request new verification codes
- **Error Handling**: Clear error messages for invalid codes or network issues
- **Loading States**: Visual feedback during authentication process
- **Responsive Design**: Optimized for both desktop and mobile input

### Program Display & User Interface

**ExerciseProgramPage & Calendar Integration**
- **Weekly Calendar View**: Visual calendar showing exercise days, rest days, and progress indicators
- **Day Navigation**: Click any day to view detailed exercises, sets, reps, and modifications
- **Week Navigation**: Easy navigation between program weeks with progress indicators
- **Multi-program Support**: Handle multiple concurrent programs with visual organization
- **Save Functionality**: One-click save to user account with authentication handling

**Individual Day Experience (ProgramDayComponent)**
- **Workout Overview**: Duration badge and contextual explanation of daily focus/goals
- **Exercise Cards**: Expandable cards with complete exercise information and video demonstrations
- **Body Part Filtering**: Smart filtering system allowing users to remove specific body parts from workouts (useful for avoiding painful movements)
- **Rest Day Optimization**: Special handling for recovery days with optional mobility exercises
- **Interactive Elements**: Touch-friendly interface with hover animations and smooth transitions

---

## Technical Implementation

### Chat System Architecture
The chat system is built with modern React patterns for optimal performance and user experience:

**Core Components**
- **ChatMessages**: Message rendering, streaming, auto-scroll, follow-up question handling
- **FollowUpQuestions**: Reusable component for consistent quick-reply button styling
- **PartPopup**: Desktop chat container with input controls
- **MobileControls**: Bottom sheet integration for mobile experience
- **usePartChat**: Custom hook managing chat state, mode switching, and initial questions
- **useChat**: Core chat functionality with streaming and message management

**Program & User Management Components**
- **ExerciseProgramPage**: Main program display with calendar view and week navigation
- **ProgramDayComponent**: Individual day view with exercise cards and body part filtering
- **ProfilePage**: Comprehensive user profile management with inline editing
- **CalendarPage**: Dedicated calendar interface for saved programs
- **AuthCodeInput**: Email verification code input with auto-focus and paste support
- **LoginPage**: Authentication entry point with loading states

**Assistant Integration**
- **Dual Mode System**: Seamless switching between Explore and Diagnosis modes (single assistant)
- **Threads**: One thread per conversation; frontend passes `chatMode` and hints (e.g., `maxFollowUpOptions`) to guide responses
- **Context Management**: Tracks conversation history and previous questions to avoid duplication
- **Translation Support**: Multi-language support with dynamic question generation
- **Mode Detection**: Intelligent detection of user intent to switch modes

**Key Technical Features**
- **Real-time Streaming**: Server-sent events for immediate response feedback
 - **Explain Selection Labels**: BioDigital `labels.create`/`labels.update` anchor educational blurbs with progressive streaming and instant client cache.
- **Dynamic Spacer System**: Intelligent height management for growing content with scroll support
- **Performance Optimized**: Component extraction, efficient re-render patterns, and cleanup optimizations
- **Auto-scroll Intelligence**: Respects user scroll behavior while maintaining usability

**User Experience & Design**
- **Responsive Design**: Seamless experience across desktop and mobile with touch optimization
- **Smooth Animations**: Staggered question appearances, touch feedback, reduced motion support
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support, 48px minimum touch targets
- **Visual Feedback**: Loading states, error handling with retry options, progressive disclosure

---

## App Flow
1. **Entry Point**:
   - User enters the web app and is prompted with a question:  
     - *Are you male or female?*  
       - Male  
       - Female
2. **Model Loading**:
   - An interactive 3D musculoskeletal model of the selected gender is loaded.

---

## UI Description
- The app uses a dark mode theme.
- Color schemes, buttons, text, and related details are provided in additional documentation.

---

## Developer Documentation
- Additional documentation is available upon request.
