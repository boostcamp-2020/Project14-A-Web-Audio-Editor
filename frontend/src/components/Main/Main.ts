import { Track } from '@model';
import { Controller } from '@controllers';
import './Main.scss';

(() => {
  const Main = class extends HTMLElement {
    private trackList : Track[];

    constructor() {
      super();
      this.trackList = Controller.getTrackList();   
    }

    connectedCallback(): void {
      this.render();
    }

    render(): void {
      this.innerHTML = `
                  <main class="audi-main-container">
                    <div class="audi-main-content">
                        <aside>
                            <audi-side-bar></audi-side-bar>
                        </aside>
                        <section class="audi-main-audio-track-container">
                            <audi-playbar></audi-playbar>
                            ${this.getTrackList()}
                        </section>
                    </div>
                  </main>
              `;
    }

    getTrackList(): string {
      return this.trackList.reduce((acc, cur, idx)=> 
        acc += `<audi-audio-track data-id=${idx}></audi-audio-track>`, "");
    }
  };

  customElements.define('audi-main', Main);
})();

export {};
