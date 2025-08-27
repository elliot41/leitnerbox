import { LitElement, html, css } from "lit";
import "../components/auth-component.js";
import "../components/flashcard-form.js";
import "../components/flashcard-list.js";
import "../components/leitner-deck.js";
import {
  fetchAllFlashcards,
  getCurrentUser,
} from "../services/supabaseService.js";

export class LeitnerApp extends LitElement {
  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
    }

    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .app-header {
      background-color: #242424;
      padding: 1rem;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    h1 {
      margin: 0;
      font-size: 1.5rem;
    }

    .app-content {
      display: flex;
      flex: 1;
      position: relative;
    }

    /* Menu hamburger */
    .menu-toggle {
      display: none;
      background: none;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.5rem;
      margin-right: 0.5rem;
    }

    /* Sidebar */
    .sidebar {
      width: 250px;
      background-color: #333;
      color: white;
      padding: 1.5rem;
      transition: transform 0.3s ease;
    }

    .user-info {
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #555;
    }

    .user-info h3 {
      margin-top: 0;
    }

    .side-nav {
      display: flex;
      flex-direction: column;
    }

    .nav-button {
      background: none;
      border: none;
      color: #ddd;
      text-align: left;
      padding: 0.8rem 1rem;
      margin-bottom: 0.5rem;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s, color 0.3s;
    }

    .nav-button:hover {
      background-color: #444;
      color: white;
    }

    .nav-button.active {
      background-color: #646cff;
      color: white;
    }

    .main-content {
      flex: 1;
      padding: 2rem;
      overflow-x: hidden;
    }

    .login-container {
      max-width: 500px;
      margin: 2rem auto;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      text-align: center;
    }

    .user-management {
      max-width: 600px;
      margin: 0 auto;
    }

    .loading {
      text-align: center;
      padding: 2rem;
      font-size: 1.2rem;
    }

    /* Overlay pour mobile */
    .overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 1;
    }

    /* Responsive styles */
    @media (max-width: 768px) {
      .app-header {
        padding: 0.75rem 1rem;
      }

      .menu-toggle {
        display: block;
      }

      .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        z-index: 2;
        transform: translateX(-100%);
        box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
      }

      .sidebar.open {
        transform: translateX(0);
      }

      .overlay.open {
        display: block;
      }

      .main-content {
        padding: 1.5rem;
      }
    }
  `;

  static properties = {
    flashcards: { type: Array },
    view: { type: String },
    loading: { type: Boolean },
    user: { type: Object },
    menuOpen: { type: Boolean },
  };

  constructor() {
    super();
    this.flashcards = [];
    this.view = "home";
    this.loading = true;
    this.user = null;
    this.menuOpen = false;
  }

  connectedCallback() {
    super.connectedCallback();
    this.checkUser();
  }

  async checkUser() {
    try {
      const { user } = await getCurrentUser();
      this.user = user;
      if (user) {
        this.loadFlashcards();
      } else {
        this.flashcards = [];
        this.loading = false;
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de l'utilisateur:", error);
      this.loading = false;
    }
  }

  async loadFlashcards() {
    try {
      this.loading = true;
      if (this.user) {
        const data = await fetchAllFlashcards();
        this.flashcards = data || [];
      }
    } catch (error) {
      console.error("Erreur lors du chargement des flashcards:", error);
    } finally {
      this.loading = false;
    }
  }

  handleUserChange(event) {
    this.user = event.detail;
    if (this.user) {
      this.loadFlashcards();
    } else {
      this.flashcards = [];
    }
  }

  handleFlashcardAdded(event) {
    this.flashcards = [...this.flashcards, event.detail];
  }

  handleFlashcardUpdated(event) {
    const { id, newBox } = event.detail;
    this.flashcards = this.flashcards.map((fc) =>
      fc.id === id ? { ...fc, box: newBox } : fc
    );
  }

  setView(view) {
    this.view = view;
    this.closeMenu(); // Fermer le menu quand on change de vue sur mobile
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  render() {
    return html`
      <div class="app-container">
        <header class="app-header">
          ${this.user
            ? html`<button class="menu-toggle" @click=${this.toggleMenu}>
                ☰
              </button>`
            : ""}
          <h1>Flashcards Leitner</h1>
          <div></div>
          <!-- Spacer pour centrer le titre -->
        </header>

        <div class="app-content">
          ${this.user
            ? html`
                <!-- Overlay pour fermer le menu en cliquant en dehors -->
                <div
                  class="overlay ${this.menuOpen ? "open" : ""}"
                  @click=${this.closeMenu}
                ></div>

                <aside class="sidebar ${this.menuOpen ? "open" : ""}">
                  <div class="user-info">
                    <h3>Menu Utilisateur</h3>
                    <p>${this.user.email}</p>
                  </div>

                  <nav class="side-nav">
                    <button
                      class="nav-button ${this.view === "home" ? "active" : ""}"
                      @click=${() => this.setView("home")}
                    >
                      Créer des flashcards
                    </button>
                    <button
                      class="nav-button ${this.view === "leitner"
                        ? "active"
                        : ""}"
                      @click=${() => this.setView("leitner")}
                    >
                      Lire le deck (Leitner)
                    </button>
                    <button
                      class="nav-button ${this.view === "user" ? "active" : ""}"
                      @click=${() => this.setView("user")}
                    >
                      Gestion utilisateur
                    </button>
                  </nav>
                </aside>

                <main class="main-content">
                  ${this.loading
                    ? html`<p class="loading">Chargement...</p>`
                    : html`
                        ${this.view === "home"
                          ? html`
                              <flashcard-form
                                @flashcard-added=${this.handleFlashcardAdded}
                              ></flashcard-form>
                              <flashcard-list
                                .flashcards=${this.flashcards}
                              ></flashcard-list>
                            `
                          : ""}
                        ${this.view === "leitner"
                          ? html`
                              <leitner-deck
                                .flashcards=${this.flashcards}
                                @flashcard-updated=${this
                                  .handleFlashcardUpdated}
                              ></leitner-deck>
                            `
                          : ""}
                        ${this.view === "user"
                          ? html`
                              <div class="user-management">
                                <h2>Gestion de votre compte</h2>
                                <auth-component
                                  .user=${this.user}
                                  @user-change=${this.handleUserChange}
                                ></auth-component>
                              </div>
                            `
                          : ""}
                      `}
                </main>
              `
            : html`
                <div class="login-container">
                  <h2>Bienvenue sur Flashcards Leitner</h2>
                  <p>Veuillez vous connecter pour accéder à vos flashcards.</p>
                  <auth-component
                    .user=${this.user}
                    @user-change=${this.handleUserChange}
                  ></auth-component>
                </div>
              `}
        </div>
      </div>
    `;
  }
}

customElements.define("leitner-app", LeitnerApp);
