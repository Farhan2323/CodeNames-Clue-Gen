# Contributing to Codenames AI

Thank you for your interest in contributing! We welcome bug fixes, UI improvements, and new algorithm ideas.

## 🛠️ Local Development Setup

To run this project locally, you need to run the Backend (Python) and Frontend (React) in two separate terminals.

### 1. Backend Setup (The Brain)
The backend runs on FastAPI and uses GloVe vectors.

```bash
# 1. Navigate to root
cd CodeNamesProj

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the server
uvicorn main:app --reload

The server will start at http://127.0.0.1:8000