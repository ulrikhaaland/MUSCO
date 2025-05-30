# Codebase Overview

This document provides a high-level summary of the MUSCO repository and pointers for new contributors.

## Repository Structure

- **Next.js Application** – The root of the repository contains a Next.js 13 project (`musco-new`). The main application lives in `src/app`.
- **Pages & Routing** – Application pages and layouts are under `src/app`. Notable routes include:
  - `/program` – main program view.
  - `/program/calendar` – calendar for choosing program days.
  - `/program/day/[day]` – detail page for a specific day.
  The component layout for these routes is described in `src/app/README.md`.
- **Components** – Reusable UI components are located in `src/app/components/ui`. Examples include the chat interface, program pages, and questionnaire wizard.
- **Hooks** – Custom React hooks live in `src/app/hooks` and encapsulate stateful logic such as chat streaming, Human API integration, and tutorial controls.
- **Services** – Core domain logic resides in `src/app/services`, covering program generation, questionnaire handling, and feedback collection.
- **Utilities** – Stateless helpers are found in `src/app/utils`.
- **Firebase Functions** – Backend functions under `functions/` provide authentication helpers and other server-side tasks.
- **Data & Scripts** – Exercise template data lives in `public/data`. The `scripts/` folder contains scrapers and conversion utilities for that data.

## Key Files

- `src/app/api/assistant/route.ts` – Handles chat completions and program generation via OpenAI.
- `src/app/services/exerciseProgramService.ts` – Builds personalized exercise plans.
- `functions/src/index.ts` – Firebase Cloud Functions for tasks like sending login emails.

## Getting Started

1. Install dependencies and run the development server:
   ```bash
   npm install
   npm run dev
   ```
2. Explore core services and hooks to understand program generation and chat flow.
3. Review the Markdown guidelines (`program.md`, `diagnosis.md`, etc.) for prompt structures.

For more detail on the program routes, see `src/app/README.md`.
