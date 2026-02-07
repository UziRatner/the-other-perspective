"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";

export default function PhoneLogin() {
  const { signInWithOtp, verifyOtp } = useAuth();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fullPhone = phone.startsWith("+") ? phone : `+972${phone.replace(/^0/, "")}`;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setIsLoading(true);
    setError(null);

    const { error } = await signInWithOtp(fullPhone);
    setIsLoading(false);

    if (error) {
      setError(error);
    } else {
      setStep("otp");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    setIsLoading(true);
    setError(null);

    const { error } = await verifyOtp(fullPhone, otp);
    setIsLoading(false);

    if (error) {
      setError(error);
    }
  };

  return (
    <div className="card max-w-sm mx-auto animate-fade-slide-up">
      <div className="text-center mb-6">
        <div className="text-3xl mb-3">🔐</div>
        <h2 className="text-lg font-bold text-foreground-primary mb-1">התחברות</h2>
        <p className="text-sm text-foreground-secondary">
          {step === "phone" ? "הזינו את מספר הטלפון שלכם" : "הזינו את הקוד שנשלח אליכם"}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/30 text-error text-sm text-center">
          {error}
        </div>
      )}

      {step === "phone" ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground-secondary mb-1">
              מספר טלפון
            </label>
            <div className="flex gap-2" dir="ltr">
              <span className="flex items-center px-3 rounded-lg bg-background-secondary text-foreground-secondary text-sm border border-gray-200">
                +972
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="50-1234567"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-200 bg-background-card
                           text-foreground-primary placeholder:text-foreground-secondary/50
                           focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary"
                autoFocus
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={!phone.trim() || isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? "שולח..." : "שלחו לי קוד"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground-secondary mb-1">
              קוד אימות
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-background-card
                         text-foreground-primary text-center text-2xl tracking-[0.5em]
                         placeholder:text-foreground-secondary/50 placeholder:tracking-[0.5em]
                         focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary"
              dir="ltr"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={otp.length !== 6 || isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? "מאמת..." : "אימות"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("phone");
              setOtp("");
              setError(null);
            }}
            className="w-full py-2 text-sm text-foreground-secondary hover:text-foreground-primary transition-colors"
          >
            שינוי מספר טלפון
          </button>
        </form>
      )}
    </div>
  );
}
