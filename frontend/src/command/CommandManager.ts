import ICommand from './ICommand'

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
  }

  undo() {
    if (this.undoList.length > 0) {
      const command: ICommand | undefined = this.undoList.pop();
      if (command) {
        this.redoList.push(command);
        command.undo();
      }
    }
  }

  redo() {
    if (this.redoList.length > 0) {
      const command: ICommand | undefined = this.redoList.pop();
      if (command) {
        this.undoList.push(command);
        command.execute();
      }
    }
  }

}

export default new CommandManager();