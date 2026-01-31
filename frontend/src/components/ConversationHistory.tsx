"use client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ConversationHistoryProps {
  messages: Message[];
}

export default function ConversationHistory({ messages }: ConversationHistoryProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">💬</span>
        <h3 className="font-medium text-foreground-primary text-sm">המשך השיחה</h3>
      </div>

      {messages.map((message, index) => (
        <div
          key={index}
          className={`animate-fade-slide-up ${
            message.role === "user" ? "flex justify-end" : ""
          }`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {message.role === "user" ? (
            <div className="max-w-[85%] p-3 rounded-lg bg-accent-primary/10 border border-accent-primary/30">
              <p className="text-foreground-primary text-sm">{message.content}</p>
            </div>
          ) : (
            <div className="card p-4">
              <p className="text-foreground-primary leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
