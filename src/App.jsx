

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './App.css';

const supabaseUrl = 'https://lthyxlwppzscnxrrmtcu.supabase.co';
const supabaseKey = 'sb_publishable_1Ir3hfeSEZwDySIZNn1mtA_PQjs8lfK';
const supabase = createClient(supabaseUrl, supabaseKey);


function App() {
  const [flashcards, setFlashcards] = useState([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [view, setView] = useState('home');
  const [loading, setLoading] = useState(true);

  // Charger les flashcards depuis Supabase au démarrage
  useEffect(() => {
    async function fetchFlashcards() {
      setLoading(true);
      const { data, error } = await supabase
        .from('flashcards')
        .select('*');
      if (!error && data) {
        setFlashcards(data);
      }
      setLoading(false);
    }
    fetchFlashcards();
  }, []);

  // Ajouter une flashcard dans Supabase
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  async function addFlashcard(e) {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (question && answer) {
      const { data, error, status } = await supabase
        .from('flashcards')
        .insert([{ question, answer, box: 1 }]);
      if (status === 201) {
        setSuccessMsg('La carte a bien été ajoutée en base de données.');
        setFlashcards(data && data[0] ? [...flashcards, { ...data[0] }] : flashcards);
        setQuestion('');
        setAnswer('');
      } else {
        setErrorMsg("Impossible d'ajouter la flashcard. Vérifiez la connexion à Supabase et les permissions.");
      }
    }
  }

  // Mettre à jour une flashcard dans Supabase
  async function updateFlashcardBox(id, newBox) {
    await supabase
      .from('flashcards')
      .update({ box: newBox })
      .eq('id', id);
    setFlashcards(flashcards => flashcards.map(fc => fc.id === id ? { ...fc, box: newBox } : fc));
  }

  return (
    <div id="root">
      <h1>Flashcards Leitner</h1>
      <nav style={{ marginBottom: '2em' }}>
        <button onClick={() => setView('home')}>Créer des flashcards</button>
        <button onClick={() => setView('leitner')}>Lire le deck (Leitner)</button>
      </nav>
      {loading ? <p>Chargement...</p> : null}
      {view === 'home' && !loading && (
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
          {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
          {successMsg && <p style={{ color: 'green' }}>{successMsg}</p>}
          <h3>Liste des flashcards</h3>
          <ul>
            {flashcards.map((fc) => (
              <li key={fc.id}><strong>Q:</strong> {fc.question} <strong>R:</strong> {fc.answer}</li>
            ))}
          </ul>
        </div>
      )}
      {view === 'leitner' && !loading && (
        <LeitnerDeck flashcards={flashcards} updateFlashcardBox={updateFlashcardBox} />
      )}
    </div>
  );
}


function LeitnerDeck({ flashcards, updateFlashcardBox }) {
  const [currentBox, setCurrentBox] = useState(1);
  const boxes = [1, 2, 3, 4, 5];
  const cardsInBox = flashcards.filter(fc => fc.box === currentBox);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  async function handleCorrect() {
    setShowAnswer(false);
    const card = cardsInBox[currentIdx];
    if (card) {
      await updateFlashcardBox(card.id, Math.min(card.box + 1, 5));
    }
    setCurrentIdx(idx => idx + 1);
  }

  async function handleIncorrect() {
    setShowAnswer(false);
    const card = cardsInBox[currentIdx];
    if (card) {
      await updateFlashcardBox(card.id, 1);
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
