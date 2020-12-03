import CommandManager from '../../command/CommandManager';
import { CursorType, StoreChannelType } from "@types";
import { storeChannel } from '@store';
import { Controller } from '@controllers'
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
      this.init()
      this.initState();
      this.subscribe();
    }

    render() {
      this.innerHTML = `
              <div class="edit-tools">
                ${this.iconlist.reduce((acc, icon) => acc + `<audi-icon-button id="${icon}" color="white" icontype="${icon}" size="32px"></audi-icon-button>`, '')}
              </div>
            `;
    }

    init() {
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
      this.cursotState();
      this.focusState();
      this.clipBoardState();
      this.commandState();
    }


    cursotState() {
      const cursorMode = Controller.getCursorMode();
      if (cursorMode === CursorType.SELECT_MODE) {
        this.cursorElement?.classList.add('selected');
      } else {
        this.bladeElement?.classList.add('selected');
      }
    }

    focusState() {
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

    clipBoardState() {
      const clipBoard = Controller.getClipBoard();
      const focusList = Controller.getFocusList();

      if (focusList.length > 1 || !clipBoard) {
        this.pasteElement?.classList.add('disabled');
      }
    }

    commandState() {
      const { undoList, redoList } = CommandManager;
      if (undoList.length === 0) {
        this.undoElement?.classList.add('disabled');
      }
      if (redoList.length === 0) {
        this.redoElement?.classList.add('disabled');
      }
    }

    subscribe(): void {
      storeChannel.subscribe(StoreChannelType.EDIT_TOOLS_CHANNEL, this.updateEditTools, this);
    }

    updateEditTools(): void {
      this.render();
      this.init()
      this.initState();
    }

  };
  customElements.define('audi-edit-tools', EditTools);
})()

export { };
