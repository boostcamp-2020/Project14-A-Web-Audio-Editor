import { store } from '@store';
import { CopyUtil} from '@util';
import { Controller } from "@controllers";
import { CommandManager, DeleteCommand, PasteCommand, SplitCommand, AddTrackCommand, DeleteTrackCommand } from '@command';
import { check } from 'prettier';

const executeUndoCommand = () => {
    if (CommandManager.undoList.length === 0) return;
    CommandManager.undo();
};
  
const executeRedoCommand = () => {
    if (CommandManager.redoList.length === 0) return;
    CommandManager.redo();
};

const executeDeleteCommand = () => {
    const { focusList } = store.getState();

    if (focusList.length === 0) return;
    const command = new DeleteCommand();
    CommandManager.execute(command);
};

const executeCutCommand = () => {
    if (!Controller.setClipBoard()) return;
  
    const command = new DeleteCommand();
    CommandManager.execute(command);
  };
  
const executePasteCommand = () => {
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

const executeSplitCommand = (cursorPosition: number, trackId: number, sectionId: number): void => {
    const track = Controller.getTrack(trackId);
    const trackSection = track?.trackSectionList.find((section) => section.id === sectionId);
    if (!trackSection || !track) return;
  
    const splitCommand = new SplitCommand(cursorPosition, CopyUtil.copyTrack(track), CopyUtil.copySection(trackSection));
    CommandManager.execute(splitCommand);
};

const executeAddTrackCommand = (): void => {
    const addTrackCommand = new AddTrackCommand();
    CommandManager.execute(addTrackCommand);
}

const executeDeleteTrackCommand = (trackId: number): void => {
    if(isMinLengthOfTrackList()) {
        alert("트랙은 최소 3개 이상 존재해야합니다.");
        return;
    }
    
    const deleteTrackCommand = new DeleteTrackCommand(trackId);
    CommandManager.execute(deleteTrackCommand);
};

const isMinLengthOfTrackList = (): Boolean => {
    const { trackList } = store.getState();
    const minLength = 3;

    return trackList.length === minLength;
}

export default {
    executeUndoCommand,
    executeRedoCommand,
    executeDeleteCommand,
    executeCutCommand,
    executePasteCommand,
    executeSplitCommand,
    executeAddTrackCommand,
    executeDeleteTrackCommand
}
