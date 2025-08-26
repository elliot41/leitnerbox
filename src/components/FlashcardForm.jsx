import { useState } from 'react';
import { createFlashcard } from '../services/supabaseService';

function FlashcardForm({ onFlashcardAdded }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  async function addFlashcard(e) {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    if (question && answer) {
      try {
        const { status, data } = await createFlashcard({ question, answer, box: 1 });
        
        if (status === 201) {
          setSuccessMsg('La carte a bien été ajoutée en base de données.');
          if (data && data[0]) {
            onFlashcardAdded(data[0]);
          }
          setQuestion('');
          setAnswer('');
        } else {
          setErrorMsg("Impossible d'ajouter la flashcard. Vérifiez la connexion à Supabase et les permissions.");
        }
      } catch (error) {
        setErrorMsg("Erreur lors de l'ajout de la flashcard: " + error.message);
      }
    }
  }

  return (
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
    </div>
  );
}

export default FlashcardForm;
