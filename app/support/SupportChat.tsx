"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const QUICK_QUESTIONS = [
  "Как купить?",
  "Как продать?",
  "Как открыть спор?",
  "Какая комиссия?",
];

function BotIcon() {
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: "linear-gradient(135deg,#ff9a00,#ff6000)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
        flexShrink: 0,
      }}
    >
      🤖
    </div>
  );
}

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "4px 0" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#ff9a00",
            animation: `typingDot 1.2s infinite`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes typingDot {
          0%,80%,100%{opacity:.25;transform:scale(.8)}
          40%{opacity:1;transform:scale(1)}
        }
      `}</style>
    </div>
  );
}

export default function SupportChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Привет! Я ИИ-ассистент Radmir RP Market. Могу помочь с вопросами о покупке, продаже, спорах и работе платформы. Спрашивай!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: "user", content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      if (res.status === 503) {
        setMessages([...next, {
          role: "assistant",
          content: "Чат поддержки временно недоступен. По вопросам обращайтесь к администратору через раздел «Споры» или напрямую.",
        }]);
        return;
      }

      const data = await res.json();
      if (data.error) {
        setMessages([...next, {
          role: "assistant",
          content: "Не удалось получить ответ. Попробуйте позже или опишите проблему в разделе «Споры».",
        }]);
      } else {
        setMessages([...next, { role: "assistant", content: data.reply }]);
      }
    } catch {
      setError("Нет соединения. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 140px)",
        minHeight: 500,
        maxHeight: 800,
      }}
    >
      {/* Быстрые вопросы */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 20,
        }}
      >
        {QUICK_QUESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => sendMessage(q)}
            disabled={loading}
            style={{
              padding: "9px 16px",
              borderRadius: 999,
              background: "rgba(255,154,0,.10)",
              border: "1px solid rgba(255,154,0,.22)",
              color: "#ffb340",
              fontSize: 13,
              fontWeight: 500,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.5 : 1,
              transition: "background .15s",
              whiteSpace: "nowrap",
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Лента сообщений */}
      <div
        className="card"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
          background: "rgba(10,15,22,.6)",
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 12,
              flexDirection: msg.role === "user" ? "row-reverse" : "row",
              alignItems: "flex-end",
            }}
          >
            {msg.role === "assistant" && <BotIcon />}

            <div
              className={msg.role === "user" ? "" : ""}
              style={{
                maxWidth: "75%",
                padding: "12px 16px",
                borderRadius: msg.role === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                background:
                  msg.role === "user"
                    ? "linear-gradient(135deg,#ff9a00,#ff6000)"
                    : "rgba(255,255,255,.05)",
                border: msg.role === "assistant" ? "1px solid rgba(255,255,255,.07)" : "none",
                color: "#fff",
                fontSize: 15,
                lineHeight: 1.65,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {msg.content}
            </div>

            {msg.role === "user" && (
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,.08)",
                  border: "1px solid rgba(255,255,255,.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                👤
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <BotIcon />
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "20px 20px 20px 4px",
                background: "rgba(255,255,255,.05)",
                border: "1px solid rgba(255,255,255,.07)",
              }}
            >
              <TypingDots />
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: 14,
              background: "rgba(239,68,68,.10)",
              border: "1px solid rgba(239,68,68,.20)",
              color: "#ef4444",
              fontSize: 14,
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Поле ввода */}
      <div
        style={{
          marginTop: 16,
          display: "flex",
          gap: 12,
          alignItems: "flex-end",
        }}
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Напиши вопрос... (Enter — отправить, Shift+Enter — перенос строки)"
          rows={1}
          disabled={loading}
          style={{
            flex: 1,
            background: "#0d1219",
            border: "1px solid #1d2734",
            borderRadius: 16,
            padding: "14px 18px",
            color: "#fff",
            fontSize: 15,
            outline: "none",
            resize: "none",
            lineHeight: 1.5,
            fontFamily: "inherit",
            maxHeight: 120,
            overflowY: "auto",
          }}
          onInput={(e) => {
            const t = e.currentTarget;
            t.style.height = "auto";
            t.style.height = Math.min(t.scrollHeight, 120) + "px";
          }}
        />
        <button
          type="button"
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          className="orangeButton"
          style={{
            height: 52,
            padding: "0 24px",
            flexShrink: 0,
            opacity: loading || !input.trim() ? 0.45 : 1,
            fontSize: 20,
          }}
        >
          ↑
        </button>
      </div>
    </div>
  );
}
