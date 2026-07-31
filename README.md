# DawgDecision

DawgDecision is a full-stack web application that helps University of Georgia students make informed financial decisions by comparing different scenarios and building comprehensive financial plans.

Instead of evaluating decisions in isolation, DawgDecision enables students to combine choices such as housing, meal plans, transportation, and work schedules into a single financial plan to better understand their overall financial outlook.

---

## Features (Planned)

- Compare multiple financial scenarios
- Build comprehensive financial plans
- Personalized cost and savings analysis
- Interactive dashboards and visualizations
- Secure user authentication
- Save and revisit financial plans
- AI-generated explanations of financial tradeoffs

---

## Tech Stack

### Frontend
- React
- TypeScript

### Backend
- FastAPI (Python)

### Database
- PostgreSQL

### Cloud
- AWS

### Version Control
- Git & GitHub

---

## System Architecture

```
React Frontend
        │
 REST API
        │
 FastAPI Backend
        │
 Decision Engine
        │
 PostgreSQL
        │
 AWS
```

The application's core financial calculations and recommendation logic are performed by a deterministic Python decision engine. AI is used only to generate natural-language explanations and insights, rather than making the financial decisions themselves.

---

## Repository Structure

```
dawgdecision/
│
├── frontend/
├── backend/
├── docs/
├── README.md
└── LICENSE
```

---

## Development Status

🚧 **Currently in active development**

Current focus:
- Project architecture
- MVP development
- Backend decision engine
- React frontend
- Database integration

---

## Team

### Product & Technical Lead
- Product direction
- Backend architecture
- Decision engine
- Cloud architecture

### Frontend Lead
- React frontend
- UI/UX
- Dashboard
- Component development

### Platform & Backend Engineer
- Backend services
- PostgreSQL
- Authentication
- APIs
- AWS deployment
- CI/CD

---

## Vision

Our goal is to provide students with a tool that answers not only:

> "How much will this decision cost?"

but also:

> "Given all of my choices together, what financial plan best fits my goals?"

---

## License

This project is licensed under the MIT License.
