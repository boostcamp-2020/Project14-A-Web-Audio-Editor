import { EventUtil } from '@util';
import { EventKeyType, EventType, StoreChannelType } from '@types';
import { storeChannel } from '@store';
import { Controller } from '@controllers';
import './ZoomBar.scss';

(() => {
    const ZoomBar = class extends HTMLElement{ 
        private mouseDownX: number;
        private lastLeft: number;
        private scrollDistancePerPixel: number;
        private zoombarContainerElement: HTMLDivElement | null;
        private zoombarControllerElement: HTMLDivElement | null;

        constructor(){
            super();
            this.mouseDownX = 0;
            this.lastLeft = 0;
            this.scrollDistancePerPixel = 1;
            this.zoombarContainerElement = null;
            this.zoombarControllerElement = null;
        }

        static DEFAULT_ZOOMBAR_CONTROLLER_SIZE_PERCENTAGE = 100;
        static MIN_ZOOMBAR_CONTROLLER_SIZE_PERCENTAGE = 5;
        static MAX_SCROLL_RATIO_TO_RESIZE = 1.0;
        
        connectedCallback(): void {
            try {
              this.render();
              this.initElement();
              this.initEvent();
              this.subscribe();
            } catch (e) {
              console.log(e);
            }
        }

        render(): void {
            this.innerHTML = `
                <div class= "audi-zoombar-container" >
                    <div class= "audi-zoombar-cotroller" data-zoom=1 event-key=${EventKeyType.ZOOM_BAR_MOUSE_DOWN}></div>
                </div>
            `;
        }

        initElement(): void {
            this.zoombarContainerElement = this.querySelector('.audi-zoombar-container');
            this.zoombarControllerElement = this.querySelector('.audi-zoombar-cotroller');
        }

        initEvent(): void {
            EventUtil.registerEventToRoot({
                eventTypes: [EventType.mousedown],
                eventKey: EventKeyType.ZOOM_BAR_MOUSE_DOWN,
                listeners: [this.zoomBarControllerMousedownListener],
                bindObj: this
            });
        }

        zoomBarControllerMousedownListener(e): void {
            e.preventDefault();
            e.stopPropagation();

            this.mouseDownX = e.clientX;
            document.onmousemove = this.zoomBarControllerMousemoveListener.bind(this);
            document.onmouseup = this.zoomBarControllerMouseupListener.bind(this);
        }

        zoomBarControllerMousemoveListener(e): void {
            e.preventDefault();
            e.stopPropagation();        

            if(!this.zoombarControllerElement || !this.zoombarContainerElement) return;

            const mouseMoveX = this.lastLeft + e.clientX - this.mouseDownX ;
            const containerLeftX = this.zoombarContainerElement.getBoundingClientRect().left;
            const containerRightX = this.zoombarContainerElement.getBoundingClientRect().right;

            if((containerLeftX + mouseMoveX) > containerLeftX &&
                 (containerLeftX + this.zoombarControllerElement.offsetWidth + mouseMoveX) < containerRightX){
                this.zoombarControllerElement.style.left = mouseMoveX + "px";

                const audioTrackScrollAreaElement = document.querySelector('.audi-main-audio-track-scroll-area');
                if(!audioTrackScrollAreaElement) return;

                const scrollAmount = this.scrollDistancePerPixel * mouseMoveX;
                audioTrackScrollAreaElement.scrollLeft = scrollAmount;
                
                Controller.changeCurrentScrollAmount(scrollAmount);
            }
        }

        zoomBarControllerMouseupListener(e): void {
            e.preventDefault();
            e.stopPropagation();
             
            if(!this.zoombarControllerElement) return;

            this.lastLeft = parseInt(this.zoombarControllerElement.style.left.replace('px',''));
            document.onmousemove = null;
            document.onmouseup = null;
        }

        subscribe(): void {
            storeChannel.subscribe(StoreChannelType.MAX_TRACK_WIDTH_CHANNEL, this.maxTrackWidthObserverCallback, this);
        }

        maxTrackWidthObserverCallback(maxTrackWidth: number): void {
            this.adjustZoombarController(maxTrackWidth);
        }

        adjustZoombarController(maxTrackWidth: number): void {
            if(!this.zoombarContainerElement) return;

            const zoombarContainerWidth = this.zoombarContainerElement.clientWidth;
            const scrollWidth = maxTrackWidth - zoombarContainerWidth;

            this.resizeZoomBarController(zoombarContainerWidth, scrollWidth);
            this.calculateScrollDistancePerPixel(zoombarContainerWidth, scrollWidth);
        }   

        resizeZoomBarController(zoombarContainerWidth: number, scrollWidth: number): void {
            if(!this.zoombarControllerElement) return;

            const { DEFAULT_ZOOMBAR_CONTROLLER_SIZE_PERCENTAGE, MIN_ZOOMBAR_CONTROLLER_SIZE_PERCENTAGE, MAX_SCROLL_RATIO_TO_RESIZE } = ZoomBar;
            const scrollRatio = scrollWidth / zoombarContainerWidth;

            let zoombarControllerSize = DEFAULT_ZOOMBAR_CONTROLLER_SIZE_PERCENTAGE;
            if(scrollRatio < MAX_SCROLL_RATIO_TO_RESIZE){
                zoombarControllerSize -= ( scrollRatio % 1 ) * 100;
                if( zoombarControllerSize < MIN_ZOOMBAR_CONTROLLER_SIZE_PERCENTAGE )
                    zoombarControllerSize = MIN_ZOOMBAR_CONTROLLER_SIZE_PERCENTAGE;
            }
            else{
                zoombarControllerSize = MIN_ZOOMBAR_CONTROLLER_SIZE_PERCENTAGE;
            }
            this.zoombarControllerElement.style.width = `${zoombarControllerSize}%`;
        }

        calculateScrollDistancePerPixel(zoombarContainerWidth: number, scrollWidth: number): void {
            if(!this.zoombarControllerElement) return;

            const zoombarControllerWidth = this.zoombarControllerElement.clientWidth;
            const movementRange = zoombarContainerWidth - zoombarControllerWidth;
            this.scrollDistancePerPixel = 1 / (scrollWidth / movementRange);
        }
    }

    customElements.define('audi-zoom-bar', ZoomBar);
})();
