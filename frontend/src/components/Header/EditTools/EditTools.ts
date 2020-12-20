import { Command } from '@command';
import { CursorType, StoreChannelType, EventKeyType, EventType, IconType } from "@types";
import { storeChannel } from '@store';
import { Controller, CommandController } from '@controllers'
import { EventUtil } from '@util';
import './EditTools.scss'
import { TrackSection } from '@model';

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
    private clipBoard: TrackSection | null;
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
      this.clipBoard = null;
    }

    connectedCallback() {
      this.render();
      this.initElement();
      this.initEvent();
      this.subscribe();
    }

    render() {
      this.innerHTML = `
              <div class="edit-tools">
                ${this.iconlist.reduce((acc, icon) => {
        if (icon === IconType.cursor) {
          return acc + `<audi-icon-button id="${icon}" 
                          icontype="${icon}" size="32px"
                          class="delegation selected"
                          event-key=${EventKeyType.EDIT_TOOLS_CLICK + icon}>
                        </audi-icon-button>`
        } else if (icon === IconType.blade) {
          return acc + `<audi-icon-button id="${icon}" 
                            icontype="${icon}" size="32px"
                            class="delegation"
                            event-key=${EventKeyType.EDIT_TOOLS_CLICK + icon}>
                          </audi-icon-button>`
        } else {
          return acc + `<audi-icon-button id="${icon}" 
                            icontype="${icon}" size="32px"
                            class="delegation disabled"
                            event-key=${EventKeyType.EDIT_TOOLS_CLICK + icon}>
                          </audi-icon-button>`
        }
      }, '')}
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
      CommandController.executeCutCommand();
    }

    pasteListener(e) {
      CommandController.executePasteCommand();
    }

    deleteListener(): void {
      CommandController.executeDeleteCommand();
    }

    undoListener(): void {
      CommandController.executeUndoCommand();
    }

    redoListener(): void {
      CommandController.executeRedoCommand();
    }

    subscribe(): void {
      storeChannel.subscribe(StoreChannelType.FOCUS_LIST_CHANNEL, this.focusListObserverCallback, this);
      storeChannel.subscribe(StoreChannelType.CURSOR_MODE_CHANNEL, this.cursorModeObserverCallback, this);
      storeChannel.subscribe(StoreChannelType.COMMAND_REDO_UNDO_CHANNEL, this.commandObserverCallback, this);
      storeChannel.subscribe(StoreChannelType.CLIPBOARD_CHANNEL, this.clipboardObserverCallback, this);
    }

    disconnectedCallback() {
      this.unsubscribe();
    }

    unsubscribe(): void {
      storeChannel.unsubscribe(StoreChannelType.FOCUS_LIST_CHANNEL, this.focusListObserverCallback, this);
      storeChannel.unsubscribe(StoreChannelType.CURSOR_MODE_CHANNEL, this.cursorModeObserverCallback, this);
      storeChannel.unsubscribe(StoreChannelType.COMMAND_REDO_UNDO_CHANNEL, this.commandObserverCallback, this);
      storeChannel.unsubscribe(StoreChannelType.CLIPBOARD_CHANNEL, this.clipboardObserverCallback, this);
    }

    cursorModeObserverCallback(newCursorMode: CursorType): void {
      if (newCursorMode === CursorType.SELECT_MODE) {
        this.cursorElement?.classList.add('selected');
        this.bladeElement?.classList.remove('selected');
      } else {
        this.cursorElement?.classList.remove('selected');
        this.bladeElement?.classList.add('selected');
      }
    }

    focusListObserverCallback(newfocusList): void {
      if (this.clipBoard) {
        if (newfocusList.length < 2) {
          this.pasteElement?.classList.remove('disabled');
        } else {
          this.pasteElement?.classList.add('disabled');
        }
      }

      if (newfocusList.length === 1) {
        this.copyElement?.classList.remove('disabled');
        this.cutElement?.classList.remove('disabled');
        this.deleteElement?.classList.remove('disabled');
      } else if (newfocusList.length == 0) {
        this.copyElement?.classList.add('disabled');
        this.cutElement?.classList.add('disabled');
        this.deleteElement?.classList.add('disabled');
      } else {
        this.copyElement?.classList.add('disabled');
        this.cutElement?.classList.add('disabled');
        this.deleteElement?.classList.remove('disabled');
      }
    }

    commandObserverCallback({ undoList, redoList }: { undoList: Command[], redoList: Command[] }): void {
      if (undoList.length === 0) {
        this.undoElement?.classList.add('disabled');
      } else {
        this.undoElement?.classList.remove('disabled');
      }
      if (redoList.length === 0) {
        this.redoElement?.classList.add('disabled');
      } else {
        this.redoElement?.classList.remove('disabled');
      }
    }

    clipboardObserverCallback(newClipboard: TrackSection): void {
      this.clipBoard = newClipboard;
      this.pasteElement?.classList.remove('disabled');
    }
  };

  customElements.define('audi-edit-tools', EditTools);
})()

export { };
