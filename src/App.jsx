

import { useState, useEffect } from 'react';
import './App.css';
import { fetchAllFlashcards } from './services/supabaseService';
import FlashcardForm from './components/FlashcardForm';
import FlashcardList from './components/FlashcardList';
import LeitnerDeck from './components/LeitnerDeck';

function App() {
  const [flashcards, setFlashcards] = useState([]);
  const [view, setView] = useState('home');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFlashcards() {
      try {
        setLoading(true);
        const data = await fetchAllFlashcards();
        setFlashcards(data || []);
      } catch (error) {
        console.error("Erreur lors du chargement des flashcards:", error);
      } finally {
        setLoading(false);
      }
    }
    loadFlashcards();
  }, []);

  const handleFlashcardAdded = (newFlashcard) => {
    setFlashcards([...flashcards, newFlashcard]);
  };

  const handleFlashcardUpdated = (id, newBox) => {
    setFlashcards(flashcards.map(fc => 
      fc.id === id ? { ...fc, box: newBox } : fc
    ));
  };

  return (
    <div id="root">
      <h1>Flashcards Leitner</h1>
      <nav style={{ marginBottom: '2em' }}>
        <button onClick={() => setView('home')}>Créer des flashcards</button>
        <button onClick={() => setView('leitner')}>Lire le deck (Leitner)</button>
      </nav>
      
      {loading ? <p>Chargement...</p> : (
        <>
          {view === 'home' && (
            <div>
              <FlashcardForm onFlashcardAdded={handleFlashcardAdded} />
              <FlashcardList flashcards={flashcards} />
            </div>
          )}
          
          {view === 'leitner' && (
            <LeitnerDeck 
              flashcards={flashcards} 
              onFlashcardUpdated={handleFlashcardUpdated} 
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
