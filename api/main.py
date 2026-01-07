from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from api.chroma_utils import load_and_split_documents, delete_doc_from_chroma,index_document_to_chroma
from api.db_utils import get_all_documents,get_chat_history,get_db_connection,insert_application_logs,insert_document_record, create_application_logs,create_document_store
from api.pydantic_models import QueryInput,QueryResponse,DocumentInfo,DeleteFileRequest
from api.langchain_utils import get_rag_chain

from typing import List
import sys, os, uuid,shutil,logging
from pathlib import Path

import load_env
from api.image_utils import image_qa
from langchain_core.documents import Document
from api.chroma_utils import vectorstore


from api.db_utils import delete_document_record
from api.chat_utils import get_chat_llm
from api.db_utils import get_latest_document_ids
from api.chat_utils import wants_document, wants_summary
from api.chat_utils import chat_with_model
import asyncio



sys.path.append(str(Path(__file__).parent.parent))
from dotenv import load_dotenv
load_dotenv()


logging.basicConfig(filename="app.log",level=logging.INFO)

app = FastAPI(title='Rag App')

@app.on_event("startup")
def startup_event():
    create_document_store()
    create_application_logs()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


if os.path.exists('static'):
    app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/health")
def health_check():
    return {"status":"active","message":"RAG Api is Running"}

import asyncio
from fastapi import Request
from fastapi.responses import JSONResponse

@app.middleware("http")
async def catch_cancelled_error(request: Request, call_next):
    try:
        return await call_next(request)
    except asyncio.CancelledError:
        return JSONResponse(
            status_code=499,
            content={"detail": "Request cancelled (server reload or shutdown)."}
        )


@app.post("/chat", response_model=QueryResponse)
def chat(query_input: QueryInput):
   try:
    session_id = query_input.session_id or str(uuid.uuid4())
    chat_history = []    #get_chat_history(session_id)

    model_name = (
        query_input.model.value
        if hasattr(query_input.model, "value")
        else query_input.model
    )

    doc_ids = get_latest_document_ids()
    docs_exist = bool(doc_ids)

    if docs_exist and wants_document(query_input.question):
        rag_chain = get_rag_chain(
            model_name,
            summary=wants_summary(query_input.question)
        )

        result = rag_chain.invoke({
            "chat_history": chat_history,
            "input": query_input.question
        })

        answer = result["answer"]

    else:
        answer = chat_with_model(
            question=query_input.question,
            model=model_name,
            
        )

    insert_application_logs(
        session_id,
        query_input.question,
        model_name,
        answer
    )

    return QueryResponse(
        answer=answer,
        session_id=session_id,
        model=model_name
    )
    
   except asyncio.CancelledError:
     raise HTTPException(status_code=499, detail="Request cancelled (server reloaded/shutdown).")
 
 

@app.post('/upload-docs')
def upload_doc(files: List[UploadFile] = File(...)):
    results = []

    for file in files:
        allowed_extensions = ['.pdf', '.docx', '.html']
        file_extension = os.path.splitext(file.filename)[1].lower()

        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {file.filename}"
            )

        temp_file_path = f"temp_{uuid.uuid4().hex}_{file.filename}"

        try:
            with open(temp_file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            file_id = insert_document_record(file.filename)
            success = index_document_to_chroma(temp_file_path, file_id)

            if not success:
                delete_document_record(file_id)
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to index {file.filename}"
                )

            results.append({
                "filename": file.filename,
                "file_id": file_id
            })

        finally:
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)

    return results


@app.get('/list-docs',response_model=List[DocumentInfo])
def list_all_documents():
    documents = get_all_documents()
    mapped_docs = [{"filename":doc["filename"], "file_id": str(doc['id'])} for doc in documents]
    return mapped_docs


@app.delete("/delete-docs/{file_id}")
def delete_document(file_id: str):
    chroma_delete_success = delete_doc_from_chroma(file_id)

    if chroma_delete_success:
        db_delete_success = delete_document_record(file_id)
        if db_delete_success:
            logging.info(f"Deleted document ID {file_id} from both Chroma and DB.")
            return {"message": f"Successfully deleted document with file_id {file_id}."}
        else:
            raise HTTPException(
                status_code=500,
                detail="Deleted from Chroma but failed to delete from database."
            )
    else:
        raise HTTPException(
            status_code=500,
            detail="Failed to delete document from Chroma."
        )

     
@app.post("/chat-image")
async def chat_image(
    file: UploadFile = File(...),
    question: str = Form(...),
    session_id: str = Form(None)
):
    session_id = session_id or str(uuid.uuid4())

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".png", ".jpg", ".jpeg"]:
        raise HTTPException(status_code=400, detail="Invalid image format")

    temp_path = f"temp_{uuid.uuid4().hex}{ext}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    answer = image_qa(temp_path, question)
    os.remove(temp_path)

    image_context = (
        "[IMAGE UPLOADED]\n"
        f"User asked: {question}\n"
        f"Image analysis: {answer}"
    )

  
    insert_application_logs(
        session_id,
        image_context,
        "image-qa",
        answer
    )

   

    return {
        "answer": answer,
        "session_id": session_id
    }

@app.post("/chat-audio")
async def chat_audio(
    file: UploadFile = File(...),
    session_id: str = Form(None),
    model: str = Form("gemini-2.5-flash-lite")
):
    session_id = session_id or str(uuid.uuid4())
    model_name = model  

    from api.audio_utils import transcribe_audio

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".wav", ".mp3", ".m4a"]:
        raise HTTPException(status_code=400, detail="Invalid audio format")

    temp_path = f"temp_{uuid.uuid4().hex}{ext}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 🎧 Speech → Text
    text = transcribe_audio(temp_path)
    os.remove(temp_path)

    chat_history = get_chat_history(session_id)

    # 🔑 CHECK IF ANY DOCUMENTS EXIST
    doc_ids = get_latest_document_ids()
    docs_exist = bool(doc_ids)

    if docs_exist and wants_document(text):
        rag_chain = get_rag_chain(model_name)
        result = rag_chain.invoke({
            "chat_history": chat_history,
            "input": text
        })
        answer = result["answer"]
    else:
        llm = get_chat_llm(model_name)
        answer = llm.invoke(text).content

    insert_application_logs(
        session_id,
        text,
        model_name,
        answer
    )

    return {
        "transcribed_text": text,
        "answer": answer,
        "session_id": session_id
    }
