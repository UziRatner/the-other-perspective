"""FastAPI backend for The Other Perspective."""

import json
import os
import re
from datetime import datetime
from typing import Literal

import anthropic
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from supabase import create_client, Client

from prompts import build_prompt, build_followup_prompt

load_dotenv()

app = FastAPI(
    title="The Other Perspective API",
    description="API for cross-gender communication insights",
    version="1.0.0",
)

# CORS configuration
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
origins = [origin.strip() for origin in allowed_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase: Client | None = None

if supabase_url and supabase_key:
    supabase = create_client(supabase_url, supabase_key)


class Message(BaseModel):
    """A single message in the conversation."""

    role: Literal["user", "assistant"]
    content: str


class AnalyzeRequest(BaseModel):
    """Request body for analysis endpoint."""

    situation: str = Field(
        ...,
        min_length=10,
        max_length=2000,
        description="The situation to analyze",
    )
    user_gender: Literal["male", "female"] = Field(
        ...,
        description="The user's gender",
    )
    context: Literal["relationship", "work"] = Field(
        ...,
        description="The context of the situation",
    )
    messages: list[Message] = Field(
        default=[],
        description="Previous conversation messages for follow-ups",
    )
    device_id: str | None = Field(
        default=None,
        description="Device ID for persistence",
    )
    conversation_id: str | None = Field(
        default=None,
        description="Existing conversation ID for updates",
    )


class AnalyzeResponse(BaseModel):
    """Response body for initial analysis."""

    perspective: str
    thoughts: str
    tips: list[str]
    avoid: list[str]
    key_phrase: str
    research_basis: str
    is_followup: bool = False
    conversation_id: str | None = None


class FollowupResponse(BaseModel):
    """Response body for follow-up messages."""

    response: str
    is_followup: bool = True
    conversation_id: str | None = None


class ConversationSummary(BaseModel):
    """Summary of a conversation for listing."""

    id: str
    situation_preview: str
    user_gender: str
    context: str
    message_count: int
    is_favorite: bool
    created_at: str
    updated_at: str


class ConversationFull(BaseModel):
    """Full conversation data."""

    id: str
    device_id: str
    situation: str
    user_gender: str
    context: str
    messages: list[Message]
    is_favorite: bool
    created_at: str
    updated_at: str


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "supabase": supabase is not None}


@app.get("/api/conversations")
async def get_conversations(device_id: str) -> list[ConversationSummary]:
    """Get all conversations for a device."""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")

    try:
        result = supabase.table("conversations") \
            .select("id, situation, user_gender, context, messages, is_favorite, created_at, updated_at") \
            .eq("device_id", device_id) \
            .order("updated_at", desc=True) \
            .execute()

        conversations = []
        for row in result.data:
            messages = row.get("messages", [])
            conversations.append(ConversationSummary(
                id=row["id"],
                situation_preview=row["situation"][:100] + "..." if len(row["situation"]) > 100 else row["situation"],
                user_gender=row["user_gender"],
                context=row["context"],
                message_count=len(messages),
                is_favorite=row.get("is_favorite", False),
                created_at=row["created_at"],
                updated_at=row["updated_at"],
            ))

        return conversations

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/api/conversations/{conversation_id}")
async def get_conversation(conversation_id: str) -> ConversationFull:
    """Get a specific conversation."""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")

    try:
        result = supabase.table("conversations") \
            .select("*") \
            .eq("id", conversation_id) \
            .single() \
            .execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Conversation not found")

        row = result.data
        messages = [Message(role=m["role"], content=m["content"]) for m in row.get("messages", [])]

        return ConversationFull(
            id=row["id"],
            device_id=row["device_id"],
            situation=row["situation"],
            user_gender=row["user_gender"],
            context=row["context"],
            messages=messages,
            is_favorite=row.get("is_favorite", False),
            created_at=row["created_at"],
            updated_at=row["updated_at"],
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.delete("/api/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str):
    """Delete a conversation."""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")

    try:
        supabase.table("conversations") \
            .delete() \
            .eq("id", conversation_id) \
            .execute()

        return {"status": "deleted"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.patch("/api/conversations/{conversation_id}/favorite")
async def toggle_favorite(conversation_id: str):
    """Toggle favorite status of a conversation."""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")

    try:
        # Get current favorite status
        result = supabase.table("conversations") \
            .select("is_favorite") \
            .eq("id", conversation_id) \
            .single() \
            .execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Conversation not found")

        current_status = result.data.get("is_favorite", False)
        new_status = not current_status

        # Update favorite status
        supabase.table("conversations") \
            .update({"is_favorite": new_status}) \
            .eq("id", conversation_id) \
            .execute()

        return {"is_favorite": new_status}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


async def save_conversation(
    device_id: str,
    conversation_id: str | None,
    situation: str,
    user_gender: str,
    context: str,
    messages: list[dict],
) -> str:
    """Save or update a conversation. Returns conversation ID."""
    if not supabase:
        return None

    try:
        if conversation_id:
            # Update existing conversation
            supabase.table("conversations") \
                .update({
                    "messages": messages,
                    "updated_at": datetime.utcnow().isoformat(),
                }) \
                .eq("id", conversation_id) \
                .execute()
            return conversation_id
        else:
            # Create new conversation
            result = supabase.table("conversations") \
                .insert({
                    "device_id": device_id,
                    "situation": situation,
                    "user_gender": user_gender,
                    "context": context,
                    "messages": messages,
                }) \
                .execute()

            return result.data[0]["id"] if result.data else None

    except Exception as e:
        print(f"Error saving conversation: {e}")
        return conversation_id


@app.post("/api/analyze")
async def analyze_situation(request: AnalyzeRequest) -> AnalyzeResponse | FollowupResponse:
    """Analyze a situation and provide the other gender's perspective."""
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="ANTHROPIC_API_KEY not configured",
        )

    client = anthropic.Anthropic(api_key=api_key)
    is_followup = len(request.messages) > 0

    try:
        if is_followup:
            # Follow-up conversation
            system_prompt = build_followup_prompt(
                situation=request.situation,
                user_gender=request.user_gender,
                context=request.context,
            )

            # Build messages array for Claude
            claude_messages = [
                {"role": msg.role, "content": msg.content}
                for msg in request.messages
            ]

            message = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1024,
                system=system_prompt,
                messages=claude_messages,
            )

            response_text = message.content[0].text

            # Save conversation if device_id provided
            conversation_id = request.conversation_id
            if request.device_id:
                # Add the new assistant response to messages for saving
                all_messages = [{"role": m.role, "content": m.content} for m in request.messages]
                all_messages.append({"role": "assistant", "content": response_text})

                conversation_id = await save_conversation(
                    device_id=request.device_id,
                    conversation_id=request.conversation_id,
                    situation=request.situation,
                    user_gender=request.user_gender,
                    context=request.context,
                    messages=all_messages,
                )

            return FollowupResponse(response=response_text, conversation_id=conversation_id)

        else:
            # Initial analysis
            system_prompt, user_message = build_prompt(
                situation=request.situation,
                user_gender=request.user_gender,
                context=request.context,
            )

            message = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1024,
                system=system_prompt,
                messages=[{"role": "user", "content": user_message}],
            )

            response_text = message.content[0].text

            # Parse JSON response
            try:
                data = json.loads(response_text)
            except json.JSONDecodeError:
                # Try to extract JSON from response if wrapped in markdown
                json_match = re.search(r"\{[\s\S]*\}", response_text)
                if json_match:
                    data = json.loads(json_match.group())
                else:
                    raise HTTPException(
                        status_code=500,
                        detail="Failed to parse AI response",
                    )

            # Save conversation if device_id provided
            conversation_id = None
            if request.device_id:
                initial_messages = [
                    {"role": "user", "content": request.situation},
                    {"role": "assistant", "content": response_text},
                ]
                conversation_id = await save_conversation(
                    device_id=request.device_id,
                    conversation_id=None,
                    situation=request.situation,
                    user_gender=request.user_gender,
                    context=request.context,
                    messages=initial_messages,
                )

            return AnalyzeResponse(
                perspective=data["perspective"],
                thoughts=data["thoughts"],
                tips=data["tips"],
                avoid=data["avoid"],
                key_phrase=data["key_phrase"],
                research_basis=data["research_basis"],
                is_followup=False,
                conversation_id=conversation_id,
            )

    except anthropic.APIError as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI service error: {str(e)}",
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
