

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
    <div className="app-container">
      <header className="app-header">
        <h1>Flashcards Leitner</h1>
      </header>
      
      <div className="app-content">
        {user ? (
          <>
            {/* Menu latéral gauche */}
            <aside className="sidebar">
              <div className="user-info">
                <h3>Menu Utilisateur</h3>
                <p>{user.email}</p>
              </div>
              
              <nav className="side-nav">
                <button 
                  className={`nav-button ${view === 'home' ? 'active' : ''}`}
                  onClick={() => setView('home')}
                >
                  Créer des flashcards
                </button>
                <button 
                  className={`nav-button ${view === 'leitner' ? 'active' : ''}`}
                  onClick={() => setView('leitner')}
                >
                  Lire le deck (Leitner)
                </button>
                <button 
                  className={`nav-button ${view === 'user' ? 'active' : ''}`}
                  onClick={() => setView('user')}
                >
                  Gestion utilisateur
                </button>
              </nav>
            </aside>
            
            {/* Contenu principal */}
            <main className="main-content">
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
                  
                  {view === 'user' && (
                    <div className="user-management">
                      <h2>Gestion de votre compte</h2>
                      <AuthComponent user={user} onUserChange={setUser} />
                    </div>
                  )}
                </>
              )}
            </main>
          </>
        ) : (
          <div className="login-container">
            <h2>Bienvenue sur Flashcards Leitner</h2>
            <p>Veuillez vous connecter pour accéder à vos flashcards.</p>
            <AuthComponent user={user} onUserChange={setUser} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
