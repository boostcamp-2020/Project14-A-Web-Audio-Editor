import { store } from '@store';
import { CopyUtil} from '@util';
import { Controller } from "@controllers";
import { CommandManager, DeleteCommand, PasteCommand, SplitCommand, AddTrackCommand } from '@command';

const excuteUndoCommand = () => {
    if (CommandManager.undoList.length === 0) return;
    CommandManager.undo();
};
  
const excuteRedoCommand = () => {
    if (CommandManager.redoList.length === 0) return;
    CommandManager.redo();
};

const excuteDeleteCommand = () => {
    const { focusList } = store.getState();

    if (focusList.length === 0) return;
    const command = new DeleteCommand();
    CommandManager.execute(command);
};

const excuteCutCommand = () => {
    if (!Controller.setClipBoard()) return;
  
    const command = new DeleteCommand();
    CommandManager.execute(command);
  };
  
const excutePasteCommand = () => {
    const { focusList, trackList, clipBoard } = store.getState();
  
    if (focusList.length !== 1) return false;
  
    const track = trackList.find((track) => track.id === focusList[0].trackSection.trackId);
    if (!track || !clipBoard) return;
  
    const copyTrack = CopyUtil.copyTrack(track);
    const copySection = CopyUtil.copySection(clipBoard);
    const focusSection = focusList[0].trackSection;
  
    copySection.trackStartTime = focusSection.trackStartTime + focusSection.length;
    copySection.trackId = focusSection.trackId;
  
    const command = new PasteCommand(copyTrack, copySection);
  
    CommandManager.execute(command);
};

const excuteSplitCommand = (cursorPosition: number, trackId: number, sectionId: number): void => {
    const track = Controller.getTrack(trackId);
    const trackSection = track?.trackSectionList.find((section) => section.id === sectionId);
    if (!trackSection || !track) return;
  
    const splitCommand = new SplitCommand(cursorPosition, CopyUtil.copyTrack(track), CopyUtil.copySection(trackSection));
    CommandManager.execute(splitCommand);
};

const excuteAddTrackCommand = (): void => {
    const addTrackCommand = new AddTrackCommand();
    CommandManager.execute(addTrackCommand);
}

export default {
    excuteUndoCommand,
    excuteRedoCommand,
    excuteDeleteCommand,
    excuteCutCommand,
    excutePasteCommand,
    excuteSplitCommand,
    excuteAddTrackCommand
}
