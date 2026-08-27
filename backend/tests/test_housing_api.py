from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_dataset_loads_successfully():
    response = client.get("/api/housing-sources")
    assert response.status_code == 200
    data = response.json()
    assert "housing_options" in data
    assert len(data["housing_options"]) > 0

def test_valid_id_lookup_works():
    response = client.get("/api/housing-sources")
    first_id = response.json()["housing_options"][0]["id"]
    
    response = client.get(f"/api/housing-sources/{first_id}")
    assert response.status_code == 200
    assert response.json()["id"] == first_id

def test_invalid_id_returns_not_found():
    response = client.get("/api/housing-sources/invalid_id_that_does_not_exist")
    assert response.status_code == 404
