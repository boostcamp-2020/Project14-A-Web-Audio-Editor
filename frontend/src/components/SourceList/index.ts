import "./style.scss";

export {};

(() => {
  interface AudioSourceObj {
    title:string;
  }

  const SourceList = class extends HTMLElement {
    public sources:Array<AudioSourceObj>;
    public sourceList:string;
    
    constructor() {
      super();

      this.sources = [];
      this.sourceList="";
    }

    connectedCallback() {
      this.render();
    }

    getSources() {
      this.sources = [{title:"sample1.mp4"}, {title:"sample2.mp4"}];

      this.sourceList = this.sources.reduce((acc, source)=>{
        return acc + `<div class="audio-source">${source.title}
                        <div class="source-info">정보...</div>
                      </div>`
        }, "")
    }

    render() {
      this.getSources();

      this.innerHTML = `
          <div class="source-list-outer-wrap">
            <div class="source-list-title">
                <div> Source </div>        
            </div>
            <div class="source-list-wrap">
                ${this.sourceList}
            </div>
          </div>
      `;
    }
  };
  customElements.define('source-list', SourceList);
})();
