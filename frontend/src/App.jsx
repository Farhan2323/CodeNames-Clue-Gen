import { useState, useEffect } from 'react'
import './App.css'

// --- HELPER COMPONENT: Stacked List Input ---
const WordListSection = ({ label, color, list, setList }) => {
  
  // Update a specific input box
  const handleChange = (index, value) => {
    const newList = [...list];
    newList[index] = value;
    setList(newList);
  };

  // Add a new empty box
  const addRow = () => {
    setList([...list, ""]);
  };

  // Remove a specific box
  const removeRow = (index) => {
    const newList = list.filter((_, i) => i !== index);
    setList(newList);
  };

  return (
    <div className={`list-section ${color}`}>
      <div className="section-header">
        <label>{label}</label>
      </div>
      
      <div className="input-stack">
        {list.map((word, index) => (
          <div key={index} className="input-row slide-in">
            <span className="row-number">{index + 1}.</span>
            <input
              type="text"
              value={word}
              placeholder="Type word..."
              onChange={(e) => handleChange(index, e.target.value)}
              autoFocus={index === list.length - 1 && index > 0} // Auto-focus new rows
            />
            <button 
              className="remove-btn" 
              onClick={() => removeRow(index)}
              title="Remove word"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button className="add-row-btn" onClick={addRow}>
        + Add Word
      </button>
    </div>
  );
};

function App() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';  
  const [activeTab, setActiveTab] = useState('board');
  const [clueData, setClueData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // BOARD STATE
  const [cards, setCards] = useState(
    Array.from({ length: 25 }, (_, i) => ({
      id: i, word: "", type: "neutral"
    }))
  );

  // LIST STATE (Start with 3 empty slots for targets, 1 for avoid)
  const [listTargets, setListTargets] = useState(["", "", ""]);
  const [listAvoid, setListAvoid] = useState([""]);

  useEffect(() => {
  // Use the variable instead of the hardcoded link
  fetch(`${API_URL}/health`).catch(() => {});
}, []);

  const toggleCardType = (index) => {
    const types = ["neutral", "blue", "red", "assassin"];
    const currentTypeIndex = types.indexOf(cards[index].type);
    const nextType = types[(currentTypeIndex + 1) % types.length];
    const newCards = [...cards];
    newCards[index].type = nextType;
    setCards(newCards);
  };

  const handleCardChange = (index, text) => {
    const newCards = [...cards];
    newCards[index].word = text;
    setCards(newCards);
  };

  const generateClue = async () => {
    setLoading(true); setClueData(null); setError(null);
    let positive = [], negative = [];

    // Filter empty strings out before sending
    if (activeTab === 'board') {
      positive = cards.filter(c => c.type === 'blue' && c.word.trim()).map(c => c.word.trim());
      negative = cards.filter(c => (c.type === 'red' || c.type === 'assassin') && c.word.trim()).map(c => c.word.trim());
    } else {
      positive = listTargets.filter(w => w.trim() !== "");
      negative = listAvoid.filter(w => w.trim() !== "");
    }

    if (positive.length === 0) {
      setLoading(false); setError("Please add at least one Target word."); return;
    }

    try {
      const response = await fetch(`${API_URL}/generate-clue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ positive_words: positive, negative_words: negative })
      });
      if (!response.ok) throw new Error("Server error");
      const data = await response.json();
      setClueData(data);
    } catch (err) {
      console.error(err);
      setError("Server connection failed.");
    }
    setLoading(false);
  };

  return (
    <div className="app-container">
      <header>
        <h1>Codenames AI</h1>
        <p className="subtitle">Operative Intelligence System</p>
      </header>

      <div className="tabs">
        <button className={`tab ${activeTab === 'board' ? 'active' : ''}`} onClick={() => setActiveTab('board')}>Board View</button>
        <button className={`tab ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>List View</button>
      </div>

      <div className="content-area">
        {activeTab === 'board' ? (
          <div className="board-view">
            <div className="instruction-badge">
              <span className="dot blue"></span>Target 
              <span className="dot red"></span>Enemy 
              <span className="dot black"></span>Assassin
            </div>
            <div className="board">
              {cards.map((card, index) => (
                <div key={card.id} className={`card ${card.type}`} onClick={() => toggleCardType(index)}>
                  <input value={card.word} onChange={(e) => handleCardChange(index, e.target.value)} onClick={(e) => e.stopPropagation()} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="list-view-container">
            <WordListSection 
              label="Targets (Blue Agents)" 
              color="blue"
              list={listTargets} 
              setList={setListTargets}
            />
            <WordListSection 
              label="Avoid (Red / Assassin)" 
              color="red"
              list={listAvoid} 
              setList={setListAvoid}
            />
          </div>
        )}

        <div className="controls">
          {error && <div className="error-msg">{error}</div>}
          <button className="generate-btn" onClick={generateClue} disabled={loading}>
            {loading ? "Analyzing..." : "Generate Clues"}
          </button>
        </div>
      </div>

      {clueData && (
        <div className="clue-box">
          <div className="clue-header">
            <h3>Top Clues</h3>
            <span className="target-pill">Targets: {clueData.input_positive.join(", ")}</span>
          </div>
          {clueData.candidates.map((item, index) => (
            <div key={index} className="clue-item">
              <div className="clue-rank">#{index + 1}</div>
              <div className="clue-content">
                <span className="clue-word">{item.word.toUpperCase()}</span>
                <div className="progress-bar"><div style={{width: `${item.score * 100}%`}}></div></div>
              </div>
              <span className="clue-score">{(item.score * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App