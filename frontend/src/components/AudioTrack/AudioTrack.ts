import "./AudioTrack.scss"

(() => {
    const AudioTrack = class extends HTMLElement {
      private channels: Float32Array[];
      private sampleRate: number;
      private length: number;
      private trackWidth: number;
      private trackHeight: number;
      private trackCanvasEls: NodeListOf<HTMLCanvasElement> | null;

      constructor() {
        super();
        this.channels = [];
        this.sampleRate = 0;
        this.length = 0;
        this.trackWidth = 0;
        this.trackHeight = 0;
        this.trackCanvasEls = null;
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
        const inputEl = document.querySelector('#audio-file-loader');
        inputEl?.addEventListener('change', async (e)=>{
          const file = e.currentTarget.files[0];
  
          if(file){
            const arrayBuffer = await this.readFileAsync(file);
    
            const audioCtx = new AudioContext();
            const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
            
            for(let i = 0; i < audioBuffer.numberOfChannels; i++)
              this.channels.push(audioBuffer.getChannelData(i));
            this.sampleRate = audioBuffer.sampleRate;
            this.length = audioBuffer.length;

            this.drawGraph();
          }
        }); 

        this.trackCanvasEls = document.querySelectorAll('.audio-track');
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
                    <input type="file" id="audio-file-loader"/>
                    <div class="audio-track-container">
                      <canvas class="audio-track" width="${this.trackWidth}px" height="${this.trackHeight}px"></canvas>
                      <canvas class="audio-track" width="${this.trackWidth}px" height="${this.trackHeight}px"></canvas>
                    </div>
                `;
      }

      parsePeeks(channel: Float32Array): number[]{
        const sampleSize = this.length / this.sampleRate;
        const sampleStep = Math.floor(sampleSize / 10) || 1;
        const resultPeaks: number[] = []; 
        const peaks = channel;

        Array(this.sampleRate).fill(0).forEach((v, newPeakIndex) => {
          const start = Math.floor(newPeakIndex * sampleSize);
          const end = Math.floor(start + sampleSize);
          let min = peaks[0];
          let max = peaks[0];
    
          for (let sampleIndex = start; sampleIndex < end; sampleIndex += sampleStep) {
            const v = peaks[sampleIndex];
    
            if (v > max) max = v;
            else if (v < min) min = v;
          }
    
          resultPeaks[2 * newPeakIndex] = max;
          resultPeaks[2 * newPeakIndex + 1] = min;
        });
 
        return resultPeaks;
      }

      drawGraph(){
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
          offsetY = middleHeight + Math.floor(peaks[i]*this.trackHeight);
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
