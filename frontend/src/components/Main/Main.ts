import './Main.scss';

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
                            <audi-side-bar></audi-side-bar>
                        </aside>
                        <section>
                            <audi-playbar></audi-playbar>
                            <audi-audio-track width="700" height="150"></audi-audio-track>
                        </section>
                    </div>
                  </main>
              `;
    }
  };
  customElements.define('audi-main', Main);
})();

export {};
