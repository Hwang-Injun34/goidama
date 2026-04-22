import uvicorn
from appserver.app import app

if __name__ == "__main__":
    uvicorn.run("appserver.app:app", host="0.0.0.0", port=8000, reload=True)