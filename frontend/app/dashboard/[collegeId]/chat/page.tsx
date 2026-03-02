"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { sendChatMessageREST } from "@/services/chat_api";

type Message = {
  sender: "user" | "bot";
  text: string;
  isTyping?: boolean;
};

function TypingDots() {
  return (
    <span className="typing-dots">
      <span>.</span>
      <span>.</span>
      <span>.</span>

      <style jsx>{`
        .typing-dots span {
          animation: blink 1.4s infinite both;
          font-weight: bold;
          font-size: 18px;
        }
        .typing-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes blink {
          0% { opacity: 0.2; }
          20% { opacity: 1; }
          100% { opacity: 0.2; }
        }
      `}</style>
    </span>
  );
}

export default function ChatPage() {
  const params = useParams();
  const collegeId = params.collegeId as string;

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("vb_token")
      : null;

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingConvo, setLoadingConvo] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  /* ===============================
     Create conversation ONCE
     =============================== */
  useEffect(() => {
    if (!token || !collegeId) return;

    const createConversation = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL;

        const res = await fetch(
          `${base}/api/v1/chat/conversation?college_id=${collegeId}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to create conversation");
        }

        const data = await res.json();

        if (!data?.id) {
          throw new Error("Invalid conversation response");
        }

        setConversationId(data.id);
      } catch (err) {
        console.error("❌ Conversation creation failed:", err);
      } finally {
        setLoadingConvo(false);
      }
    };

    createConversation();
  }, [token, collegeId]);

  /* ===============================
     Auto scroll
     =============================== */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ===============================
     Send message (REST ONLY)
     =============================== */
  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!conversationId) return;
    if (!token) return;
    if (sending) return;

    const userText = input.trim();

    setInput("");
    setSending(true);

    // Add user bubble
    setMessages(prev => [
      ...prev,
      { sender: "user", text: userText }
    ]);

    // Add typing bubble
    setMessages(prev => [
      ...prev,
      { sender: "bot", text: "", isTyping: true }
    ]);

    try {
      const bot = await sendChatMessageREST(
        conversationId,
        token,
        userText
      );

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          sender: "bot",
          text: bot?.message || "⚠️ Empty response",
        };
        return updated;
      });
    } catch (err) {
      console.error("❌ Chat error:", err);

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          sender: "bot",
          text: "⚠️ Unable to respond right now.",
        };
        return updated;
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container-fluid h-100 d-flex flex-column py-3">

      {/* Header */}
      <div className="mb-2">
        <h5 className="mb-0">Chat Assistant</h5>
        <small className="text-muted">
          {loadingConvo
            ? "Initializing conversation..."
            : "College knowledge assistant"}
        </small>
      </div>

      {/* Messages */}
      <div className="flex-grow-1 overflow-auto bg-light rounded p-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-2 d-flex ${
              msg.sender === "user"
                ? "justify-content-end"
                : "justify-content-start"
            }`}
          >
            <div
              className={`px-3 py-2 rounded-3 shadow-sm ${
                msg.sender === "user"
                  ? "bg-primary text-white"
                  : "bg-white border"
              }`}
              style={{ maxWidth: "75%" }}
            >
              {msg.isTyping ? <TypingDots /> : msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <div className="mt-3 border rounded p-2 d-flex align-items-end gap-2 bg-white shadow-sm">

        <textarea
          className="form-control border-0"
          rows={1}
          placeholder={
            loadingConvo
              ? "Preparing chat..."
              : "Type your message..."
          }
          value={input}
          disabled={loadingConvo}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          style={{ resize: "none" }}
        />

        {/* Voice Button (UI Only) */}
        <button
          className="btn btn-light"
          disabled
          title="Voice input coming soon"
        >
          <i className="bi bi-mic"></i>
        </button>

        {/* Send Button */}
        <button
          className="btn btn-primary"
          onClick={sendMessage}
          disabled={
            sending ||
            loadingConvo ||
            !input.trim()
          }
        >
          <i className="bi bi-send-fill"></i>
        </button>
      </div>
    </div>
  );
}