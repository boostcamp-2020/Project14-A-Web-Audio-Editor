export {};

(() => {
  const SampleComponent = class extends HTMLElement {
    public text: string;

    constructor() {
      super();
      this.text = 'test';
    }

    connectedCallback() {
      this.render();
    }

    render() {
      this.innerHTML = `
                <h1>${this.text}</h1>
            `;
    }
  };
  customElements.define('sample-component', SampleComponent);
})();
