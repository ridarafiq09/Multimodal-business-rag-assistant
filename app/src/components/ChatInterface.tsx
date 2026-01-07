import React, { useState, useRef, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Send,
  Bot,
  User,
  Loader2,
  Image as ImageIcon,
  Mic,
} from "lucide-react";
import { cn } from "../lib/utils";

interface Message {
  role: "user" | "assistant";
  content?: string;
  imageUrl?: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  sessionId: string;
  onSessionChange: (sessionId: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  sessionId,
  onSessionChange,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(
    "gemini-2.5-flash-lite"
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

 
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { api } = await import("../lib/api");
      const data = await api.chat(userMessage.content!, selectedModel);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          timestamp: new Date(),
        },
      ]);

      if (data.session_id && data.session_id !== sessionId) {
        onSessionChange(data.session_id);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "❌ Chat failed. Please check backend logs.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };


  

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        imageUrl: previewUrl,
        timestamp: new Date(),
      },
    ]);

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("question", "Analyze this image");
      formData.append("session_id", sessionId);

      const res = await fetch("http://localhost:8000/chat-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "❌ Image analysis failed.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

 
  
  
  const handleAudioUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: "🎤 Sent an audio message",
        timestamp: new Date(),
      },
    ]);

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("session_id", sessionId);
      formData.append("model", selectedModel);

      const res = await fetch("http://localhost:8000/chat-audio", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `📝 Transcribed: ${data.transcribed_text}`,
          timestamp: new Date(),
        },
        {
          role: "assistant",
          content: data.answer,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "❌ Audio processing failed.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      if (audioInputRef.current) audioInputRef.current.value = "";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* HEADER */}
      <div className="border-b px-6 py-4 bg-background">
       

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">AI Assistant</h2>

          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gemini-2.5-flash-lite">
                Gemini 2.5 Flash Lite
              </SelectItem>
              <SelectItem value="gemini-2.5-flash">
                Gemini 2.5 Flash
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* MESSAGES */}
      
        <div className="flex-1 overflow-y-auto p-8 space-y-8">

        {messages.length === 0 && (
  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
    <Bot className="w-12 h-12 mb-4 text-primary/80" />
    <h3 className="text-xl font-semibold text-foreground mb-1">
      Welcome to RAG AI Assistant
    </h3>
    <p className="max-w-sm">
      Ask questions using text, upload images, or send audio messages.
    </p>
  </div>
)}


        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex gap-4 items-start",
              message.role === "user"
                ? "justify-end"
                : "justify-start"
            )}
          >
            {message.role === "assistant" && (
              <div className="w-9 h-9 rounded-full bg-primary/5 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
            )}

             <Card
  className={cn(
    "max-w-[85%] px-6 py-5 rounded-2xl",

                message.role === "user"
                  ? "bg-primary/10"
                  : "bg-muted/30"
              )}
            >
              {message.imageUrl && (
                <img
                  src={message.imageUrl}
                  alt="Uploaded"
                  className="rounded-xl mb-4 max-w-full"
                />
              )}

              {message.content?.startsWith("📝") ? (
                <p className="text-sm italic text-muted-foreground">
                  {message.content}
                </p>
              ) : (
                message.content && (
                  <p className="text-base leading-relaxed">
                    {message.content}
                  </p>
                )
              )}

              <span className="text-sm text-muted-foreground mt-3 block">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </Card>

            {message.role === "user" && (
              <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4 items-start">
            <div className="w-9 h-9 rounded-full bg-primary/5 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <Card className="px-6 py-5 bg-muted/30 rounded-2xl">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Thinking…
                </span>
              </div>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT BAR (FIXED) */}
      <div className="sticky bottom-0 bg-background border-t px-6 py-4">
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            hidden
            ref={imageInputRef}
            onChange={handleImageUpload}
          />
          <input
            type="file"
            accept="audio/*"
            hidden
            ref={audioInputRef}
            onChange={handleAudioUpload}
          />

          <Button
            variant="outline"
            size="icon"
            title="Upload image"
            onClick={() => imageInputRef.current?.click()}
            disabled={isLoading}
          >
            <ImageIcon className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            title="Send audio"
            onClick={() => audioInputRef.current?.click()}
            disabled={isLoading}
          >
            <Mic className="w-4 h-4" />
          </Button>

          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything… (text, image, or audio)"
            className="flex-1"
            disabled={isLoading}
          />

          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
