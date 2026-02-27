import pytest

from src.app import activities


# The tests follow the Arrange-Act-Assert pattern.

def test_get_activities(client):
    # Arrange - nothing special
    # Act
    response = client.get("/activities")
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert "Chess Club" in data


def test_signup_success(client):
    # Arrange
    email = "test@school.edu"
    activity = "Chess Club"

    # Act
    response = client.post(f"/activities/{activity}/signup?email={email}")

    # Assert
    assert response.status_code == 200
    assert email in activities[activity]["participants"]
    assert "Signed up" in response.json()["message"]


def test_signup_duplicate(client):
    # Arrange
    email = "dup@school.edu"
    activity = "Chess Club"
    client.post(f"/activities/{activity}/signup?email={email}")

    # Act
    response = client.post(f"/activities/{activity}/signup?email={email}")

    # Assert
    assert response.status_code == 400
    assert "already signed up" in response.json()["detail"]


def test_signup_unknown_activity(client):
    # Arrange
    email = "foo@school.edu"
    activity = "Nonexistent"

    # Act
    response = client.post(f"/activities/{activity}/signup?email={email}")

    # Assert
    assert response.status_code == 404


def test_unregister_success(client):
    # Arrange
    email = "remove@school.edu"
    activity = "Chess Club"
    # make sure the email is present
    client.post(f"/activities/{activity}/signup?email={email}")

    # Act
    response = client.delete(f"/activities/{activity}/signup?email={email}")

    # Assert
    assert response.status_code == 200
    assert email not in activities[activity]["participants"]
    assert "Unregistered" in response.json()["message"]


def test_unregister_not_registered(client):
    # Arrange
    email = "absent@school.edu"
    activity = "Chess Club"

    # Act
    response = client.delete(f"/activities/{activity}/signup?email={email}")

    # Assert
    assert response.status_code == 404


def test_unregister_unknown_activity(client):
    # Arrange
    email = "any@school.edu"
    activity = "DoesNotExist"

    # Act
    response = client.delete(f"/activities/{activity}/signup?email={email}")

    # Assert
    assert response.status_code == 404
