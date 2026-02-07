"use client";

import { useState } from "react";

interface FollowupInputProps {
  onSubmit: (message: string) => void;
  isLoading: boolean;
}

export default function FollowupInput({ onSubmit, isLoading }: FollowupInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length >= 2 && !isLoading) {
      onSubmit(message.trim());
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">💬</span>
        <h3 className="font-medium text-foreground-primary">שאלת המשך</h3>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="מה אם אגיד לה ש..."
          className="flex-1 p-3 rounded-lg border border-gray-200 bg-background-secondary
                     text-foreground-primary placeholder:text-foreground-secondary/60
                     focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary
                     transition-all duration-200 text-base min-h-[44px]"
          dir="rtl"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={message.trim().length < 2 || isLoading}
          className="px-6 py-3 rounded-lg font-medium transition-all duration-200
                     bg-accent-primary text-white hover:brightness-110
                     disabled:opacity-50 disabled:cursor-not-allowed min-w-[60px] min-h-[44px]"
        >
          {isLoading ? "..." : "שלח"}
        </button>
      </div>
    </form>
  );
}
