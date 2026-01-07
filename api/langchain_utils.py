from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.chains.history_aware_retriever import create_history_aware_retriever
from langchain.chains.retrieval import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
import os

from api.chroma_utils import vectorstore
from api.db_utils import get_latest_document_ids


contextualize_q_prompt = ChatPromptTemplate.from_messages([
    MessagesPlaceholder("chat_history"),
    ("human",
     "Rewrite the user's question as a standalone question. "
     "Do NOT answer it."),
    ("human", "{input}"),
])

def get_qa_prompt():
    return ChatPromptTemplate.from_messages([
        ("human",
         "Answer the question using ONLY the document context below.\n"
         "If the answer is not present, say exactly:\n"
         "The uploaded documents do not contain this information.\n\n"
         "Context:\n{context}\n\n"
         "Question:\n{input}")
    ])



def get_summary_prompt():
    return ChatPromptTemplate.from_messages([
        ("human",
         "Summarize the uploaded document using ONLY the content below.\n"
         "Do not add external knowledge.\n"
         "Plain text only.\n\n"
         "Context:\n{context}")
    ])


def get_rag_chain(model: str, summary: bool = False):
    llm = ChatGoogleGenerativeAI(
        model=model,
        google_api_key=os.getenv("GOOGLE_API_KEY"),
        convert_system_message_to_human=True
    )

    latest_ids = get_latest_document_ids()
    search_kwargs = {"k": 6}

    if not latest_ids:
     raise ValueError("No documents indexed")


    latest_id = latest_ids[-1]

    search_kwargs["filter"] = {
     "file_id": latest_id
   }


    retriever = vectorstore.as_retriever(search_kwargs=search_kwargs)

    history_aware_retriever = create_history_aware_retriever(
        llm,
        retriever,
        contextualize_q_prompt
    )

    prompt = get_summary_prompt() if summary else get_qa_prompt()

    qa_chain = create_stuff_documents_chain(llm, prompt)

    return create_retrieval_chain(history_aware_retriever, qa_chain)
