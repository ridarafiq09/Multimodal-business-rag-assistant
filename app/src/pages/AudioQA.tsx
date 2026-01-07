import { useState } from "react";
import { Button } from "../components/ui/button";

export default function AudioQA() {
  const [file, setFile] = useState<File | null>(null);
  const [answer, setAnswer] = useState("");

  const askAudio = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:8000/chat-audio", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setAnswer(data.answer);
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Audio Question Answering</h1>

      <input type="file" accept="audio/*" onChange={e => setFile(e.target.files?.[0] || null)} />
      <Button onClick={askAudio}>Ask</Button>

      {answer && <p>{answer}</p>}
    </div>
  );
}
