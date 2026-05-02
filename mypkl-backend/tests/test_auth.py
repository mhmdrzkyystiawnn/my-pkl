def test_register_and_login_flow(client):
    register_payload = {
        "email": "tester@example.com",
        "password": "verysecure123"
    }
    response = client.post("/api/auth/register", json=register_payload)
    assert response.status_code == 200
    payload = response.json()
    assert payload["email"] == "tester@example.com"
    assert "id" in payload

    login_response = client.post("/api/auth/login", json=register_payload)
    assert login_response.status_code == 200
    login_payload = login_response.json()
    assert "access_token" in login_payload
    assert login_payload["token_type"] == "bearer"


def test_login_with_invalid_credentials(client):
    response = client.post("/api/auth/login", json={"email": "noone@example.com", "password": "wrongpass"})
    assert response.status_code == 401
    assert response.json()["detail"] == "Email atau password salah"
