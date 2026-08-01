# DawgDecision

DawgDecision is a full-stack financial decision-support platform designed initially for University of Georgia students. It helps students compare financial scenarios and combine decisions involving housing, meal plans, transportation, work schedules, and other expenses into comprehensive financial plans.

Rather than evaluating decisions in isolation, DawgDecision shows how multiple choices interact and affect a student's overall budget, savings, and financial goals. The initial release is being built around UGA-specific use cases and data, with the architecture designed to support expansion to other universities over time.

---

## MVP Goals

- Compare multiple financial scenarios
- Build consolidated financial plans from multiple student decisions
- Calculate costs, savings, and financial tradeoffs
- Generate deterministic recommendation scores using a Python decision engine
- Display results through interactive dashboards and visualizations
- Support secure user authentication
- Save and revisit plans and scenarios
- Provide optional AI-generated explanations of decision-engine results

---

## How It Works

A student enters information about financial decisions such as housing, dining, transportation, employment, and other expenses.

DawgDecision then:

1. Sends the user's inputs from the React frontend to the FastAPI backend.
2. Processes the data through a deterministic Python decision engine.
3. Calculates costs, savings, tradeoffs, and scenario outcomes.
4. Combines multiple decisions into a consolidated financial plan.
5. Stores relevant users, scenarios, and plans in PostgreSQL.
6. Returns structured results to the frontend for visualization.
7. Optionally uses AI to explain or summarize those results in natural language.

The application's core calculations and recommendations do not depend on AI.

---

## Tech Stack

### Frontend
- **React** — Builds the interactive user interface
- **TypeScript** — Adds static typing to improve reliability and catch errors during development

### Backend
- **FastAPI (Python)** — Provides REST APIs and connects the application to the decision engine

### Decision Engine
- **Python** — Performs financial calculations, scenario comparisons, consolidated-plan analysis, and recommendation scoring

### Database
- **PostgreSQL** — Stores users, decisions, scenarios, plans, and application data

### Cloud Infrastructure
- **AWS** — Provides hosting, database infrastructure, monitoring, security, and deployment services

### Development
- **Git & GitHub** — Version control, collaboration, pull requests, issue tracking, and project management

---

## High-Level Architecture

```text
User
  │
  ▼
React + TypeScript Frontend
  │
  │ REST API
  ▼
FastAPI Backend
  │
  ├──────────────► PostgreSQL
  │
  ▼
Python Decision Engine
  │
  ▼
Structured Results
  │
  ├──────────────► Optional AI Explanation Layer
  │
  ▼
React Dashboard
```

The decision engine is intentionally separated from the AI layer. Financial calculations and recommendation logic are deterministic and testable, while AI is used only as an optional surface layer for explaining and contextualizing results.

---

## Project Structure

```text
dawgdecision/
│
├── frontend/          # React + TypeScript application
│
├── backend/           # FastAPI application and backend services
│
├── docs/              # Architecture and project documentation
│
├── README.md
└── LICENSE
```

The repository structure will continue to evolve as the application is implemented.

---

## Team Responsibilities

### Product & Technical Lead
- Product direction and feature planning
- Backend architecture
- Decision engine
- Financial business logic
- API contract design
- Cloud architecture
- Technical coordination across the application

### Frontend Lead
- React and TypeScript implementation
- UI/UX
- Forms and user workflows
- Dashboards and visualizations
- Frontend state management
- Backend API integration

### Platform & Backend Engineer
- FastAPI backend services and endpoint implementation
- PostgreSQL database and persistence
- Authentication and authorization
- Backend infrastructure
- AWS implementation
- Deployment and CI/CD

---

## Development Status

> **Currently in active development**

The project is currently focused on establishing the MVP architecture and building the first end-to-end version of the application.

Initial development priorities include:

- React frontend foundation
- FastAPI backend foundation
- PostgreSQL integration
- Decision-engine architecture
- First financial decision workflow
- Frontend-to-backend integration
- Cloud deployment

---

## Initial Product Scope

The first release will focus on a limited set of student financial decisions rather than attempting to model every possible financial choice immediately.

Example decision categories may include:

- Housing
- Meal plans
- Transportation
- Employment and work hours
- Recurring student expenses

These individual decisions can be combined into a broader financial plan, allowing students to understand how their choices interact rather than evaluating each one independently.

---

## Vision

DawgDecision aims to answer more than:

> "How much does this option cost?"

The larger goal is to help students answer:

> "Given all of my choices together, what financial plan best fits my goals?"

The project is beginning with University of Georgia students as its initial user base while being designed with the potential to support additional universities in the future.

---

## License

This project is licensed under the MIT License.
