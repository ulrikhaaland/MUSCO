# General Description of the App

## Purpose
The app's purpose is to make it easy and accessible for people to learn how to fix their musculoskeletal issues.

---

## Features

### Interactive 3D-Rendered Musculoskeletal Model
- Users can zoom, pan, and click on different parts of the model.
- Clicking on a specific part of the musculoskeletal model zooms in on that part and reveals a pop-up box.

#### Pop-Up Box
- Contains several options related to the selected body part (same for all body parts):
  1. **Learn more** (about this part)
  2. **I have an issue** (with this part)
  3. Placeholder (lorem ipsum)
  4. Placeholder (lorem ipsum)
- A chat text field is always available at the bottom.
- The pop-up grows as more options are selected or as chat progresses, scrolling to the bottom upon adding new content.

---

## State-of-the-Art LLM Integration
- Powered by OpenAI's Assistant API with custom system instructions and documents.
- The LLM interacts directly with the musculoskeletal model, contextualizing responses based on the selected part and user actions.
- The LLM can:
  - Answer queries based on user-selected options.
  - Determine appropriate next steps when an option is clicked.

#### Example Workflow
1. The user selects the bicep on the model and clicks the "Learn more" option.
2. The LLM queries information about the bicep.
3. The LLM provides basic information and/or follow-up questions, such as:
   - How to train the bicep?
   - What is the function of the bicep?
   - Why are the biceps important?

---

## Exercise/Recovery Program
- During chat, the LLM may ask if the user wants an exercise or recovery program for the selected body part.
- If the user opts in, the LLM asks additional questions (e.g., age, exercise frequency).
- The generated program will be displayed appropriately within the app.

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
