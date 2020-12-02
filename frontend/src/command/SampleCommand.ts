import ICommand from './ICommand'

export default class SampleCommand extends ICommand {
  private value: number;

  constructor(value: number) {
    super();
    this.value = value;
  }

  execute() {
    console.log('실행', this.value);
  };

  undo() {
    console.log('되돌리기', this.value);
  };
}

