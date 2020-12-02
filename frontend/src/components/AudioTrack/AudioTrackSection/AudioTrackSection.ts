import { Controller } from "@controllers";
import "./AudioTrackSection.scss";

(() => {
   const AudioTrackSection = class extends HTMLElement {
        private trackId: number;
        private sectionId: number;
        private sectionChannelData: number[] | undefined;
        private trackCanvasElement: HTMLCanvasElement | undefined | null;

        constructor(){
            super();
            this.trackId = 0;
            this.sectionId = 0;
            this.sectionChannelData;
            this.trackCanvasElement;
        }

        static get observedAttributes(): string[] {
          return ['data-id'];
        }
  
        attributeChangedCallback(attrName: string, oldVal: string, newVal: string): void {
          if(oldVal !== newVal){
            switch(attrName){
              case 'data-id':
                this.sectionId = Number(newVal);
                break;
              case 'data-track-id':
                this.trackId = Number(newVal);
                break;
            }
            this[attrName] = newVal;
          }
        }
  
        connectedCallback(): void {
            try{
              this.render();
              this.init();
              this.draw();
            }catch(e){
              console.log(e); 
            }
          }

        render(): void{
            this.innerHTML = `
                <canvas class="audio-track-section"></canvas>
            `
        }

        init(): void {
          this.trackCanvasElement = this.querySelector<HTMLCanvasElement>('.audio-track-section');
          this.sectionChannelData = Controller.getSectionChannelData(this.trackId, this.sectionId);
        }

        draw(): void {         
          if(!this.sectionChannelData || !this.trackCanvasElement) return;

          const canvasWidth = this.trackCanvasElement.clientWidth;
          this.trackCanvasElement.width = canvasWidth;

          const canvasHeight = this.trackCanvasElement.clientHeight;
          const canvasCtx = this.trackCanvasElement.getContext('2d');
          if(!canvasCtx) return;

          const middleHeight = canvasHeight / 2;
          const defaultLineWidth = 1;  

          canvasCtx.strokeStyle = '#2196f3';
          canvasCtx.lineWidth = defaultLineWidth / (48000 / canvasWidth);
          canvasCtx.beginPath();

          let offsetX = 0;
          let offsetY;
          for(let i = 0; i < this.sectionChannelData.length; i++){
            offsetY = middleHeight + Math.floor((this.sectionChannelData[i]*canvasHeight)/2);
            if(i % 2 == 0)
              canvasCtx.moveTo(offsetX, offsetY);
            else{
              canvasCtx.lineTo(offsetX, offsetY);
              offsetX += canvasCtx.lineWidth;
            }
          }
          canvasCtx.stroke();
        }
    };

  customElements.define('audi-track-section', AudioTrackSection);
})();
