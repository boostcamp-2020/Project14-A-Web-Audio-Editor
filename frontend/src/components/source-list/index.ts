import "./source-list.scss";

export {};

(() => {
  const SourceList = class extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.render();
    }

    render() {
      const sources = [{title:"sample1.mp4"}, {title:"sample2.mp4"}];
      let sourceList:string="";
      sources.forEach((source)=>{
        sourceList += `<div class="audio-source">${source.title}
                            <div class="source-info">정보...</div>
                       </div>`;
        } )

      this.innerHTML = `
                  <div class="source-list-outer-wrap">
                    <div class="source-list-title">
                        <div> Source </div>        
                    </div>
                    <div class="source-list-wrap">
                        ${sourceList}
                    </div>
                  </div>
              `;
    }
  };
  customElements.define('source-list', SourceList);
})();
