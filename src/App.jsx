
import { useState } from 'react';
import './App.css';

function App() {
  const [flashcards, setFlashcards] = useState([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [view, setView] = useState('home');

  function addFlashcard(e) {
    e.preventDefault();
    if (question && answer) {
      setFlashcards([...flashcards, { question, answer, box: 1 }]);
      setQuestion('');
      setAnswer('');
    }
  }

  return (
    <div id="root">
      <h1>Flashcards Leitner</h1>
      <nav style={{ marginBottom: '2em' }}>
        <button onClick={() => setView('home')}>Créer des flashcards</button>
        <button onClick={() => setView('leitner')}>Lire le deck (Leitner)</button>
      </nav>
      {view === 'home' && (
        <div>
          <h2>Créer une flashcard</h2>
          <form onSubmit={addFlashcard} style={{ marginBottom: '2em' }}>
            <input
              type="text"
              placeholder="Question"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              required
              style={{ marginRight: '1em' }}
            />
            <input
              type="text"
              placeholder="Réponse"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              required
              style={{ marginRight: '1em' }}
            />
            <button type="submit">Ajouter</button>
          </form>
          <h3>Liste des flashcards</h3>
          <ul>
            {flashcards.map((fc, idx) => (
              <li key={idx}><strong>Q:</strong> {fc.question} <strong>R:</strong> {fc.answer}</li>
            ))}
          </ul>
        </div>
      )}
      {view === 'leitner' && (
        <LeitnerDeck flashcards={flashcards} setFlashcards={setFlashcards} />
      )}
    </div>
  );
}

function LeitnerDeck({ flashcards, setFlashcards }) {
  const [currentBox, setCurrentBox] = useState(1);
  const boxes = [1, 2, 3, 4, 5];
  const cardsInBox = flashcards.filter(fc => fc.box === currentBox);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  function handleCorrect() {
    setShowAnswer(false);
    setFlashcards(flashcards => flashcards.map((fc, idx) => {
      if (fc.box === currentBox && idx === flashcards.findIndex((c, i) => c.box === currentBox && i === currentIdx)) {
        return { ...fc, box: Math.min(fc.box + 1, 5) };
      }
      return fc;
    }));
    setCurrentIdx(idx => idx + 1);
  }

  function handleIncorrect() {
    setShowAnswer(false);
    setFlashcards(flashcards => flashcards.map((fc, idx) => {
      if (fc.box === currentBox && idx === flashcards.findIndex((c, i) => c.box === currentBox && i === currentIdx)) {
        return { ...fc, box: 1 };
      }
      return fc;
    }));
    setCurrentIdx(idx => idx + 1);
  }

  function resetBox() {
    setCurrentIdx(0);
    setShowAnswer(false);
  }

  return (
    <div>
      <h2>Deck Leitner</h2>
      <div style={{ marginBottom: '1em' }}>
        {boxes.map(box => (
          <button key={box} onClick={() => { setCurrentBox(box); resetBox(); }} style={{ marginRight: '0.5em' }}>
            Boîte {box} ({flashcards.filter(fc => fc.box === box).length})
          </button>
        ))}
      </div>
      {cardsInBox.length === 0 ? (
        <p>Aucune carte dans cette boîte.</p>
      ) : (
        <div>
          <h3>Carte {currentIdx + 1} / {cardsInBox.length}</h3>
          <div style={{ marginBottom: '1em' }}>
            <strong>Question :</strong> {cardsInBox[currentIdx].question}
          </div>
          {showAnswer ? (
            <div style={{ marginBottom: '1em' }}>
              <strong>Réponse :</strong> {cardsInBox[currentIdx].answer}
            </div>
          ) : (
            <button onClick={() => setShowAnswer(true)} style={{ marginBottom: '1em' }}>Afficher la réponse</button>
          )}
          <div>
            <button onClick={handleCorrect} disabled={currentIdx >= cardsInBox.length}>Bonne réponse</button>
            <button onClick={handleIncorrect} disabled={currentIdx >= cardsInBox.length} style={{ marginLeft: '1em' }}>Mauvaise réponse</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
