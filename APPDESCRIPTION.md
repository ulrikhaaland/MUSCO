# General Description of the App

## Purpose
The app's purpose is to make it easy and accessible for people to learn how to fix their musculoskeletal issues.

---

## Features

### Interactive 3D-Rendered Musculoskeletal Model
- Users can zoom, pan, and click on different parts of the model.
- Clicking on a specific part of the musculoskeletal model zooms in on that part and reveals a pop-up box.

#### Chat Interface
The chat system provides an intelligent, contextual conversation experience:

**Initial Options**
- When a body part is selected, users see several quick-start options:
  1. **Learn more** (about this part)
  2. **I have an issue** (with this part)
  3. Additional contextual options based on the selected body part

**Interactive Chat Features**
- **Streaming Responses**: Real-time message streaming provides immediate feedback
- **Follow-up Questions**: After each response, the system presents relevant quick-reply buttons for common follow-up questions
- **Free-form Input**: A text field at the bottom allows users to ask any custom question
- **Auto-scrolling**: Chat automatically scrolls to keep new content visible
- **Error Handling**: Connection issues are handled gracefully with retry options
- **Mobile Optimization**: Touch-friendly interface with smooth animations

**Chat Behavior**
- Messages appear with smooth animations and proper spacing
- Follow-up questions are presented as easy-to-tap buttons
- The interface maintains spacing consistency to prevent visual jumping
- Users can scroll through message history while new content auto-scrolls
- Loading states provide clear feedback during response generation

---

## State-of-the-Art LLM Integration
- Powered by OpenAI's Assistant API with custom system instructions and documents.
- The LLM interacts directly with the musculoskeletal model, contextualizing responses based on the selected part and user actions.
- The LLM can:
  - Answer queries based on user-selected options.
  - Determine appropriate next steps when an option is clicked.

#### Example Workflow
1. **Selection**: User selects the bicep on the 3D model
2. **Initial Options**: Chat popup appears with quick-start options like "Learn more" and "I have an issue"
3. **User Action**: User clicks "Learn more" about the bicep
4. **Streaming Response**: LLM begins streaming contextual information about the bicep in real-time
5. **Follow-up Questions**: After the response completes, quick-reply buttons appear with relevant options:
   - "How to train the bicep?"
   - "What is the function of the bicep?"
   - "Why are the biceps important?"
   - "Show me bicep exercises"
6. **Continued Interaction**: User can either click a quick-reply button or type a custom question
7. **Program Generation**: If appropriate, the LLM may offer to generate a personalized exercise or recovery program

---

## Exercise/Recovery Program
The app can generate personalized exercise and recovery programs based on user needs:

**Program Generation Process**
- During chat, the LLM may identify opportunities to offer customized programs
- Users can explicitly request programs through follow-up questions or direct input
- The system asks qualifying questions to personalize the program:
  - Age and fitness level
  - Exercise frequency and experience
  - Specific issues or goals
  - Available equipment
  - Time constraints

**Program Features**
- **Structured Programs**: Multi-day programs with progressive difficulty
- **Exercise Database**: Access to comprehensive exercise library with proper form instructions
- **Recovery Focus**: Specialized programs for injury recovery and pain management
- **Contextual Recommendations**: Programs tailored to the specific body part selected
- **Integration**: Programs are seamlessly integrated into the chat experience

---

## Technical Implementation

### Chat System Architecture
The chat system is built with modern React patterns for optimal performance and user experience:

**Components**
- **ChatMessages**: Core message rendering and interaction handling
- **PartPopup**: Desktop chat container with input controls
- **Mobile Integration**: Optimized for mobile bottom sheets and touch interactions

**Key Features**
- **Real-time Streaming**: WebSocket-like streaming for immediate response feedback
- **State Management**: Efficient state handling for messages, loading states, and user interactions
- **Auto-scroll Intelligence**: Smart scrolling that respects user behavior while maintaining usability
- **Responsive Design**: Seamless experience across desktop and mobile devices
- **Performance Optimized**: Virtualized rendering and efficient re-render patterns

**User Experience Enhancements**
- **Smooth Animations**: Carefully crafted transitions and micro-interactions
- **Visual Feedback**: Loading states, typing indicators, and error handling
- **Touch Optimization**: Mobile-first design with touch-friendly interface elements
- **Accessibility**: Screen reader support and keyboard navigation

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
