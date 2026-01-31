"use client";

interface AnalysisResult {
  perspective: string;
  thoughts: string;
  tips: string[];
  avoid: string[];
  key_phrase: string;
  research_basis: string;
}

interface ResultCardProps {
  result: AnalysisResult;
  otherGender: "male" | "female";
}

export default function ResultCard({ result, otherGender }: ResultCardProps) {
  const genderLabel = otherGender === "male" ? "גברים" : "נשים";
  const genderEmoji = otherGender === "male" ? "👨" : "👩";

  return (
    <div className="space-y-4 animate-fade-slide-up">
      {/* Main Perspective */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">{genderEmoji}</span>
          <h2 className="text-lg font-semibold text-foreground-primary">
            איך {genderLabel} עשויים לתפוס את זה
          </h2>
        </div>
        <p className="text-foreground-primary leading-relaxed">
          {result.perspective}
        </p>
      </div>

      {/* Thoughts */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">💭</span>
          <h2 className="text-lg font-semibold text-foreground-primary">
            מה כנראה עובר להם בראש
          </h2>
        </div>
        <p className="text-foreground-primary leading-relaxed">
          {result.thoughts}
        </p>
      </div>

      {/* Tips */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">💡</span>
          <h2 className="text-lg font-semibold text-foreground-primary">
            טיפים לתקשורת טובה יותר
          </h2>
        </div>
        <ul className="space-y-2">
          {result.tips.map((tip, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-foreground-primary"
            >
              <span className="text-accent-secondary mt-1">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* What to Avoid */}
      <div className="card border-error/20 bg-error/5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">⚠️</span>
          <h2 className="text-lg font-semibold text-foreground-primary">
            מה כדאי להימנע ממנו
          </h2>
        </div>
        <ul className="space-y-2">
          {result.avoid.map((item, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-foreground-primary"
            >
              <span className="text-error mt-1">✗</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Key Phrase */}
      <div className="card border-accent-primary/30 bg-accent-primary/5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">✨</span>
          <h2 className="text-lg font-semibold text-foreground-primary">
            משפט מפתח שיכול לעזור
          </h2>
        </div>
        <p className="text-lg font-medium text-accent-primary text-center py-2">
          &ldquo;{result.key_phrase}&rdquo;
        </p>
      </div>

      {/* Research Basis */}
      <div className="text-center text-sm text-foreground-secondary">
        <span>📚 </span>
        {result.research_basis}
      </div>
    </div>
  );
}
