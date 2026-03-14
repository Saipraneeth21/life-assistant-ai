"use client";

import { useState, useRef, useEffect } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function formatMessage(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/^### (.+)$/gm, "<strong>$1</strong>")
    .replace(/^## (.+)$/gm, "<strong>$1</strong>")
    .replace(/^# (.+)$/gm, "<strong>$1</strong>")
    .replace(/^[-•] (.+)$/gm, (_: string, item: string) => `<li>${item}</li>`)
    .replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (m: string) => `<ul>${m}</ul>`)
    .replace(/^\d+\. (.+)$/gm, (_: string, item: string) => `<li>${item}</li>`)
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>")
    .replace(/^(.+)$/, "<p>$1</p>");
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setShowWelcome(false);
    const userMsg: ChatMessage = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setIsLoading(true);
    setStreamingContent("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6);
          if (payload === "[DONE]") break;
          try {
            const parsed = JSON.parse(payload);
            if (parsed.text) {
              accumulated += parsed.text;
              setStreamingContent(accumulated);
            }
          } catch {
            // incomplete chunk — skip
          }
        }
      }

      if (accumulated) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: accumulated },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ **Error**: ${err instanceof Error ? err.message : "Unknown error"}. Please try again.`,
        },
      ]);
    } finally {
      setIsLoading(false);
      setStreamingContent("");
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">✦</div>
          <div className="logo-text">
            Life Assistant
            <span>Your intelligent companion for daily life</span>
          </div>
        </div>

        <div className="sidebar-label">Quick actions</div>

        {[
          { icon: "📅", label: "Plan my day", prompt: "Plan my day for today" },
          { icon: "✅", label: "View tasks", prompt: "Show my pending tasks" },
          { icon: "⏰", label: "Add reminder", prompt: "Set a reminder for 6pm to exercise" },
          { icon: "💡", label: "Life advice", prompt: "Give me a productivity tip for today" },
          { icon: "🌙", label: "Weekly review", prompt: "Help me reflect on my week" },
        ].map(({ icon, label, prompt }) => (
          <button key={label} className="quick-btn" onClick={() => sendMessage(prompt)}>
            <div className="icon">{icon}</div>
            {label}
          </button>
        ))}

        <div className="sidebar-divider" />
        <div className="sidebar-label">Capabilities</div>

        <button className="quick-btn" onClick={() => sendMessage("What can you help me with?")}>
          <div className="icon">🤖</div>
          What can you do?
        </button>

        <div className="sidebar-footer">
          <div className="status-pill">
            <div className="status-dot" />
            claude-sonnet-4-6 · Active
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main">
        <div className="chat-header">
          <div>
            <div className="chat-title">Life Assistant AI</div>
            <div className="chat-subtitle">Your intelligent daily companion</div>
          </div>
          <div className="header-badge">MVP · v0.1</div>
        </div>

        {/* Messages */}
        <div className="messages">
          {/* Welcome screen */}
          {showWelcome && (
            <div className="welcome">
              <div className="welcome-icon">✦</div>
              <h1>Good to see you.</h1>
              <p>
                I can help you plan your day, manage tasks, set reminders, and
                offer thoughtful life advice. Where shall we start?
              </p>
              <div className="suggestion-grid">
                {[
                  { icon: "📅", title: "Plan my day", sub: "Build a smart schedule", prompt: "Plan my day — I have a meeting at 10am and need to finish a report by 5pm" },
                  { icon: "✅", title: "Manage tasks", sub: "Track what matters", prompt: "Add task: Buy groceries, Call dentist, Submit invoice" },
                  { icon: "⏰", title: "Set reminders", sub: "Never forget again", prompt: "Set a reminder to drink water every hour" },
                  { icon: "🌱", title: "Life advice", sub: "Better habits, better life", prompt: "Give me a morning routine that boosts energy and focus" },
                ].map(({ icon, title, sub, prompt }) => (
                  <div key={title} className="suggestion-card" onClick={() => sendMessage(prompt)}>
                    <div className="sc-icon">{icon}</div>
                    <div className="sc-title">{title}</div>
                    <div className="sc-sub">{sub}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat messages */}
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.role === "user" ? "user" : ""}`}>
              <div className={`avatar ${msg.role === "user" ? "user-av" : "ai"}`}>
                {msg.role === "user" ? "U" : "LA"}
              </div>
              <div
                className={`bubble ${msg.role === "user" ? "user" : "ai"}`}
                dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
              />
            </div>
          ))}

          {/* Streaming response */}
          {isLoading && streamingContent && (
            <div className="message">
              <div className="avatar ai">LA</div>
              <div
                className="bubble ai"
                dangerouslySetInnerHTML={{ __html: formatMessage(streamingContent) }}
              />
            </div>
          )}

          {/* Typing indicator */}
          {isLoading && !streamingContent && (
            <div className="typing-indicator">
              <div className="avatar ai">LA</div>
              <div className="typing-dots">
                <span /><span /><span />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="input-area">
          <div className="input-box">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                autoResize(e.target);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything — plan my day, add a task, set a reminder..."
              rows={1}
            />
            <button
              className="send-btn"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <div className="input-hint">
            Press <strong>Enter</strong> to send · <strong>Shift+Enter</strong> for new line
          </div>
        </div>
      </div>
    </div>
  );
}
