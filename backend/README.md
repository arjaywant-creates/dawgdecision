# DawgDecision Python Backend

This is the Python FastAPI backend engine for DawgDecision. It handles the core financial decision engine and calculations.

## Running the API locally

You can run this API in two ways: using Docker (also runs database) or locally using Python directly.

### Method 1: Using Docker
This method starts the backend and database together.

1. Ensure you are in the root `dawgdecision` folder.
2. Run `docker compose up backend` (or simply `docker compose up` to start the database as well).
3. The API will be available privately at `http://127.0.0.1:8000`.

### Method 2: Running directly with Python

1. Navigate to the `backend` folder: `cd backend`
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment:
   - Mac/Linux: `source venv/bin/activate`
   - Windows: `venv\Scripts\activate`
4. Install requirements: `pip install -r requirements.txt`
5. Run the FastAPI server: `uvicorn main:app --reload`
6. The API will be available at `http://127.0.0.1:8000`.

## API Documentation
Once the server is running (via Docker or locally), you can view the automatically generated Swagger interactive API documentation by navigating your browser to:
`http://127.0.0.1:8000/docs`
