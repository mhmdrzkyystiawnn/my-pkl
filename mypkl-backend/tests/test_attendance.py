def test_attendance_checkin_and_today(client):
    register_payload = {
        "email": "attendance@example.com",
        "password": "verysecure123"
    }
    client.post("/api/auth/register", json=register_payload)
    login_response = client.post("/api/auth/login", json=register_payload)
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    attendance_payload = {
        "date": "2026-05-02",
        "check_in_time": "08:00",
        "check_out_time": "17:00",
        "total_hours": 9.0
    }
    response = client.post("/api/attendance/", json=attendance_payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["date"] == "2026-05-02"
    assert data["check_in_time"] == "08:00"
    assert data["check_out_time"] == "17:00"
    assert "id" in data

    today_response = client.get("/api/attendance/today", headers=headers)
    assert today_response.status_code == 200
    today_data = today_response.json()
    assert today_data["date"] == "2026-05-02"
