from langchain_community.document_loaders import (
    PyPDFLoader,
    UnstructuredHTMLLoader,
    Docx2txtLoader
)
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.documents import Document
from typing import List
import os


CHROMA_PATH = "./chroma_db"

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    length_function=len
)


embedding_function = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

vectorstore = Chroma(
    persist_directory=CHROMA_PATH,
    embedding_function=embedding_function
)


def load_and_split_documents(file_path: str) -> List[Document]:
    if file_path.endswith(".pdf"):
        loader = PyPDFLoader(file_path)
    elif file_path.endswith(".html"):
        loader = UnstructuredHTMLLoader(file_path)
    elif file_path.endswith(".docx"):
        loader = Docx2txtLoader(file_path)
    else:
        raise ValueError(f"Unsupported file type: {file_path}")

    documents = loader.load()
    return text_splitter.split_documents(documents)


def index_document_to_chroma(file_path: str, file_id: str) -> bool:
    try:
        splits = load_and_split_documents(file_path)

        for split in splits:
            split.metadata["file_id"] = file_id

        vectorstore.add_documents(splits)
       

        return True
    except Exception as e:
        print(f"Error indexing document: {e}")
        return False

def delete_doc_from_chroma(file_id: int) -> bool:
    """
    Deletes all vectors whose metadata.file_id == file_id.
    Returns True if call succeeded (even if nothing matched).
    """
    try:
        
        vectorstore._collection.delete(where={"file_id": file_id})
        vectorstore._collection.delete(where={"file_id": str(file_id)})
        print(f"Deleted document {file_id} from Chroma")
        return True
    except Exception as e:
        print("Error deleting document from Chroma:", e)
        return False
