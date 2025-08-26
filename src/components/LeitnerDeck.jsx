import { useState } from 'react';
import { updateFlashcard } from '../services/supabaseService';

function LeitnerDeck({ flashcards, onFlashcardUpdated }) {
  const [currentBox, setCurrentBox] = useState(1);
  const boxes = [1, 2, 3, 4, 5];
  const cardsInBox = flashcards.filter(fc => fc.box === currentBox);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  async function handleCorrect() {
    setShowAnswer(false);
    const card = cardsInBox[currentIdx];
    if (card) {
      const newBox = Math.min(card.box + 1, 5);
      await updateFlashcard(card.id, { box: newBox });
      onFlashcardUpdated(card.id, newBox);
    }
    setCurrentIdx(idx => idx + 1);
  }

  async function handleIncorrect() {
    setShowAnswer(false);
    const card = cardsInBox[currentIdx];
    if (card) {
      await updateFlashcard(card.id, { box: 1 });
      onFlashcardUpdated(card.id, 1);
    }
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
      ) : currentIdx >= cardsInBox.length ? (
        <p>Vous avez terminé toutes les cartes de cette boîte!</p>
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
            <button onClick={handleCorrect}>Bonne réponse</button>
            <button onClick={handleIncorrect} style={{ marginLeft: '1em' }}>Mauvaise réponse</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeitnerDeck;
