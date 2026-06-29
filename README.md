# CodeSense Frontend

React.js frontend for the CodeSense AI-Driven Code Execution and Learning Analytics Platform.

## Overview
The frontend is the student and educator-facing interface of CodeSense. Students write and run code directly in the browser across four programming languages, receive instant AI-style error explanations, and view their personal performance dashboard. Educators access a separate dashboard showing class-wide analytics, at-risk student predictions, and error distribution patterns.

## Tech Stack
- React.js v18 — Component-based UI and SPA routing
- JavaScript (ES6+) — Frontend logic
- CSS-in-JS (Inline Styles) — Component-level styling

## Pages
| Page | Route | Description |
|------|-------|-------------|
| Login / Register | / | Authentication with role selection |
| Code Editor | /editor | Write and run code in 4 languages |
| Student Dashboard | /dashboard | Personal stats, risk score, error breakdown |
| Educator Dashboard | /educator | Class analytics, at-risk students, language usage |

## Features
- Code editor with syntax support for Python, Java, C++, and JavaScript
- Real-time code execution via Wandbox API through the backend
- AI-style error explanation displayed instantly on failure
- Student dashboard with ML risk score and submission history
- Educator dashboard with class-wide performance analytics

## How to Run
```bash
npm install
npm start
```

## Environment Variables (.env)
