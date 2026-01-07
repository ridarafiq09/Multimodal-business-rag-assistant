import { useState } from "react";
import { Button } from "../components/ui/button";
import { useSession } from "../contexts/SessionContext";
import { useNavigate } from "react-router-dom";

export default function ImageQA() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { sessionId } = useSession();
  const navigate = useNavigate();

 const askImage = async () => {
  if (!file) return;

  setLoading(true);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("question", "Analyze this image");
  formData.append("session_id", sessionId);

  const res = await fetch("http://localhost:8000/chat-image", {
    method: "POST",
    body: formData,
  });

  const data = await res.json(); // 👈 READ RESPONSE

  setLoading(false);

  // 👇 store image answer in chat via navigation state
  navigate("/", {
    state: {
      imageAnswer: data.answer,
    },
  });
};

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Image Question Answering</h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <Button onClick={askImage} disabled={!file || loading}>
        {loading ? "Analyzing..." : "Ask"}
      </Button>

      <p className="text-sm text-muted-foreground">
        Image will be added to chat memory.
      </p>
    </div>
  );
}
