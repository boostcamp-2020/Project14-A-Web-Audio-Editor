import './App.scss';
import { EventDataType, eventTypes, EventTargetDataType, StoreChannelType } from '@types';

(() => {
  const App = class extends HTMLElement {
    private eventListenerCollectors: Map<string, Map<string, EventTargetDataType>> | null;
    private eventsForListener: string[];

    constructor() {
      super();
      this.eventListenerCollectors = null;
      this.eventsForListener = eventTypes;
    }

    connectedCallback(): void {
      this.render();
      this.init();
      this.initEvent();
    }

    render(): void {
      this.innerHTML = `
                  <div class="audi-app-container">
                    <header-component></header-component>
                    <editor-modal type='source'></editor-modal>
                    <editor-modal type='download'></editor-modal>
                    <audi-main></audi-main>
                  </div>
              `;
    }

    init(): void {
      this.eventListenerCollectors = this.eventsForListener.reduce((acc, cur) => acc.set(cur, new Map()), new Map());
    }

    initEvent(): void {
      this.eventsForListener.forEach((eventName) => this.addEventListener(eventName, this.eventListenerForRegistrant.bind(this)));
    }

    eventListenerForRegistrant(e): void {
      const { target } = e;

      if (!target || !this.isEventTarget(target) || !this.eventListenerCollectors) return;

      const eventType = e.type;
      const eventKey = target.getAttribute('event-key');

      this.excuteEventListenerForTarget(eventType, eventKey, e);
    }

    isEventTarget(eventTarget: HTMLElement): Boolean {
      const eventKey = eventTarget.getAttribute('event-key');
      return eventKey ? true : false;
    }

    excuteEventListenerForTarget(eventType: string, eventKey: string, e: Event): void {
      if (!this.eventListenerCollectors) return;

      const eventListenerCollector = this.eventListenerCollectors.get(eventType);
      if (eventListenerCollector) {
        const eventTargetData = eventListenerCollector.get(eventKey);
        eventTargetData?.listener.call(eventTargetData.bindObj, e);
      }
    }

    registerEventListener(eventData: EventDataType): void {
      const { eventTypes, eventKey, listeners, bindObj } = eventData;

      eventTypes.forEach((eventType, idx) => {
        if (this.eventListenerCollectors && this.eventListenerCollectors.has(eventType)) {
          const eventListenerCollector = this.eventListenerCollectors.get(eventType);
          if (eventListenerCollector) {
            eventListenerCollector.set(eventKey, { listener: listeners[idx], bindObj: bindObj });
            this.eventListenerCollectors.set(eventType, eventListenerCollector);
          }
        }
      });
    }
  };

  customElements.define('audi-app', App);
})();

export {};
