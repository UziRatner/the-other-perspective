# הפרספקטיבה השנייה | The Other Perspective

A tool for understanding cross-gender communication perspectives in relationships and workplace contexts.

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure API key
cp .env.example .env
# Edit .env and add your Anthropic API key

# Run server
python main.py
```

Backend runs at: http://localhost:8000

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies (already done if you cloned)
npm install

# Run development server
npm run dev
```

Frontend runs at: http://localhost:3000

## API Endpoints

### POST /api/analyze

Analyze a situation and get the other gender's perspective.

**Request:**
```json
{
  "situation": "Description of the situation...",
  "user_gender": "male" | "female",
  "context": "relationship" | "work"
}
```

**Response:**
```json
{
  "perspective": "How the other gender might perceive this...",
  "thoughts": "What they might be thinking...",
  "tips": ["Tip 1", "Tip 2", "Tip 3"],
  "avoid": ["Thing to avoid 1", "Thing to avoid 2"],
  "key_phrase": "A helpful phrase to use",
  "research_basis": "Research source"
}
```

## Tech Stack

- **Backend:** FastAPI + Anthropic Claude API
- **Frontend:** Next.js 14 + Tailwind CSS
- **Language:** Hebrew (RTL)

## Research Foundation

Based on:
- Deborah Tannen's research on gendered communication (Rapport Talk vs Report Talk)
- John Gottman's couples therapy research
- Academic studies on gender communication differences
