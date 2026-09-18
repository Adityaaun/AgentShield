import os
import google.generativeai as genai
import dotenv

dotenv.load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

for m in genai.list_models():
    if "generateContent" in m.supported_generation_methods:
        print(m.name)
