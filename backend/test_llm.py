import asyncio
import os
import dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

dotenv.load_dotenv()
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")

async def test():
    try:
        llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.7)
        resp = await llm.ainvoke("Say hello")
        print("Success!", resp.content)
    except Exception as e:
        print("ERROR:", str(e))

asyncio.run(test())
