## llm operating instructions

- maintain terseness; avoid fluff.
- before any file is created, renamed, or deleted, **update this repo map to match**.
- never touch generated folders.
- cite explicit file paths when referencing code.
- prefer concise diffs over full-file rewrites unless the change is wholesale.
- keep this list alphabetically ordered within each directory.

# musco – repo dump

/.eslintrc.json – ESLint configuration for code quality and style rules
/.firebaserc – Firebase project configuration file
/.gitignore – Git ignore patterns for excluding files from version control
/APPDESCRIPTION.md – Application description and overview document
/CODEBASE_OVERVIEW.md – High-level codebase structure and architecture overview
/ExerciseProgram.md – Documentation for exercise program functionality
/README.md – Main project documentation and setup instructions
/diagnosis.md – System diagnosis and troubleshooting documentation
/firebase.json – Firebase hosting and functions configuration
/jest.config.js – Jest testing framework configuration
/jest.setup.js – Jest test environment setup and global configurations
/next-env.d.ts – Next.js TypeScript environment definitions
/next.config.js – Next.js framework configuration (legacy)
/next.config.ts – Next.js framework configuration (TypeScript)
/package-lock.json – NPM dependency lock file with exact versions
/package.json – NPM package definition with dependencies and scripts
/postcss.config.mjs – PostCSS configuration for CSS processing
/program.md – Program-specific documentation and specifications
/repo_description.json – Repository metadata and description file
/storage.rules – Firebase Storage security rules
/storage.rules.secure – Secure Firebase Storage rules configuration
/tailwind.config.js – Tailwind CSS framework configuration (legacy)
/tailwind.config.ts – Tailwind CSS framework configuration (TypeScript)
/tsconfig.json – TypeScript compiler configuration
/tsconfig.tsbuildinfo – TypeScript build information cache
/typescript-errors.log – TypeScript compilation error log
/vercel.json – Vercel deployment configuration
/yarn.lock – Yarn dependency lock file with exact versions

/.vscode/
  launch.json – VS Code debugger launch configuration

/functions/
  .eslintrc.js – ESLint configuration for Firebase functions
  .gitignore – Git ignore patterns specific to functions directory
  package-lock.json – NPM dependencies for Firebase functions
  package.json – Package definition for Firebase functions
  tsconfig.dev.json – TypeScript config for development environment
  tsconfig.json – TypeScript configuration for Firebase functions
  /lib/
    index.js – Compiled JavaScript output from TypeScript functions
    index.js.map – Source map for compiled functions
    /handlers/ – Compiled handler functions
  /src/
    index.ts – Main entry point for Firebase Cloud Functions
    /handlers/ – TypeScript source files for function handlers

/public/
  apple-icon-144x144.png – Apple touch icon 144x144 pixels
  apple-icon-180x180.png – Apple touch icon 180x180 pixels
  favicon.ico – Website favicon
  file.svg – File icon SVG
  globe.svg – Globe icon SVG
  manifest.json – PWA web app manifest configuration
  ms-icon-310x310.png – Microsoft tile icon 310x310 pixels
  next.svg – Next.js logo SVG
  sw-register.js – Service worker registration script
  sw.js – Service worker for PWA functionality
  vercel.svg – Vercel logo SVG
  window.svg – Window icon SVG
  /.well-known/ – Well-known URIs for web standards
  /data/
    /exercises/ – Exercise data files
    /programs/ – Program data files
  /img/
    loading.svg – Loading animation SVG
    logo.png – Main application logo PNG
    logo.svg – Main application logo SVG
    logo_biceps.png – Biceps-themed logo variant
    logo_female.png – Female-themed logo variant
  /partners/
    *.svg – Partner company logo SVG files (numbered 1-55)
  /screenshots/
    desktop.png – Desktop application screenshot
    mobile.png – Mobile application screenshot

/scripts/
  README-firebase.md – Firebase-related scripts documentation
  README.md – Scripts directory documentation and usage guide
  convertAnatomyParts.ts – Script to convert anatomy part data structures
  download-from-firestore.ts – Download data from Firestore database
  exerciseScraper.ts – Web scraper for exercise data extraction
  formatters.ts – Data formatting utility functions
  generateAlternatives.ts – Generate alternative exercise suggestions
  merge_missing_fields.py – Python script to merge missing data fields
  package-lock.json – NPM dependencies for scripts
  package.json – Package definition for utility scripts
  run-alternatives.sh – Shell script to run alternative generation
  run-download.sh – Shell script to run Firestore download
  run-scraper.ts – TypeScript runner for web scraping
  run-tests.sh – Shell script to run test suite
  run-upload.sh – Shell script to run Firestore upload
  setup-check.ts – Environment and dependency setup verification
  shoulderExerciseScraper.ts – Specialized scraper for shoulder exercises
  test-formatter.ts – Test utilities for data formatting functions
  test-scrape.ts – Test utilities for web scraping functionality
  tsconfig.json – TypeScript configuration for scripts
  upload-to-firestore.ts – Upload data to Firestore database
  /src/ – Additional script source files
  /types/
    exercises.ts – TypeScript type definitions for exercise data

/src/
  /app/
    .DS_Store – macOS system file (should be gitignored)
    README.md – App directory documentation
    favicon.ico – Application favicon
    globals.css – Global CSS styles and Tailwind imports
    layout.tsx – Root layout component with providers and metadata
    metadata.ts – Shared metadata configuration for SEO
    not-found.tsx – 404 error page component
    page.tsx – Home page component and main landing page
    /admin/ – Administrative interface and dashboard
    /api/
      /assistant/ – AI assistant API endpoints
      /debug/ – Debug and development API routes
      /prompts/ – AI prompt management endpoints
      /templates/ – Template management API routes
      /write-exercises/ – Exercise creation API endpoints
      /youtube/ – YouTube integration API endpoints
    /auth/ – Authentication pages and components
    /components/
      ErrorBoundary.tsx – React error boundary component
      RouteChangeListener.tsx – Navigation event handler component
      /3d/ – 3D visualization components
      /auth/ – Authentication-related components
      /ui/ – Reusable UI component library
    /config/ – Application configuration files
    /context/ – React context providers and state management
    /data/ – Data management and utilities
    /exercises/ – Exercise-related pages and components
    /firebase/ – Firebase configuration and utilities
    /fonts/ – Font definitions and loading
    /helpers/ – Utility functions and helper methods
    /hooks/ – Custom React hooks
    /i18n/ – Internationalization and localization
    /lib/ – Third-party library configurations and wrappers
    /login/ – Login page and authentication flow
    /privacy/ – Privacy-related pages
    /privacy-policy/ – Privacy policy page
    /profile/ – User profile pages and components
    /program/
      layout.tsx – Program section layout component
      page.tsx – Main program listing and selection page
      /[slug]/ – Dynamic program detail pages
      /calendar/ – Program calendar and scheduling
      /day/ – Daily program view and management
    /programs/ – Program management and display
    /scripts/ – Client-side utility scripts
    /services/ – API service layer and data fetching
    /shared/ – Shared components and utilities
    /types/
      human.ts – Human body and anatomy type definitions
      index.ts – Main type exports and shared interfaces
      program.ts – Program and workout type definitions
      user.ts – User and profile type definitions
    /utils/ – Utility functions and helpers
  /components/
    PartnerLogos.tsx – Partner company logos display component 