import { LitElement, html, css } from 'lit';

export class FlashcardList extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    
    h3 {
      margin-top: 2rem;
      margin-bottom: 1rem;
    }
    
    ul {
      list-style-type: none;
      padding: 0;
    }
    
    li {
      background: white;
      padding: 1rem;
      margin-bottom: 0.5rem;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      text-align: left;
    }
  `;

  static properties = {
    flashcards: { type: Array }
  };

  constructor() {
    super();
    this.flashcards = [];
  }

  render() {
    return html`
      <div>
        <h3>Liste des flashcards</h3>
        <ul>
          ${this.flashcards.length === 0 ? 
            html`<li>Aucune flashcard pour le moment.</li>` :
            this.flashcards.map(fc => html`
              <li key=${fc.id}><strong>Q:</strong> ${fc.question} <strong>R:</strong> ${fc.answer}</li>
            `)
          }
        </ul>
      </div>
    `;
  }
}

customElements.define('flashcard-list', FlashcardList);
