import './Main.scss'

(() => {
  const Main = class extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.render();
    }

    render() {
      this.innerHTML = `
                  <main class="audi-main-container">
                    <div class="audi-main-content">
                        <aside>
                            <side-bar></side-bar>
                        </aside>
                        <section>
                            <audio-track width="700" height="150"></audio-track>
                        </section>
                    </div>
                  </main>
              `;
    }
  };
  customElements.define('audi-main', Main);
})();

export {};
