# Backend Architecture

## Overview

DawgDecision uses a layered backend architecture designed to separate API handling, persistence, business logic, and decision analysis.

The backend is built with FastAPI and Python, with PostgreSQL used for persistent application data.

## High-Level Flow

```text
React Frontend
      |
      v
FastAPI API Layer
      |
      v
Backend Services
      |
      +--------------------> PostgreSQL
      |
      v
Decision Engine
      |
      v
Structured Results
      |
      +--------------------> Optional AI Explanation Layer
      |
      v
Frontend Response