from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from google.api_core.exceptions import ResourceExhausted
import os



DOC_INTENT_KEYWORDS = [
    "document", "doc", "file", "pdf",
    "uploaded", "check", "review",
    "based on", "according to"
]

def wants_document(text: str) -> bool:
    if not text:
        return False
    text = text.lower()
    return any(k in text for k in DOC_INTENT_KEYWORDS)


def wants_summary(text: str) -> bool:
    if not text:
        return False

    triggers = [
        "tell about",
        "describe",
        "summary",
        "summarize",
        "what is this document",
        "about pdf",
        "about document",
        "explain document",
        "overview"
    ]

    text = text.lower()
    return any(trigger in text for trigger in triggers)

def get_chat_llm(model_name: str):
    return ChatGoogleGenerativeAI(
        model=model_name,
        google_api_key=os.getenv("GOOGLE_API_KEY"),
        temperature=0.3,
        convert_system_message_to_human=True
    )

def chat_with_model(question: str, model: str) -> str:
    llm = ChatGoogleGenerativeAI(
        model=model,
        google_api_key=os.getenv("GOOGLE_API_KEY"),
        temperature=0.3
    )

    response = llm.invoke(question)
    return response.content

