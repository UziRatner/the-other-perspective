"use client";

import { useState, useEffect } from "react";
import AnalysisForm from "@/components/AnalysisForm";
import ResultCard from "@/components/ResultCard";
import FollowupInput from "@/components/FollowupInput";
import ConversationHistory from "@/components/ConversationHistory";
import ConversationsList from "@/components/ConversationsList";
import PhoneLogin from "@/components/PhoneLogin";
import { useAuth } from "@/components/AuthProvider";

interface AnalysisResult {
  perspective: string;
  thoughts: string;
  tips: string[];
  avoid: string[];
  key_phrase: string;
  research_basis: string;
  is_followup: false;
  conversation_id?: string;
}

interface FollowupResult {
  response: string;
  is_followup: true;
  conversation_id?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ConversationContext {
  situation: string;
  user_gender: "male" | "female";
  context: "relationship" | "work";
}

type Gender = "male" | "female";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [initialResult, setInitialResult] = useState<AnalysisResult | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationContext, setConversationContext] = useState<ConversationContext | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.id ?? "";

  const handleInitialSubmit = async (data: {
    situation: string;
    user_gender: Gender;
    context: "relationship" | "work";
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          user_id: userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "שגיאה בשרת, נסה שוב");
      }

      const resultData: AnalysisResult = await response.json();
      setInitialResult(resultData);
      setConversationContext(data);
      setConversationId(resultData.conversation_id || null);

      // Initialize messages with the initial exchange
      setMessages([
        { role: "user", content: data.situation },
        { role: "assistant", content: JSON.stringify(resultData) },
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "שגיאת תקשורת, נסה שוב"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowup = async (followupMessage: string) => {
    if (!conversationContext) return;

    setIsLoading(true);
    setError(null);

    // Add user message to state immediately
    const newUserMessage: Message = { role: "user", content: followupMessage };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);

    try {
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...conversationContext,
          messages: updatedMessages,
          user_id: userId,
          conversation_id: conversationId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "שגיאה בשרת, נסה שוב");
      }

      const resultData: FollowupResult = await response.json();

      // Update conversation ID if returned
      if (resultData.conversation_id) {
        setConversationId(resultData.conversation_id);
      }

      // Add assistant response to messages
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: resultData.response },
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "שגיאת תקשורת, נסה שוב"
      );
      // Remove the user message if request failed
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setInitialResult(null);
    setMessages([]);
    setConversationContext(null);
    setConversationId(null);
    setError(null);
  };

  const handleLoadConversation = async (convId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/conversations/${convId}`);
      if (!response.ok) {
        throw new Error("Failed to load conversation");
      }

      const conversation = await response.json();

      // Reconstruct the state from saved conversation
      setConversationContext({
        situation: conversation.situation,
        user_gender: conversation.user_gender as Gender,
        context: conversation.context as "relationship" | "work",
      });

      setMessages(conversation.messages);
      setConversationId(conversation.id);

      // Try to reconstruct initial result from first assistant message
      if (conversation.messages.length >= 2) {
        const firstAssistantMessage = conversation.messages[1];
        try {
          const parsed = JSON.parse(firstAssistantMessage.content);
          setInitialResult({
            ...parsed,
            is_followup: false,
            conversation_id: conversation.id,
          });
        } catch {
          // If can't parse, create a minimal result
          setInitialResult({
            perspective: "שיחה שמורה נטענה",
            thoughts: "",
            tips: [],
            avoid: [],
            key_phrase: "",
            research_basis: "",
            is_followup: false,
            conversation_id: conversation.id,
          });
        }
      }
    } catch (err) {
      setError("שגיאה בטעינת השיחה");
    } finally {
      setIsLoading(false);
    }
  };

  const otherGender: Gender = conversationContext?.user_gender === "male" ? "female" : "male";

  // Get follow-up messages (after the initial exchange)
  const followupMessages = messages.slice(2);

  if (authLoading) {
    return (
      <main className="min-h-[100dvh] flex items-center justify-center">
        <div className="text-foreground-secondary animate-pulse-slow">טוען...</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-[100dvh] py-4 md:py-8 px-4">
        <div className="max-w-lg mx-auto">
          <header className="text-center mb-6">
            <div className="text-3xl md:text-4xl mb-3">🔄</div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground-primary mb-2">
              הפרספקטיבה השנייה
            </h1>
            <p className="text-foreground-secondary">
              הבנת נקודת המבט של המין השני
            </p>
          </header>
          <PhoneLogin />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] py-4 md:py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <header className="text-center mb-6">
          <div className="text-3xl md:text-4xl mb-3">🔄</div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground-primary mb-2">
            הפרספקטיבה השנייה
          </h1>
          <p className="text-foreground-secondary">
            הבנת נקודת המבט של המין השני
          </p>
        </header>

        {/* Conversations List */}
        <div className="flex justify-center mb-6">
          <ConversationsList
            userId={userId}
            onSelect={handleLoadConversation}
            onNewConversation={handleReset}
            currentConversationId={conversationId}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/30 text-error text-center">
            {error}
          </div>
        )}

        {/* Main Content */}
        {initialResult ? (
          <div className="space-y-4">
            {/* Initial Analysis Result */}
            <ResultCard
              result={initialResult}
              otherGender={otherGender}
            />

            {/* Conversation History */}
            {followupMessages.length > 0 && (
              <ConversationHistory messages={followupMessages} />
            )}

            {/* Follow-up Input */}
            <FollowupInput onSubmit={handleFollowup} isLoading={isLoading} />

            {/* New Conversation Button */}
            <button
              onClick={handleReset}
              className="w-full py-3 px-6 rounded-lg font-medium transition-all duration-200
                         bg-background-secondary text-foreground-secondary hover:bg-background-secondary/80
                         border border-gray-200"
            >
              🔄 התחל שיחה חדשה
            </button>
          </div>
        ) : (
          <AnalysisForm onSubmit={handleInitialSubmit} isLoading={isLoading} />
        )}

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-foreground-secondary">
          <button
            onClick={signOut}
            className="text-foreground-secondary hover:text-foreground-primary transition-colors underline"
          >
            התנתקות
          </button>
        </footer>
      </div>
    </main>
  );
}
