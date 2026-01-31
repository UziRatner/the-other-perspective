"use client";

import { useState } from "react";

type Gender = "male" | "female";
type Context = "relationship" | "work";

interface AnalysisFormProps {
  onSubmit: (data: {
    situation: string;
    user_gender: Gender;
    context: Context;
  }) => void;
  isLoading: boolean;
}

export default function AnalysisForm({ onSubmit, isLoading }: AnalysisFormProps) {
  const [gender, setGender] = useState<Gender | null>(null);
  const [context, setContext] = useState<Context | null>(null);
  const [situation, setSituation] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gender && context && situation.trim().length >= 10) {
      onSubmit({
        situation: situation.trim(),
        user_gender: gender,
        context,
      });
    }
  };

  const isValid = gender && context && situation.trim().length >= 10;

  return (
    <form onSubmit={handleSubmit} className="card space-y-6">
      {/* Gender Selection */}
      <div className="space-y-3">
        <label className="block text-foreground-primary font-medium">
          אני:
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setGender("male")}
            className={`toggle-btn flex-1 flex items-center justify-center gap-2 ${
              gender === "male" ? "active" : ""
            }`}
          >
            <span className="text-xl">👨</span>
            <span>גבר</span>
          </button>
          <button
            type="button"
            onClick={() => setGender("female")}
            className={`toggle-btn flex-1 flex items-center justify-center gap-2 ${
              gender === "female" ? "active" : ""
            }`}
          >
            <span className="text-xl">👩</span>
            <span>אישה</span>
          </button>
        </div>
      </div>

      {/* Context Selection */}
      <div className="space-y-3">
        <label className="block text-foreground-primary font-medium">
          ההקשר:
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setContext("relationship")}
            className={`toggle-btn flex-1 flex items-center justify-center gap-2 ${
              context === "relationship" ? "active" : ""
            }`}
          >
            <span className="text-xl">💕</span>
            <span>מערכת יחסים</span>
          </button>
          <button
            type="button"
            onClick={() => setContext("work")}
            className={`toggle-btn flex-1 flex items-center justify-center gap-2 ${
              context === "work" ? "active" : ""
            }`}
          >
            <span className="text-xl">💼</span>
            <span>עבודה</span>
          </button>
        </div>
      </div>

      {/* Situation Input */}
      <div className="space-y-3">
        <label className="block text-foreground-primary font-medium">
          תאר/י את המצב:
        </label>
        <textarea
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          placeholder="למשל: הבת זוג שלי אמרה שהיא צריכה 'זמן לעצמה' אחרי שהצעתי שנצא לארוחת ערב..."
          className="w-full h-32 p-4 rounded-lg border border-gray-200 bg-background-secondary
                     text-foreground-primary placeholder:text-foreground-secondary/60
                     focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary
                     resize-none transition-all duration-200"
          dir="rtl"
        />
        <p className="text-sm text-foreground-secondary">
          {situation.length < 10
            ? `מינימום 10 תווים (נשארו ${10 - situation.length})`
            : `${situation.length} תווים`}
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isValid || isLoading}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <span className="animate-pulse-slow">מנתח...</span>
          </>
        ) : (
          <>
            <span>✨</span>
            <span>הראה לי את הפרספקטיבה</span>
          </>
        )}
      </button>
    </form>
  );
}
