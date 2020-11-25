import icons from './icons'
export { };


(() => {
  const IconButton = class extends HTMLElement {
    public icontype: string;
    public color: string;
    public size: string;

    constructor() {
      super();
      this.icontype = '';
      this.color = 'white';
      this.size = '20px';
    }

    static get observedAttributes() {
      return ['icontype', 'color', 'size'];
    }
    connectedCallback() {
      this.render();
    }
    attributeChangedCallback(attrName, oldVal, newVal) {
      this[attrName] = newVal;
    }


    render() {
      this.innerHTML = `
              <div>
                  <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="${this.icontype === 'blade' ? '0 0 244 245' : '0 0 24 24'}"
                  role="img"
                  width="${this.size}"
                  height="${this.size}"
                >
                  ${icons[this.icontype](this.color)}
                </svg>
              </div>
            `;
    }
  };
  customElements.define('icon-button', IconButton);
})();
