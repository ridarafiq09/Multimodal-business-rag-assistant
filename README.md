# Multimodal Business RAG Chatbot System

<img width="1919" height="876" alt="image" src="https://github.com/user-attachments/assets/ca9bd198-6546-43d8-8763-e6e8d477642d" />


A FastAPI-based multimodal Retrieval-Augmented Generation (RAG) chatbot that supports **text, image, and audio inputs** for business document question answering.

This project demonstrates how to build a **real-world AI assistant backend** using modern AI tools and clean architecture.

---

## 🚀 Features

- 💬 Text-based chat with LLM
- 🖼️ Image question answering
- 🎤 Audio input (speech-to-text using Whisper)
- 📄 Document upload and RAG using ChromaDB
- 🧠 Context-aware responses with LangChain
- 🗂️ Persistent chat history (SQLite)
- 🌐 REST API built with FastAPI

---

## 🧱 Tech Stack

- **Backend:** FastAPI
- **LLM:** Google Gemini (via LangChain)
- **Vector DB:** ChromaDB
- **Embeddings:** Google / LangChain
- **Speech-to-Text:** OpenAI Whisper (CPU)
- **Database:** SQLite
- **Frontend:** Custom web UI (text, image, audio)

---

## 📁 Project Structure

bilingual-multimodal-business-rag-chatbot-system/
│
├── api/
│ ├── main.py # FastAPI routes
│ ├── chat_utils.py # LLM chat logic
│ ├── audio_utils.py # Whisper audio processing
│ ├── image_utils.py # Image QA logic
│ ├── chroma_utils.py # ChromaDB utilities
│ ├── db_utils.py # SQLite helpers
│ ├── langchain_utils.py # LangChain setup
│ └── pydantic_models.py # Request/response schemas
│
├── chroma_db/ # Vector database (ignored in git)
├── data/ # Uploaded documents (ignored)
├── venv/ # Virtual environment (ignored)
├── .env # Environment variables (ignored)
├── requirements.txt
├── start.bat
└── README.md
