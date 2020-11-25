import "./EffectList.scss";

(() => {
  const EffectList = class extends HTMLElement {
    private effects: string[];

    constructor() {
      super();
      this.effects = ['Gain', 'Fade in', 'Fade out', 'Compressor'];
    }

    connectedCallback() {
      this.render();
    }

    render() {
      this.innerHTML = `
                  <ul class="effect-list-container">
                    ${this.getEffectList()}
                  </ul>
              `;
    }

    getEffectList(): string{
        return this.effects.reduce((acc,effect)=>
            acc +=`<li><span>${effect}</span></li>` ,'');
    }
  };
  customElements.define('audi-effect-list', EffectList);
})();

export {};

