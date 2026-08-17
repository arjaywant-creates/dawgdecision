# DawgDecision Python Backend

This is the Python FastAPI backend engine for DawgDecision. It handles the core financial decision engine and calculations.

## Local Development Setup

1. Create a virtual environment: `python -m venv venv`
2. Activate the virtual environment:
   - Mac/Linux: `source venv/bin/activate`
   - Windows: `venv\Scripts\activate`
3. Install requirements: `pip install -r requirements.txt`

## Running the API locally

*Note: You can run the backend from the project root using `npm run backend` (or `npm run backend:win` on Windows).*

To run directly from this directory:
```bash
uvicorn main:app --reload
```

The API will be available privately at `http://127.0.0.1:8000`.

### Using Docker
Alternatively, you can run the backend and database together using Docker from the project root:
```bash
docker compose up
```

## API Documentation
Once the server is running (via Docker or locally), you can view the automatically generated Swagger interactive API documentation by navigating your browser to:
`http://127.0.0.1:8000/docs`
