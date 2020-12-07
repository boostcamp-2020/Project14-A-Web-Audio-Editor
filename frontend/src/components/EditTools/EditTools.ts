import CommandManager from '@command/CommandManager';
import { CursorType, StoreChannelType, EventKeyType, EventType, IconType } from "@types";
import { storeChannel } from '@store';
import { Controller } from '@controllers'
import { EventUtil } from '@util';
import './EditTools.scss'

(() => {
  const EditTools = class extends HTMLElement {
    private iconlist: string[];
    private cursorElement: HTMLElement | null;
    private bladeElement: HTMLElement | null;
    private copyElement: HTMLElement | null;
    private cutElement: HTMLElement | null;
    private pasteElement: HTMLElement | null;
    private deleteElement: HTMLElement | null;
    private undoElement: HTMLElement | null;
    private redoElement: HTMLElement | null;

    constructor() {
      super();
      this.iconlist = ['cursor', 'blade', 'copy', 'cut', 'paste', 'delete', 'undo', 'redo'];
      this.cursorElement = null;
      this.bladeElement = null;
      this.copyElement = null;
      this.cutElement = null;
      this.pasteElement = null;
      this.deleteElement = null;
      this.undoElement = null;
      this.redoElement = null;
    }

    connectedCallback() {
      this.render();
      this.initElement()
      this.initState();
      this.initEvent();
      this.subscribe();
    }

    render() {
      this.innerHTML = `
              <div class="edit-tools">
                ${this.iconlist.reduce((acc, icon) => acc + `<audi-icon-button id="${icon}" color="white" icontype="${icon}" size="32px" data-event-key=${EventKeyType.EDIT_TOOLS_CLICK + icon}></audi-icon-button>`, '')}
              </div>
            `;
    }

    initElement() {
      this.cursorElement = this.querySelector('#cursor');
      this.bladeElement = this.querySelector('#blade');
      this.copyElement = this.querySelector('#copy');
      this.cutElement = this.querySelector('#cut');
      this.pasteElement = this.querySelector('#paste');
      this.deleteElement = this.querySelector('#delete');
      this.undoElement = this.querySelector('#undo');
      this.redoElement = this.querySelector('#redo');
    }

    initState() {
      this.initCursorState();
      this.initFocusState();
      this.initClipBoardState();
      this.initCommandState();
    }

    initCursorState() {
      const cursorMode = Controller.getCursorMode();
      if (cursorMode === CursorType.SELECT_MODE) {
        this.cursorElement?.classList.add('selected');
      } else {
        this.bladeElement?.classList.add('selected');
      }
    }

    initFocusState() {
      const focusList = Controller.getFocusList();
      if (focusList.length === 0) {
        this.copyElement?.classList.add('disabled');
        this.cutElement?.classList.add('disabled');
        this.deleteElement?.classList.add('disabled');
      } else if (focusList.length > 1) {
        this.copyElement?.classList.add('disabled');
        this.cutElement?.classList.add('disabled');
      }
    }

    initClipBoardState() {
      const clipBoard = Controller.getClipBoard();
      const focusList = Controller.getFocusList();

      if (focusList.length > 1 || !clipBoard) {
        this.pasteElement?.classList.add('disabled');
      }
    }

    initCommandState() {
      const { undoList, redoList } = CommandManager;
      if (undoList.length === 0) {
        this.undoElement?.classList.add('disabled');
      }
      if (redoList.length === 0) {
        this.redoElement?.classList.add('disabled');
      }
    }

    initEvent() {
      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.EDIT_TOOLS_CLICK + IconType.cursor,
        listeners: [this.selectCursorListener],
        bindObj: this
      });

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.EDIT_TOOLS_CLICK + IconType.delete,
        listeners: [this.deleteListener],
        bindObj: this
      });

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.EDIT_TOOLS_CLICK + IconType.undo,
        listeners: [this.undoListener],
        bindObj: this
      });

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.EDIT_TOOLS_CLICK + IconType.blade,
        listeners: [this.cuttingCursorListener],
        bindObj: this
      });

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.EDIT_TOOLS_CLICK + IconType.redo,
        listeners: [this.redoListener],
        bindObj: this
      });

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.EDIT_TOOLS_CLICK + IconType.copy,
        listeners: [this.copyListener],
        bindObj: this
      });

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.EDIT_TOOLS_CLICK + IconType.cut,
        listeners: [this.cutListener],
        bindObj: this
      });

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.EDIT_TOOLS_CLICK + IconType.paste,
        listeners: [this.pasteListener],
        bindObj: this
      });
    }

    selectCursorListener(e) {
      Controller.setCursorMode(CursorType.SELECT_MODE);
    }

    cuttingCursorListener(e) {
      Controller.setCursorMode(CursorType.CUT_MODE);
    }

    copyListener(e) {
      Controller.setClipBoard();
    }

    cutListener(e) {
      Controller.cutCommand();
    }

    pasteListener(e) {
      Controller.pasteCommand();
    }

    deleteListener(): void {
      Controller.deleteCommand();
    }

    undoListener(): void {
      Controller.undoCommand();
    }

    redoListener(): void {
      Controller.redoCommand();
    }

    subscribe(): void {
      storeChannel.subscribe(StoreChannelType.EDIT_TOOLS_CHANNEL, this.updateEditTools, this);
      storeChannel.subscribe(StoreChannelType.CURSOR_MODE_CHANNEL, this.updateEditTools, this);
    }

    updateEditTools(): void {
      this.render();
      this.initElement();
      this.initState();
    }
  };

  customElements.define('audi-edit-tools', EditTools);
})()

export { };
