import './PlaybackTools.scss'

(() => {
  const PlaybackTools = class extends HTMLElement {
    public iconlist: string[];

    constructor() {
      super();
      this.iconlist = ['play', 'stop', 'repeat', 'fastRewind', 'fastForward', 'skipPrev', 'skipNext'];

    }

    connectedCallback() {
      this.render();
    }

    render() {
      this.innerHTML = `
                <div class="playback-tools">
                  ${this.iconlist.reduce((acc, icon) => acc + `<audi-icon-button id="${icon}" color="white" icontype="${icon}" size="32px"></audi-icon-button>`, '')}
                </div>
            `;
    }
  };
  customElements.define('audi-playback-tools', PlaybackTools);
})()

export { };
