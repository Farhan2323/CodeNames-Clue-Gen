import { useState, useEffect } from 'react'
import './App.css'

function App() {
  // 1. STATE: The Board (25 cards)
  // Each card has an ID, a Word, and a Type (color)
  const [cards, setCards] = useState(
    Array.from({ length: 25 }, (_, i) => ({
      id: i,
      word: "",
      type: "neutral" // options: neutral, blue, red, assassin
    }))
  );

  const [clueData, setClueData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fire a quiet request to wake up Render
    fetch('https://codenames-clue-generator.onrender.com/health')
      .then(() => console.log("Server wake-up ping sent!"))
      .catch(err => console.error("Wake-up ping failed:", err));
  }, []); // The empty [] ensures this runs ONLY once when the page loads

  // 2. HELPER: Cycle card colors on click
  const toggleCardType = (index) => {
    const types = ["neutral", "blue", "red", "assassin"];
    const currentTypeIndex = types.indexOf(cards[index].type);
    const nextType = types[(currentTypeIndex + 1) % types.length];

    const newCards = [...cards];
    newCards[index].type = nextType;
    setCards(newCards);
  };

  // 3. HELPER: Handle typing in a card
  const handleWordChange = (index, text) => {
    const newCards = [...cards];
    newCards[index].word = text;
    setCards(newCards);
  };

  // 4. API CALL: Send data to Python
  const generateClue = async () => {
    setLoading(true);
    setClueData(null);

    // 1. Filter BLUE cards (Targets)
    // Remove cards that are empty strings
    const positive = cards
      .filter(c => c.type === 'blue' && c.word.trim() !== '')
      .map(c => c.word.trim());
      
    // 2. Filter RED + ASSASSIN cards (Avoid)
    // Remove cards that are empty strings
    const negative = cards
      .filter(c => (c.type === 'red' || c.type === 'assassin') && c.word.trim() !== '')
      .map(c => c.word.trim());

    // 3. Validation: Stop if no targets are selected
    if (positive.length === 0) {
      setLoading(false);
      alert("Please select at least one Blue Target word!");
      return;
    }

    try {
      const response = await fetch('https://codenames-clue-generator.onrender.com/generate-clue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          positive_words: positive,
          negative_words: negative
        })
      });

      if (!response.ok) {
        throw new Error("Server error");
      }

      const data = await response.json();
      setClueData(data);
    } catch (error) {
      console.error("Error talking to API:", error);
      alert("Error connecting to server. Is the Python backend running?");
    }
    
    setLoading(false);
  };

  return (
    <div className="app-container">
      <h1>Codenames Clue Generator</h1>
      
      {/* INSTRUCTIONS */}
      <p style={{marginBottom: '20px', color: '#666'}}>
        1. Type words into the grid.<br/>
        2. <b>Click cards</b> to change color (Blue = Target, Red = Enemy, Black = Assassin).<br/>
        3. Click "Generate Clue".
      </p>

      {/* THE BOARD */}
      <div className="board">
        {cards.map((card, index) => (
          <div 
            key={card.id} 
            className={`card ${card.type}`}
            onClick={() => toggleCardType(index)}
          >
            {/* Input field prevents clicking parent div, so we stop propagation */}
            <input 
              type="text" 
              placeholder="Word"
              value={card.word}
              onChange={(e) => handleWordChange(index, e.target.value)}
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        ))}
      </div>

      {/* CONTROLS */}
      <div className="controls">
        <button onClick={generateClue} disabled={loading}>
          {loading ? "Thinking..." : "Generate Clue"}
        </button>
      </div>

      {/* RESULTS DISPLAY */}
      {clueData && (
        <div className="clue-box">
          <h2>Top Clues Generated</h2>
          <p className="targets-label">Targets: {clueData.input_positive.join(", ")}</p>
          
          <div className="clue-list">
            {clueData.candidates.map((item, index) => (
              <div key={index} className="clue-item">
                <span className="clue-word">{index + 1}. {item.word.toUpperCase()}</span>
                <span className="clue-score">{(item.score * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default App