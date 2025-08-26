import { useState } from 'react';
import { signIn, signUp, signOut } from '../services/supabaseService';

function AuthComponent({ user, onUserChange }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('signIn'); // 'signIn' ou 'signUp'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      
      if (mode === 'signIn') {
        result = await signIn(email, password);
      } else {
        result = await signUp(email, password);
      }

      if (result.error) {
        setError(result.error.message);
      } else {
        // Mettre à jour l'état utilisateur dans le composant parent
        if (mode === 'signIn') {
          onUserChange(result.data?.user || null);
        } else {
          setError('Vérifiez votre email pour confirmer votre inscription.');
        }
        
        // Réinitialiser les champs
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      setError('Une erreur est survenue: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      onUserChange(null);
    } catch (err) {
      setError('Erreur de déconnexion: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="auth-container">
        <p>Connecté en tant que: {user.email}</p>
        <button onClick={handleSignOut} disabled={loading}>
          {loading ? 'Déconnexion...' : 'Se déconnecter'}
        </button>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <h2>{mode === 'signIn' ? 'Connexion' : 'Inscription'}</h2>
      <form onSubmit={handleAuth}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Mot de passe</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        {error && <p className="error">{error}</p>}
        <div className="auth-buttons">
          <button type="submit" disabled={loading}>
            {loading ? 'Chargement...' : mode === 'signIn' ? 'Se connecter' : 'S\'inscrire'}
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}
            disabled={loading}
          >
            {mode === 'signIn' ? 'Créer un compte' : 'Déjà inscrit ?'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AuthComponent;
