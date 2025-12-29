# Codenames AI Spymaster 🕵️‍♂️
![Project Status](https://img.shields.io/badge/Status-Complete-success)
![Tech Stack](https://img.shields.io/badge/Stack-FastAPI%20|%20React%20|%20NLP-blue)

WEBSITE IS LIVE @ https://code-names-clue-gen.vercel.app/


A Full-Stack application that acts as a "Spymaster" for the board game Codenames. It uses Global Vectors for Word Representation (GloVe) to find semantic relationships between words and generate the optimal clue.
## 💡 The Problem
In the game *Codenames*, a Spymaster must give a single-word clue that connects multiple words on the board while avoiding "instant loss" cards (The Assassin).
Humans struggle with this because:
1.  **Recall limit:** It is hard to mentally scan thousands of words for connections.
2.  **Risk assessment:** We often miss subtle associations between their clue and the Assassin word.

## 🛠️ Solution Architecture
This project solves the problem using **Semantic Vector Space Modeling**.

### The "Brain" (Backend)
* **Engine:** Python & NumPy
* **API:** FastAPI (chosen for async performance and automatic Swagger documentation)
* **Model:** GloVe (Global Vectors for Word Representation) - 300 Dimensions, 6B tokens.

### The "Face" (Frontend)
* **Framework:** React (Vite)
* **Styling:** CSS Modules with Glassmorphism design principles.
* **State Management:** React Hooks (`useState`, `useEffect`) for real-time board manipulation.

---

## 🧠 Technical Implementation (The Algorithm)

The core logic revolves around finding a **Centroid** in a 300-dimensional hypercube.

### 1. Vector Aggregation
We calculate the "ideal" meaning by averaging the vectors of the selected target words:
$$\vec{V}_{target} = \frac{1}{n} \sum_{i=1}^{n} \vec{w}_i$$

### 2. Candidate Search (k-NN)
We use Cosine Similarity to find the $k$ nearest neighbors to $\vec{V}_{target}$ from the 400,000-word vocabulary.

### 3. The "Assassin" Penalty Function
Raw similarity isn't enough; we must avoid the Assassin. I implemented a custom scoring function that penalizes candidates based on their proximity to "bad" words.

$$Score(w) = \cos(\vec{w}, \vec{V}_{target}) - (\lambda \times \max_{b \in B} \cos(\vec{w}, \vec{b}))$$

* Where $\lambda$ is a tunable hyperparameter (currently set to `3.0` to aggressively avoid risk).

### 4. Natural Language Filtering
To ensure clues feel "human," the raw mathematical results pass through three filters:
1.  **Morphology Check:** Uses `NLTK WordNetLemmatizer` to ensure the clue isn't a root variation of a word on the board (e.g., preventing "Run" if "Running" is on the board).
2.  **Part-of-Speech Tagging:** Prioritizes Nouns/Adjectives over Verbs using `nltk.pos_tag`.
3.  **Frequency Analysis:** Filters out obscure words (e.g., "Bartoli") using `wordfreq` to ensure playability for average users.

---
🔮 Future ImprovementsContextual Awareness: Upgrade from GloVe (static embeddings) to BERT/Transformers to understand polysemy (e.g., knowing "Bank" means "River" vs "Money" based on board context).Difficulty Settings: Allow users to adjust the $\lambda$ penalty to take riskier guesses.Mobile Support: Fully responsive PWA design.

---

## 🚀 Installation & Setup

### Prerequisites
* Node.js (v18+)
* Python (v3.9+)

### 1. Backend Setup
```bash
cd CodeNamesProj
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Start the API
uvicorn main:app --reload
```

```bash
cd frontend
npm install
npm run dev

```
The application will run at http://localhost:5173.

----
👨‍💻 Author
Farhan Ahmed  
[LinkedIn](https://www.linkedin.com/in/farhan-y-ahmed/)  
[Twitter/X](https://x.com/FYA243) 
