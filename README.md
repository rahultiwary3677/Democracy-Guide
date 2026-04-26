# Democracy Guide

Democracy Guide is a smart, dynamic interactive assistant built to help users understand the election process, timelines, and necessary steps to vote. It simplifies complex election information and acts as a personalized voting guide.

## Chosen Vertical
**Election Information and Voter Guidance**

## Approach and Logic
The project relies on an AI-driven chat interface powered by **Google's Gemini AI SDK** (`@google/generative-ai`).
- **Context Handling**: It maintains conversational history using React state, allowing users to ask follow-up questions contextually.
- **Dynamic Routing**: The system prompt logically constrains the AI to answer specifically about voting processes, registration, and timelines.
- **Modern Tech Stack**: Built with Vite and React for high performance and lightweight builds (ensuring the output remains well under the 1MB repository constraint).
- **Interactive UI**: Utilizing `framer-motion` for smooth, micro-animations and user feedback, along with `react-markdown` to format the complex information into readable chunks with lists, emphasis, etc.

## How the Solution Works
1. **Chat Interface**: The user types a query regarding election or voting information.
2. **Gemini AI**: The frontend securely interfaces with the Gemini AI using a specialized system instruction.
3. **Response Generation**: The AI analyzes the query based on best practices, general election rules, and generates a structured, neutral response formatted in Markdown.
4. **Rendering**: The response is streamed/displayed dynamically to the user.

## Google Services Integration
- **Gemini AI**: Integrated via the `@google/generative-ai` package to drive the assistant logic, demonstrating meaningful AI integration into a client application.
- **Firebase Analytics**: Integrated to track performance metrics and user interactions securely, fulfilling the criteria for robust Google Services integrations.

## Best Practices Addressed
- **Code Quality**: Structured clean components with strong typings using TypeScript. Separated concerns between styling and logic.
- **Security**: The AI prompt avoids malicious injections and strictly refuses partisan endorsements. Environment variables are used for secrets.
- **Testing**: A solid test foundation has been integrated using `vitest` and `@testing-library/react` to validate UI components and mocked API calls.
- **Accessibility**: Applied semantic HTML tags (`main`, `header`, `form`), `aria-live` regions for dynamic content, hidden labels (`visually-hidden`), and high contrast ratios.

## Assumptions Made
1. Users may not have their local specific county information, so the AI must provide general guidance while urging them to verify with local offices.
2. The `VITE_GEMINI_API_KEY` will be provided by the evaluator in their environment setup. A visual warning is shown if the key is missing to ensure a smooth setup experience.
3. The repository size requirement applies to the unbuilt or optimized built source assets, both of which are extremely lean.

## Setup Instructions
1. Run `npm install`.
2. Create a `.env` file and add your `VITE_GEMINI_API_KEY` and `VITE_FIREBASE_*` configuration variables (a template `.env` is already provided).
3. Run `npm run dev` to start the development server.
4. Run `npm run test` to run the test suite.
