from pydantic import BaseModel
from typing import Optional
from enum import Enum

class ModelType(str, Enum):
    gemini_2_5_flash_lite = "gemini-2.5-flash-lite"
    gemini_2_5_flash = "gemini-2.5-flash"
    
class QueryInput(BaseModel):
    question:str
    session_id:Optional[str]=None
    model:ModelType

class QueryResponse(BaseModel):
    answer: str
    session_id: str
    model: ModelType

class DocumentInfo(BaseModel):
    file_id: str
    filename: str

class DeleteFileRequest(BaseModel):
    file_id: str