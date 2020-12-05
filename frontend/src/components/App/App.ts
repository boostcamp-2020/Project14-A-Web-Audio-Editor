import './App.scss';
import { EventDataType, eventTypes, EventTargetDataType, KeyBoard, CursorType } from '@types';
import { Controller } from "@controllers";

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
      window.addEventListener('keydown', this.KeyDownListener)
      window.addEventListener('keyup', this.ctrlKeyUpListener)
    }

    KeyDownListener(e): void {
      const isCtrl = Controller.getCtrlIsPressed();

      if (e.which === KeyBoard.CTRL) {
        Controller.setCtrlIsPressed(true);
      }

      if (e.which === KeyBoard.C && !isCtrl) {
        Controller.setCursorMode(CursorType.CUT_MODE);
      }
      else if (e.which === KeyBoard.V && !isCtrl) {
        Controller.setCursorMode(CursorType.SELECT_MODE);
      }
      else if (e.which === KeyBoard.DELETE && !isCtrl) {
        Controller.deleteCommand();
      }
      else if (e.which === KeyBoard.LEFT && !isCtrl) {
        // console.log('왼쪽');
      }
      else if (e.which === KeyBoard.RIGHT && !isCtrl) {
        // console.log('오른쪽');
      }
      else if (e.which === KeyBoard.LEFT_BRACKET && !isCtrl) {
        // console.log('시작지점');
      }
      else if (e.which === KeyBoard.RIGHT_BRACKET && !isCtrl) {
        // console.log('마지막지점');
      }
      else if (e.which === KeyBoard.SPACE && !isCtrl) {
        // console.log('스페이스바');
      }
      else if (e.which === KeyBoard.C && isCtrl) {
        Controller.setClipBoard();
      }
      else if (e.which === KeyBoard.X && isCtrl) {
        Controller.cutCommand();
      }
      else if (e.which === KeyBoard.V && isCtrl) {
        // console.log('붙여넣기');
      }
      else if (e.which === KeyBoard.Z && isCtrl) {
        Controller.undoCommand();
      }
      else if (e.which === KeyBoard.Y && isCtrl) {
        Controller.redoCommand();
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
