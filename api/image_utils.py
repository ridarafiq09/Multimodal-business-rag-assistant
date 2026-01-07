import google.generativeai as genai
import os
from PIL import Image

genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

model = genai.GenerativeModel("models/gemini-flash-latest")


def image_qa(image_path: str, question: str):
    img = Image.open(image_path)

    prompt = (
        "Answer the user's question about the image.\n"
        "Use plain text only.\n"
        "No markdown.\n"
        "Maximum 2 sentences.\n\n"
        f"Question: {question}"
    )

    response = model.generate_content([
        prompt,
        img
    ])

    return response.text.strip()

