const API_BASE = "http://localhost:8000";

export const apiService = {
  async listDocuments() {
    const res = await fetch(`${API_BASE}/list-docs`);
    if (!res.ok) throw new Error("Failed to list documents");
    return res.json();
  },

  async uploadDocument(file: File) {
    const formData = new FormData();
    formData.append("files", file); // MUST be "files"

    const res = await fetch(`${API_BASE}/upload-docs`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");
    return res.json();
  },

  async deleteDocument(fileId: string) {
    const res = await fetch(`${API_BASE}/delete-docs/${fileId}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Delete failed");
    return res.json();
  },
};


function getSessionId() {
  let id = localStorage.getItem("rag-session-id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("rag-session-id", id);
  }
  return id;
}

async function handle(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "API Error");
  }
  return res.json();
}

export const api = {
  async chat(question: string, model: string) {
    return handle(
      await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          model,
          session_id: getSessionId(),
        }),
      })
    );
  },

  async uploadDocs(files: File[]) {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));

    return handle(
      await fetch(`${API_BASE}/upload-docs`, {
        method: "POST",
        body: form,
      })
    );
  },

  async listDocs() {
    return handle(await fetch(`${API_BASE}/list-docs`));
  },

  async deleteDoc(id: string) {
    return handle(
      await fetch(`${API_BASE}/delete-docs/${id}`, {
        method: "DELETE",
      })
    );
  },
};
