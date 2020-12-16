import { IconType } from '@types';
import { icons, iconInfo } from './icons';
import './IconButton.scss';

(() => {
  const IconButton = class extends HTMLElement {
    private icontype: IconType | null;
    private color: string;
    private size: string;
    private isDoneInit: Boolean;

    constructor() {
      super();
      this.icontype = null;
      this.color = 'rgb(201,209,217)'
      this.size = '20px';
      this.isDoneInit = false;
    }

    static get observedAttributes(): string[] {
      return ['icontype', 'size', 'data-event-key'];
    }

    attributeChangedCallback(attrName: string, oldVal: string, newVal: string): void {
      if (oldVal === newVal) return;

      switch (attrName) {
        case 'icontype':
          this.icontype = IconType[newVal];
          break;
        case 'size':
          this.size = newVal;
          break;
      }
      this[attrName] = newVal;
      if (this.isDoneInit)
        this.render();
    }

    connectedCallback(): void {
      this.render();
      this.isDoneInit = true;
    }

    render(): void {
      this.innerHTML = `
              <div class="icon-buttion-wrap">
                  <svg
                  class="icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="${this.icontype === 'blade' ? '0 0 244 245' : '0 0 24 24'}"
                  role="img"
                  width="${this.size}"
                  height="${this.size}"
                  event-delegation
                >
                  ${this.getIcon()}
                </svg>
                <div class="icon-info">${this.icontype ? iconInfo[this.icontype] : ''} </div>
              </div>
            `;
    }

    getIcon() {
      if (!this.color || !this.icontype) return;

      switch (this.icontype) {
        case IconType.record_on:
          return `<circle event-delegation xmlns="http://www.w3.org/2000/svg" cx="12" cy="12" r="8" fill=${this.color}></circle>`;
        case IconType.zoomIn:
          return `<path event-delegation fillRule="evenodd" fill="${this.color}" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
          <path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z" fill="${this.color}"></path>`;
        case IconType.blade:
          return `<g transform="translate(0.000000,245.000000) scale(0.100000,-0.100000)" fill="${this.color}" stroke="none">
            <path d="M973 2370 c-90 -82 -119 -94 -144 -63 -8 9 -36 34 -62 55 -44 34 -55 38 -107 38 l-59 0 -120 -112 c-66 -62 -189 -184 -272 -271 -126 -131 -153 -165 -158 -195 -12 -71 -3 -98 55 -162 30 -33 54 -68 54 -78 0 -9 -36 -56 -80 -104 -44 -47 -80 -95 -80 -105 0 -23 1334 -1357 1368 -1367 20 -7 36 5 107 73 49 47 93 81 105 81 11 0 44 -22 74 -49 66 -60 119 -78 174 -60 27 9 98 72 266 238 291 288 306 306 306 376 0 47 -5 59 -38 102 -21 26 -46 54 -55 62 -32 26 -20 57 58 139 59 63 75 86 75 110 0 26 -82 111 -675 701 -372 369 -682 671 -690 671 -8 0 -54 -36 -102 -80z m727 -675 l625 -625 -51 -52 c-74 -76 -84 -95 -84 -154 0 -45 5 -59 38 -101 21 -26 46 -54 55 -62 36 -29 20 -54 -132 -212 -81 -85 -196 -198 -254 -252 -106 -98 -106 -98 -134 -83 -15 8 -41 29 -58 46 -41 44 -76 60 -128 60 -49 0 -92 -26 -159 -97 l-38 -39 -627 628 -627 627 57 60 c62 65 77 94 77 147 0 43 -19 80 -60 119 -17 17 -38 43 -47 59 -18 35 -37 12 257 309 165 167 231 227 248 227 14 0 48 -21 83 -52 53 -46 65 -52 114 -56 62 -5 96 13 170 88 21 22 42 40 45 40 3 0 286 -281 630 -625z"/>
            <path d="M575 1870 c-64 -65 -68 -71 -59 -97 11 -32 54 -43 80 -22 13 10 23 4 64 -37 44 -44 49 -54 52 -98 3 -66 23 -86 86 -86 44 0 52 -4 95 -48 45 -45 46 -49 35 -78 -21 -56 10 -87 66 -66 29 11 33 10 78 -35 32 -32 48 -56 48 -73 0 -43 35 -88 77 -99 21 -6 43 -11 48 -11 6 0 33 -22 60 -50 40 -41 46 -52 36 -64 -17 -20 -10 -66 11 -80 13 -8 26 -7 50 2 31 12 34 11 80 -35 44 -43 48 -52 48 -93 0 -65 16 -82 83 -88 50 -4 59 -9 102 -52 45 -46 46 -49 32 -71 -28 -45 16 -94 61 -70 24 13 132 129 132 142 0 43 -48 62 -91 37 -18 -12 -25 -8 -69 39 -46 48 -50 55 -50 102 0 65 -16 81 -83 81 -48 0 -55 3 -99 47 -47 46 -47 47 -31 74 23 39 5 79 -35 79 -15 0 -33 -5 -39 -11 -25 -25 -114 63 -120 116 -7 65 -51 105 -117 105 -11 0 -42 21 -67 46 -46 45 -47 48 -32 70 34 53 -18 105 -71 71 -22 -15 -25 -14 -68 31 -42 43 -46 52 -50 105 -3 32 -10 63 -16 69 -7 7 -38 14 -71 16 -55 4 -62 8 -105 51 -41 42 -45 49 -32 61 23 18 20 67 -3 80 -34 18 -45 12 -116 -60z"/>
          </g>`;
        default:
          return `<path event-delegation fillRule="evenodd" fill="${this.color}" d="${icons[IconType[this.icontype]]}"></path>`;
      }
    }
  };

  customElements.define('audi-icon-button', IconButton);
})();

export { };
