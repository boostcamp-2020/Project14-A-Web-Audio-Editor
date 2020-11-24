import iconSet from './iconSet'
export { };


(() => {
  const IconButton = class extends HTMLElement {
    public icontype: string;
    public color: string;
    public size: string;

    constructor() {
      super();
      this.icontype = 'CURSOR';
      this.color = 'black';
      this.size = "15px";
    }

    static get observedAttributes() {
      // 모니터링 할 속성 이름
      return ['icontype', 'color', 'size'];
    }
    connectedCallback() {
      this.render();
    }
    attributeChangedCallback(attrName, oldVal, newVal) {
      // 속성이 추가/제거/변경되었다.
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
                  ${iconSet[this.icontype](this.color)}
                </svg>
              </div>
            `;
    }
  };
  customElements.define('icon-button', IconButton);
})();
