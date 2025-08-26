import { LitElement, html, css } from 'lit';
import { createFlashcard } from '../services/supabaseService.js';

export class FlashcardForm extends LitElement {
  static styles = css`
    :host {
      display: block;
      margin-bottom: 2rem;
    }
    
    h2 {
      margin-top: 0;
    }
    
    form {
      margin-bottom: 1rem;
    }
    
    input {
      padding: 0.6rem 1rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 1rem;
      margin-right: 0.5rem;
      margin-bottom: 0.5rem;
    }
    
    button {
      padding: 0.6rem 1rem;
      background-color: #646cff;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    button:hover {
      background-color: #5258cc;
    }
    
    .success {
      color: #2ecc71;
      margin-top: 0.5rem;
    }
    
    .error {
      color: #e74c3c;
      margin-top: 0.5rem;
    }
  `;

  static properties = {
    question: { type: String },
    answer: { type: String },
    errorMsg: { type: String },
    successMsg: { type: String }
  };

  constructor() {
    super();
    this.question = '';
    this.answer = '';
    this.errorMsg = '';
    this.successMsg = '';
  }

  async addFlashcard(e) {
    e.preventDefault();
    this.errorMsg = '';
    this.successMsg = '';
    
    if (this.question && this.answer) {
      try {
        const { status, data } = await createFlashcard({ 
          question: this.question, 
          answer: this.answer, 
          box: 1 
        });
        
        if (status === 201) {
          this.successMsg = 'La carte a bien été ajoutée en base de données.';
          if (data && data[0]) {
            this.dispatchEvent(new CustomEvent('flashcard-added', {
              detail: data[0]
            }));
          }
          this.question = '';
          this.answer = '';
        } else {
          this.errorMsg = "Impossible d'ajouter la flashcard. Vérifiez la connexion à Supabase et les permissions.";
        }
      } catch (error) {
        this.errorMsg = "Erreur lors de l'ajout de la flashcard: " + error.message;
      }
    }
  }

  render() {
    return html`
      <div>
        <h2>Créer une flashcard</h2>
        <form @submit=${this.addFlashcard}>
          <input
            type="text"
            placeholder="Question"
            .value=${this.question}
            @input=${e => this.question = e.target.value}
            required
          />
          <input
            type="text"
            placeholder="Réponse"
            .value=${this.answer}
            @input=${e => this.answer = e.target.value}
            required
          />
          <button type="submit">Ajouter</button>
        </form>
        ${this.errorMsg ? html`<p class="error">${this.errorMsg}</p>` : ''}
        ${this.successMsg ? html`<p class="success">${this.successMsg}</p>` : ''}
      </div>
    `;
  }
}

customElements.define('flashcard-form', FlashcardForm);
