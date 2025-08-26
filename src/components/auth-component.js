import { LitElement, html, css } from 'lit';
import { signIn, signUp, signOut } from '../services/supabaseService.js';

export class AuthComponent extends LitElement {
  static styles = css`
    :host {
      display: block;
      margin-bottom: 1.5rem;
    }
    
    h2 {
      margin-top: 0;
    }
    
    .form-group {
      margin-bottom: 1rem;
      text-align: left;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    
    .form-group input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 1rem;
    }
    
    .auth-buttons {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }
    
    .auth-buttons button {
      flex: 1;
      padding: 0.6rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      transition: background-color 0.3s;
    }
    
    button[type="submit"] {
      background-color: #646cff;
      color: white;
    }
    
    button[type="submit"]:hover {
      background-color: #5258cc;
    }
    
    button[type="button"] {
      background-color: #e0e0e0;
    }
    
    button[type="button"]:hover {
      background-color: #d0d0d0;
    }
    
    .error {
      color: #e74c3c;
      margin-top: 0.5rem;
    }
  `;

  static properties = {
    user: { type: Object },
    email: { type: String },
    password: { type: String },
    mode: { type: String }, // 'signIn' ou 'signUp'
    error: { type: String },
    loading: { type: Boolean }
  };

  constructor() {
    super();
    this.user = null;
    this.email = '';
    this.password = '';
    this.mode = 'signIn';
    this.error = '';
    this.loading = false;
  }

  async handleAuth(e) {
    e.preventDefault();
    this.error = '';
    this.loading = true;

    try {
      let result;
      
      if (this.mode === 'signIn') {
        result = await signIn(this.email, this.password);
      } else {
        result = await signUp(this.email, this.password);
      }

      if (result.error) {
        this.error = result.error.message;
      } else {
        // Mettre à jour l'état utilisateur
        if (this.mode === 'signIn') {
          this.dispatchEvent(new CustomEvent('user-change', {
            detail: result.data?.user || null
          }));
        } else {
          this.error = 'Vérifiez votre email pour confirmer votre inscription.';
        }
        
        // Réinitialiser les champs
        this.email = '';
        this.password = '';
      }
    } catch (err) {
      this.error = 'Une erreur est survenue: ' + err.message;
    } finally {
      this.loading = false;
    }
  }

  async handleSignOut() {
    this.loading = true;
    try {
      await signOut();
      this.dispatchEvent(new CustomEvent('user-change', { detail: null }));
    } catch (err) {
      this.error = 'Erreur de déconnexion: ' + err.message;
    } finally {
      this.loading = false;
    }
  }

  render() {
    if (this.user) {
      return html`
        <div>
          <p>Connecté en tant que: ${this.user.email}</p>
          <button @click=${this.handleSignOut} ?disabled=${this.loading}>
            ${this.loading ? 'Déconnexion...' : 'Se déconnecter'}
          </button>
        </div>
      `;
    }

    return html`
      <div>
        <h2>${this.mode === 'signIn' ? 'Connexion' : 'Inscription'}</h2>
        <form @submit=${this.handleAuth}>
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              .value=${this.email}
              @input=${e => this.email = e.target.value}
              required
            />
          </div>
          <div class="form-group">
            <label for="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              .value=${this.password}
              @input=${e => this.password = e.target.value}
              required
              minlength="6"
            />
          </div>
          ${this.error ? html`<p class="error">${this.error}</p>` : ''}
          <div class="auth-buttons">
            <button type="submit" ?disabled=${this.loading}>
              ${this.loading ? 'Chargement...' : this.mode === 'signIn' ? 'Se connecter' : 'S\'inscrire'}
            </button>
            <button
              type="button"
              @click=${() => this.mode = this.mode === 'signIn' ? 'signUp' : 'signIn'}
              ?disabled=${this.loading}
            >
              ${this.mode === 'signIn' ? 'Créer un compte' : 'Déjà inscrit ?'}
            </button>
          </div>
        </form>
      </div>
    `;
  }
}

customElements.define('auth-component', AuthComponent);
