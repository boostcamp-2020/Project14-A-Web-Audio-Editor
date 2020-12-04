import ICommand from './ICommand'
import { storeChannel } from '@store'
import { StoreChannelType } from '@types'

class CommandManager {
  public undoList: ICommand[];
  public redoList: ICommand[];

  constructor() {
    this.undoList = []
    this.redoList = []
  }

  execute(command: ICommand) {
    command.execute();
    this.undoList.push(command);
    this.redoList = [];
    storeChannel.publish(StoreChannelType.EDIT_TOOLS_CHANNEL, '');
  }

  undo() {
    if (this.undoList.length > 0) {
      const command: ICommand | undefined = this.undoList.pop();
      if (command) {
        this.redoList.push(command);
        command.undo();
        storeChannel.publish(StoreChannelType.EDIT_TOOLS_CHANNEL, '');
      }
    }
  }

  redo() {
    if (this.redoList.length > 0) {
      const command: ICommand | undefined = this.redoList.pop();
      if (command) {
        this.undoList.push(command);
        command.execute();
        storeChannel.publish(StoreChannelType.EDIT_TOOLS_CHANNEL, '');
      }
    }
  }

}

export default new CommandManager();