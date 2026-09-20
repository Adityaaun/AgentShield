from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn

app = FastAPI()

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat(req: ChatRequest):
    print(f"Received prompt: {req.message}")
    return {"response": "I am a custom agent."}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=5000)
