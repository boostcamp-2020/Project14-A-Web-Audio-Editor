import './Loading.scss';

(() => {
  const Loading = class extends HTMLElement {
    private loadingElement: HTMLElement | null;

    constructor() {
      super();
      this.loadingElement = null;
    }

    connectedCallback(): void {
      this.render();
      this.initElement();
    }

    initElement(): void {
      this.loadingElement = document.querySelector('audi-loading');
    }

    render(): void {
      this.innerHTML = `
                <div class='loading-box'>
                    <div class='circle'></div>
                </div>
            `;
    }

    startLoading(): void {
      this.loadingElement?.classList.remove('hide');
    }

    endLoading(): void {
      this.loadingElement?.classList.add('hide');
    }
  };
  customElements.define('audi-loading', Loading);
})();

export {};
