import './App.scss';
import { EventDataType, eventTypes, EventTargetDataType, KeyBoard, CursorType } from '@types';
import { Controller, CommandController } from "@controllers";

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
      const modalIshidden = Controller.getModalIshidden();
      if (!modalIshidden) return;

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
        CommandController.executeDeleteCommand();
      }
      else if (e.which === KeyBoard.LEFT && !isCtrl) {
        e.preventDefault()
        Controller.audioFastRewind();
      }
      else if (e.which === KeyBoard.RIGHT && !isCtrl) {
        e.preventDefault()
        Controller.audioFastForward();
      }
      else if (e.which === KeyBoard.LEFT_BRACKET && !isCtrl) {
        Controller.audioSkipPrev();
      }
      else if (e.which === KeyBoard.RIGHT_BRACKET && !isCtrl) {
        Controller.audioSkipNext();
      }
      else if (e.which === KeyBoard.SPACE && !isCtrl) {
        e.preventDefault()
        Controller.audioPlayOrPause();
      }
      else if (e.which === KeyBoard.C && isCtrl) {
        Controller.setClipBoard();
      }
      else if (e.which === KeyBoard.X && isCtrl) {
        CommandController.executeCutCommand();
      }
      else if (e.which === KeyBoard.V && isCtrl) {
        CommandController.executePasteCommand();
      }
      else if (e.which === KeyBoard.Z && isCtrl) {
        CommandController.executeUndoCommand();
      }
      else if (e.which === KeyBoard.Y && isCtrl) {
        CommandController.executeRedoCommand();
      }
    }

    ctrlKeyUpListener(e): void {
      e.preventDefault()
      if (e.which === KeyBoard.CTRL) {
        Controller.setCtrlIsPressed(false);
      }
    }

    eventListenerForRegistrant(e): void {
      const { target } = e;
      if (!target || !this.isEventTarget(target) && !this.isDelegationEvent(target)) return;

      const eventType = e.type;
      const eventKey = this.parseEventKey(target);
      if (!eventKey) return;

      this.excuteEventListenerForTarget(eventType, eventKey, e);
    }

    isEventTarget(eventTarget: HTMLElement): Boolean {
      const eventKey = eventTarget.getAttribute('event-key');
      return eventKey ? true : false;
    }

    isDelegationEvent(eventTarget: HTMLElement): Boolean {
      const eventDelegation = eventTarget.getAttribute('event-delegation');
      return eventDelegation === '' ? true : false;
    }

    parseEventKey(eventTarget: HTMLElement) {
      const eventDelegation = eventTarget.getAttribute('event-delegation');

      if (eventDelegation === '') {
        const newEventTarget = eventTarget.closest('.delegation');
        return newEventTarget?.getAttribute('event-key');
      } else {
        return eventTarget.getAttribute('event-key');
      }
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
