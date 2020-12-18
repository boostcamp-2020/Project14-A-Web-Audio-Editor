import { EventUtil } from '@util';
import { EventKeyType, EventType, StoreChannelType } from '@types';
import { storeChannel } from '@store';
import { Controller, ZoomController } from '@controllers';
import './ZoomBar.scss';

(() => {
    const ZoomBar = class extends HTMLElement {
        private mouseDownX: number;
        private lastLeft: number;
        private zoombarContainerElement: HTMLDivElement | null;
        private zoombarControllerElement: HTMLDivElement | null;
        private scrollDistanceRatio: number;

        constructor() {
            super();
            this.mouseDownX = 0;
            this.lastLeft = 0;
            this.zoombarContainerElement = null;
            this.zoombarControllerElement = null;
            this.scrollDistanceRatio = 1;
        }

        connectedCallback(): void {
            try {
                this.render();
                this.initElement();
                this.initEvent();
                this.subscribe();

                const maxTrackWidth = Controller.getMaxTrackWidth();
                this.adjustZoombarController(maxTrackWidth);
            } catch (e) {
                console.log(e);
            }
        }

        render(): void {
            this.innerHTML = `
                <div class= "audi-zoombar-container" >
                    <div class= "audi-zoombar-cotroller" event-key=${EventKeyType.ZOOM_BAR_MOUSE_DOWN}></div>
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

            if (!this.zoombarControllerElement || !this.zoombarContainerElement) return;

            const mouseMoveX = this.lastLeft + e.clientX - this.mouseDownX;
            const containerLeftX = this.zoombarContainerElement.getBoundingClientRect().left;
            const containerRightX = this.zoombarContainerElement.getBoundingClientRect().right;



            if ((containerLeftX + mouseMoveX) > containerLeftX &&
                (containerLeftX + this.zoombarControllerElement.offsetWidth + mouseMoveX) < containerRightX) {
                this.zoombarControllerElement.style.left = mouseMoveX + "px";

                const audioTrackScrollAreaElement = document.querySelector('.audi-main-audio-track-scroll-area');
                const playBarScrollAreaElement = document.querySelector('.main-playbar-scroll-area-container');
                if (!audioTrackScrollAreaElement || !playBarScrollAreaElement) return;

                const scrollAmount = (this.scrollDistanceRatio * mouseMoveX);
                audioTrackScrollAreaElement.scrollLeft = scrollAmount;
                playBarScrollAreaElement.scrollLeft = scrollAmount;

                Controller.changeCurrentScrollAmount(scrollAmount);
            }
        }

        zoomBarControllerMouseupListener(e): void {
            e.preventDefault();
            e.stopPropagation();

            if (!this.zoombarControllerElement) return;

            this.lastLeft = parseInt(this.zoombarControllerElement.style.left.replace('px', ''));
            document.onmousemove = null;
            document.onmouseup = null;
        }

        subscribe(): void {
            storeChannel.subscribe(StoreChannelType.MAX_TRACK_WIDTH_CHANNEL, this.maxTrackWidthObserverCallback, this);
        }

        disconnectedCallback() {
            this.unsubscribe();
        }

        unsubscribe(): void {
            storeChannel.unsubscribe(StoreChannelType.MAX_TRACK_WIDTH_CHANNEL, this.maxTrackWidthObserverCallback, this);
        }

        maxTrackWidthObserverCallback(maxTrackWidth: number): void {
            this.adjustZoombarController(maxTrackWidth);
        }

        adjustZoombarController(maxTrackWidth: number): void {
            if (!this.zoombarContainerElement || !this.zoombarControllerElement) return;

            const zoombarContainerWidth = this.zoombarContainerElement.clientWidth;
            const increaseTrackWidth = (maxTrackWidth - zoombarContainerWidth);
            const increaseRateOfTrackWidth = increaseTrackWidth / zoombarContainerWidth;

            let zoomBarControllerWidth = zoombarContainerWidth * (1 - increaseRateOfTrackWidth);
            if (increaseRateOfTrackWidth > 0.9) {
                zoomBarControllerWidth = zoombarContainerWidth * 0.1;
            }
            const currentMovementRangeOfZoombar = zoombarContainerWidth - zoomBarControllerWidth;

            this.resizeZoomBarController(zoomBarControllerWidth);
            this.calculateScrollDistanceRatio(currentMovementRangeOfZoombar, increaseTrackWidth);
            this.relocationZoomBarController(currentMovementRangeOfZoombar, currentMovementRangeOfZoombar, maxTrackWidth);
        }

        resizeZoomBarController(zoomBarControllerWidth: number): void {
            if (!this.zoombarControllerElement) return;
            this.zoombarControllerElement.style.width = `${zoomBarControllerWidth}px`;
        }

        calculateScrollDistanceRatio(movementRangeOfZoombar: number, increaseTrackWidth: number): void {
            if (!this.zoombarControllerElement) return;
            this.scrollDistanceRatio = (increaseTrackWidth / movementRangeOfZoombar);
        }

        relocationZoomBarController(prevMovementRangeOfZoombar: number, currentMovementRangeOfZoombar: number, maxTrackWidth: number) {
            if (!this.zoombarContainerElement || !this.zoombarControllerElement || currentMovementRangeOfZoombar === 0) return;

            let prevScrollAmountOfZoombar = parseFloat(this.zoombarControllerElement.style.left.replace('px', ''));
            if (!prevScrollAmountOfZoombar) prevScrollAmountOfZoombar = 0;

            const scrollAmountRatio = prevScrollAmountOfZoombar / prevMovementRangeOfZoombar;
            let prevMaxTrackWidth = Controller.getPrevMaxTrackWidth();
            if (prevMaxTrackWidth === 0) prevMaxTrackWidth = maxTrackWidth;

            const increaseRate = maxTrackWidth / prevMaxTrackWidth;
            const pixelToRelocation = (scrollAmountRatio / increaseRate) * currentMovementRangeOfZoombar;

            this.zoombarControllerElement.style.left = `${pixelToRelocation}px`;
            this.lastLeft = pixelToRelocation;
        }
    }

    customElements.define('audi-zoom-bar', ZoomBar);
})();
