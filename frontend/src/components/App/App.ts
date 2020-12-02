import './App.scss';
import { EventDataType, eventTypes, EventTargetDataType } from '@types';
import { Controller } from "@controllers";

enum KeyBoard {
  Z = 90,
  Y = 89,
  X = 88,
  C = 67,
  V = 86,
  DELETE = 46,
  CTRL = 17
}

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
                    <audi-main-page></audi-main-page>
                  </div>
              `;
    }

    init(): void {
      this.eventListenerCollectors = this.eventsForListener.reduce((acc, cur) => acc.set(cur, new Map()), new Map());
    }

    initEvent(): void {
      this.eventsForListener.forEach((eventName) => this.addEventListener(eventName, this.eventListenerForRegistrant.bind(this)));
      addEventListener('keydown', this.KeyDownListener)
      addEventListener('keyup', this.ctrlKeyUpListener)
    }

    KeyDownListener(e): void {
      const isCtrl = Controller.getCtrlIsPressed();

      if (e.which === KeyBoard.CTRL) {
        Controller.setCtrlIsPressed(true);
      }

      if (e.which === KeyBoard.C && !isCtrl) {
        // console.log('Select Mode');
      }
      else if (e.which === KeyBoard.V && !isCtrl) {
        // console.log('Cut Mode');
      }
      else if (e.which === KeyBoard.DELETE && !isCtrl) {
        // console.log('삭제');
      }
      else if (e.which === KeyBoard.C && isCtrl) {
        // console.log('복사');
      }
      else if (e.which === KeyBoard.X && isCtrl) {
        // console.log('잘라내기');
      }
      else if (e.which === KeyBoard.V && isCtrl) {
        // console.log('붙여넣기');
      }
      else if (e.which === KeyBoard.Z && isCtrl) {
        // console.log('undo');
      }
      else if (e.which === KeyBoard.Y && isCtrl) {
        // console.log('redo');
      }
    }

    ctrlKeyUpListener(e): void {
      if (e.which === KeyBoard.CTRL) {
        Controller.setCtrlIsPressed(false);
      }
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

export { };
