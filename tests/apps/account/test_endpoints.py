import pytest


@pytest.mark.asyncio
async def test_ping(client):
    response = await client.get("/account/ping")

    assert response.status_code == 200
    assert response.json() == {"message": "account router ok"}