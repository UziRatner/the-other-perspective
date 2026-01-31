"use client";

import { useState, useEffect } from "react";

interface ConversationSummary {
  id: string;
  situation_preview: string;
  user_gender: string;
  context: string;
  message_count: number;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

interface ConversationsListProps {
  deviceId: string;
  onSelect: (conversationId: string) => void;
  onNewConversation: () => void;
  currentConversationId: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ConversationsList({
  deviceId,
  onSelect,
  onNewConversation,
  currentConversationId,
}: ConversationsListProps) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const fetchConversations = async () => {
    if (!deviceId) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/conversations?device_id=${deviceId}`
      );
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && deviceId) {
      fetchConversations();
    }
  }, [isOpen, deviceId]);

  const handleDelete = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    if (!confirm("למחוק את השיחה?")) return;

    try {
      await fetch(`${API_URL}/api/conversations/${conversationId}`, {
        method: "DELETE",
      });
      setConversations(conversations.filter((c) => c.id !== conversationId));
      if (currentConversationId === conversationId) {
        onNewConversation();
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();

    try {
      const response = await fetch(
        `${API_URL}/api/conversations/${conversationId}/favorite`,
        { method: "PATCH" }
      );
      if (response.ok) {
        const data = await response.json();
        setConversations(
          conversations.map((c) =>
            c.id === conversationId ? { ...c, is_favorite: data.is_favorite } : c
          )
        );
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("he-IL", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getContextEmoji = (context: string) => {
    return context === "relationship" ? "💕" : "💼";
  };

  const getGenderEmoji = (gender: string) => {
    return gender === "male" ? "👨" : "👩";
  };

  const filteredConversations = showFavoritesOnly
    ? conversations.filter((c) => c.is_favorite)
    : conversations;

  const favoriteCount = conversations.filter((c) => c.is_favorite).length;

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                   bg-background-card text-foreground-primary hover:bg-background-secondary
                   border border-gray-200 shadow-sm"
      >
        <span>📚</span>
        <span>השיחות שלי</span>
        <span className="text-foreground-secondary text-sm">
          ({conversations.length})
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 max-h-96 overflow-y-auto
                        bg-background-card rounded-xl shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="p-3 border-b border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-foreground-primary">השיחות שלי</span>
              <button
                onClick={() => {
                  onNewConversation();
                  setIsOpen(false);
                }}
                className="text-sm px-3 py-1 rounded-lg bg-accent-primary text-white hover:brightness-110"
              >
                + שיחה חדשה
              </button>
            </div>
            {/* Filter Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowFavoritesOnly(false)}
                className={`text-xs px-2 py-1 rounded-md transition-colors ${
                  !showFavoritesOnly
                    ? "bg-accent-primary/20 text-accent-primary"
                    : "text-foreground-secondary hover:bg-background-secondary"
                }`}
              >
                הכל ({conversations.length})
              </button>
              <button
                onClick={() => setShowFavoritesOnly(true)}
                className={`text-xs px-2 py-1 rounded-md transition-colors ${
                  showFavoritesOnly
                    ? "bg-accent-primary/20 text-accent-primary"
                    : "text-foreground-secondary hover:bg-background-secondary"
                }`}
              >
                ⭐ מועדפים ({favoriteCount})
              </button>
            </div>
          </div>

          {/* List */}
          {isLoading ? (
            <div className="p-4 text-center text-foreground-secondary">טוען...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-foreground-secondary">
              {showFavoritesOnly ? "אין שיחות מועדפות" : "אין שיחות שמורות"}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => {
                    onSelect(conv.id);
                    setIsOpen(false);
                  }}
                  className={`p-3 cursor-pointer hover:bg-background-secondary transition-colors ${
                    currentConversationId === conv.id
                      ? "bg-accent-primary/10"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-1">
                        <span>{getGenderEmoji(conv.user_gender)}</span>
                        <span>{getContextEmoji(conv.context)}</span>
                        {conv.is_favorite && <span>⭐</span>}
                        <span className="text-xs text-foreground-secondary">
                          {conv.message_count} הודעות
                        </span>
                      </div>
                      <p className="text-sm text-foreground-primary truncate">
                        {conv.situation_preview}
                      </p>
                      <p className="text-xs text-foreground-secondary mt-1">
                        {formatDate(conv.updated_at)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={(e) => handleToggleFavorite(e, conv.id)}
                        className={`p-1 transition-colors ${
                          conv.is_favorite
                            ? "text-yellow-500"
                            : "text-gray-300 hover:text-yellow-500"
                        }`}
                        title={conv.is_favorite ? "הסר ממועדפים" : "הוסף למועדפים"}
                      >
                        {conv.is_favorite ? "⭐" : "☆"}
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, conv.id)}
                        className="text-error/60 hover:text-error p-1"
                        title="מחק"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
