

import { useState, useEffect } from 'react';
import './App.css';
import { fetchAllFlashcards, getCurrentUser } from './services/supabaseService';
import FlashcardForm from './components/FlashcardForm';
import FlashcardList from './components/FlashcardList';
import LeitnerDeck from './components/LeitnerDeck';
import AuthComponent from './components/AuthComponent';

function App() {
  const [flashcards, setFlashcards] = useState([]);
  const [view, setView] = useState('home');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Vérifier si l'utilisateur est connecté au chargement
  useEffect(() => {
    async function checkUser() {
      try {
        const { user: currentUser } = await getCurrentUser();
        setUser(currentUser || null);
      } catch (error) {
        console.error("Erreur lors de la vérification de l'utilisateur:", error);
      }
    }
    
    checkUser();
  }, []);

  // Charger les flashcards quand l'utilisateur change
  useEffect(() => {
    async function loadFlashcards() {
      try {
        setLoading(true);
        if (user) {
          const data = await fetchAllFlashcards();
          setFlashcards(data || []);
        } else {
          setFlashcards([]);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des flashcards:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadFlashcards();
  }, [user]);

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
      
      {/* Composant d'authentification */}
      <div className="auth-wrapper" style={{ marginBottom: '2em' }}>
        <AuthComponent user={user} onUserChange={setUser} />
      </div>
      
      {user ? (
        <>
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
        </>
      ) : (
        <div style={{ textAlign: 'center', marginTop: '2em' }}>
          <p>Veuillez vous connecter pour accéder à vos flashcards.</p>
        </div>
      )}
    </div>
  );
}

export default App;
