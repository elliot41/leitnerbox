import { LitElement, html, css } from "lit";
import { updateFlashcard } from "../services/supabaseService.js";

export class LeitnerDeck extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    h2 {
      margin-top: 0;
    }

    .box-nav {
      display: flex;
      flex-wrap: wrap;
      margin-bottom: 1.5rem;
      gap: 0.5rem;
    }

    .box-button {
      padding: 0.6rem 1rem;
      background-color: #444;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
      flex: 1 1 auto;
      min-width: 80px;
      text-align: center;
    }

    .box-button:hover {
      background-color: #555;
    }

    .box-button.active {
      background-color: #646cff;
    }

    @media (max-width: 480px) {
      .box-button {
        flex: 1 1 calc(33.333% - 0.5rem);
        padding: 0.5rem;
        font-size: 0.9rem;
      }
    }

    .card-container {
      margin-top: 1.5rem;
    }

    .card-content {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }

    .question,
    .answer {
      margin-bottom: 1.5rem;
    }

    .actions {
      margin-top: 1.5rem;
      display: flex;
      gap: 0.5rem;
    }

    .actions button {
      padding: 0.6rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      flex: 1;
    }

    .correct-btn {
      background-color: #2ecc71;
      color: white;
    }

    .incorrect-btn {
      background-color: #e74c3c;
      color: white;
    }

    .show-btn {
      background-color: #3498db;
      color: white;
      width: 100%;
    }

    @media (max-width: 480px) {
      .card-content {
        padding: 1rem;
      }

      .actions {
        flex-direction: column;
      }

      .actions button {
        margin-bottom: 0.5rem;
        padding: 0.8rem;
      }
    }
  `;

  static properties = {
    flashcards: { type: Array },
    currentBox: { type: Number },
    currentIdx: { type: Number },
    showAnswer: { type: Boolean },
  };

  constructor() {
    super();
    this.flashcards = [];
    this.currentBox = 1;
    this.currentIdx = 0;
    this.showAnswer = false;
  }

  get cardsInBox() {
    return this.flashcards.filter((fc) => fc.box === this.currentBox);
  }

  setCurrentBox(box) {
    this.currentBox = box;
    this.resetBox();
  }

  resetBox() {
    this.currentIdx = 0;
    this.showAnswer = false;
  }

  async handleCorrect() {
    this.showAnswer = false;
    const card = this.cardsInBox[this.currentIdx];
    if (card) {
      const newBox = Math.min(card.box + 1, 5);
      await updateFlashcard(card.id, { box: newBox });
      this.dispatchEvent(
        new CustomEvent("flashcard-updated", {
          detail: { id: card.id, newBox },
        })
      );
    }
    this.currentIdx++;
  }

  async handleIncorrect() {
    this.showAnswer = false;
    const card = this.cardsInBox[this.currentIdx];
    if (card) {
      await updateFlashcard(card.id, { box: 1 });
      this.dispatchEvent(
        new CustomEvent("flashcard-updated", {
          detail: { id: card.id, newBox: 1 },
        })
      );
    }
    this.currentIdx++;
  }

  render() {
    const boxes = [1, 2, 3, 4, 5];
    const cardsInBox = this.cardsInBox;

    return html`
      <div>
        <h2>Deck Leitner</h2>

        <div class="box-nav">
          ${boxes.map(
            (box) => html`
              <button
                class="box-button ${this.currentBox === box ? "active" : ""}"
                @click=${() => this.setCurrentBox(box)}
              >
                Boîte ${box}
                (${this.flashcards.filter((fc) => fc.box === box).length})
              </button>
            `
          )}
        </div>

        ${cardsInBox.length === 0
          ? html`<p>Aucune carte dans cette boîte.</p>`
          : this.currentIdx >= cardsInBox.length
          ? html`<p>Vous avez terminé toutes les cartes de cette boîte!</p>`
          : html`
              <div class="card-container">
                <h3>Carte ${this.currentIdx + 1} / ${cardsInBox.length}</h3>
                <div class="card-content">
                  <div class="question">
                    <strong>Question :</strong> ${cardsInBox[this.currentIdx]
                      .question}
                  </div>

                  ${this.showAnswer
                    ? html`
                        <div class="answer">
                          <strong>Réponse :</strong> ${cardsInBox[
                            this.currentIdx
                          ].answer}
                        </div>

                        <div class="actions">
                          <button
                            class="correct-btn"
                            @click=${this.handleCorrect}
                          >
                            Bonne réponse
                          </button>
                          <button
                            class="incorrect-btn"
                            @click=${this.handleIncorrect}
                          >
                            Mauvaise réponse
                          </button>
                        </div>
                      `
                    : html`
                        <button
                          class="show-btn"
                          @click=${() => (this.showAnswer = true)}
                        >
                          Afficher la réponse
                        </button>
                      `}
                </div>
              </div>
            `}
      </div>
    `;
  }
}

customElements.define("leitner-deck", LeitnerDeck);
