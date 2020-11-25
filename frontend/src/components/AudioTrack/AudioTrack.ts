import "./AudioTrack.scss"

(() => {
    const AudioTrack = class extends HTMLElement {
      private channels: Float32Array[];
      private sampleRate: number;
      private length: number;
      private trackWidth: number;
      private trackHeight: number;
      private trackCanvasEls: NodeListOf<HTMLCanvasElement> | null;
      private trackMessage: HTMLDivElement | null;

      constructor() {
        super();
        this.channels = [];
        this.sampleRate = 0;
        this.length = 0;
        this.trackWidth = 0;
        this.trackHeight = 0;
        this.trackCanvasEls = null;
        this.trackMessage = null;
      }
      
      static get observedAttributes() {
        return ['width', 'height'];
      }

      attributeChangedCallback(attrName, oldVal, newVal) {
        if(oldVal !== newVal){
          switch(attrName){
            case 'width':
              this.trackWidth = Number(newVal);
              break;
            case 'height':
              this.trackHeight = Number(newVal);
              break;
          }
          this[attrName] = newVal;
        }
      }

      connectedCallback() {
        try{
          this.render();
          this.init();
        }catch(e){
          console.log(e); 
        }
      }

      init(){
        this.trackCanvasEls = document.querySelectorAll('.audio-track');
        this.trackMessage = document.querySelector('.audio-track-massage');
      }

      readFileAsync(file): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
          let reader = new FileReader();
          reader.onload = () => {
            resolve(reader.result);
          };
      
          reader.onerror = reject;
          reader.readAsArrayBuffer(file);
        })
      }
  
      render() {
        this.innerHTML = `
                    <div class="audio-track-container">
                      <div class="audio-track-area">
                        <div class="audio-track-channel" style="height:${this.trackHeight}px"><span>L</span></div> 
                        <canvas class="audio-track" width="${this.trackWidth}px" height="${this.trackHeight}px"></canvas>
                      </div>
                      <div class="audio-track-massage"><span>Drag & Drop</span></div>
                      <div class="audio-track-area">
                        <div class="audio-track-channel" style="height:${this.trackHeight}px"><span>R</span></div> 
                        <canvas class="audio-track" width="${this.trackWidth}px" height="${this.trackHeight}px"></canvas>
                      </div>
                    </div>
                `;
      }

      hideMessage(){
          this.trackMessage?.classList.add('hide');
      }

      parsePeeks(channelPeaks: Float32Array): number[]{
        const sampleSize = this.length / this.sampleRate;
        const sampleStep = Math.floor(sampleSize / 10) || 1;
        const resultPeaks: number[] = []; 

        Array(this.sampleRate).fill(0).forEach((v, newPeakIndex) => {
          const start = Math.floor(newPeakIndex * sampleSize);
          const end = Math.floor(start + sampleSize);
          let min = channelPeaks[0];
          let max = channelPeaks[0];
    
          for (let sampleIndex = start; sampleIndex < end; sampleIndex += sampleStep) {
            const v = channelPeaks[sampleIndex];
    
            if (v > max) max = v;
            else if (v < min) min = v;
          }
    
          resultPeaks[2 * newPeakIndex] = max;
          resultPeaks[2 * newPeakIndex + 1] = min;
        });
 
        return resultPeaks;
      }

      draw(){
        if(this.channels.length === 0 || !this.trackCanvasEls) return;
        
        Object.values(this.trackCanvasEls).forEach((trackCavasElement, idx) =>{
            const peaks: number[] = this.parsePeeks(this.channels[idx]);
            this.drawPath(trackCavasElement, peaks);
        });
      }
      
      drawPath(canvas: HTMLCanvasElement, peaks: number[]){
        if(!this.trackWidth) return;
        
        const canvasCtx = canvas.getContext('2d');
        if(!canvasCtx) return;

        const middleHeight = this.trackHeight / 2
        const defaultLineWidth = 1;  

        canvasCtx.strokeStyle = '#2196f3';
        canvasCtx.lineWidth = defaultLineWidth / (this.sampleRate / this.trackWidth);        
        canvasCtx.beginPath();

        let offsetX = 0;
        let offsetY;
        for(let i = 0; i < peaks.length; i++){
          offsetY = middleHeight + Math.floor((peaks[i]*this.trackHeight)/2);
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
    customElements.define('audio-track', AudioTrack);
  })();
