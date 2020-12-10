import { CommandManager, AddTrackCommand } from '@command';

const excuteAddTrackCommand = (): void => {
    const addTrackCommand = new AddTrackCommand();
    CommandManager.execute(addTrackCommand);
}

export default {
    excuteAddTrackCommand
}
