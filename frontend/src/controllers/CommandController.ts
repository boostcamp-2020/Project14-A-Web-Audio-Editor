import { store } from '@store';
import { CopyUtil } from '@util';
import { Controller } from "@controllers";
import { TrackSection } from '@model';
import { FocusInfo } from '@types';
import { CommandManager, DeleteCommand, PasteCommand, SplitCommand, AddTrackCommand, DeleteTrackCommand, MoveCommand, ColorChangeCommand } from '@command';

const executeUndoCommand = () => {
    const { isPause } = store.getState();
    if (CommandManager.undoList.length === 0 || !isPause) return;
    CommandManager.undo();
};

const executeRedoCommand = () => {
    const { isPause } = store.getState();
    if (CommandManager.redoList.length === 0 || !isPause) return;

    CommandManager.redo();
};

const executeDeleteCommand = () => {
    const { focusList, isPause } = store.getState();
    if (focusList.length === 0 || !isPause) return;

    const command = new DeleteCommand();
    CommandManager.execute(command);
};

const executeCutCommand = () => {
    const { isPause } = store.getState();
    if (!isPause || !Controller.setClipBoard()) return;

    const command = new DeleteCommand();
    CommandManager.execute(command);
};

const executePasteCommand = () => {
    const { focusList, trackList, clipBoard, isPause, selectTrackData } = store.getState();

    if (focusList.length > 1 || !isPause || !clipBoard) return;
    if (focusList.length === 0 && selectTrackData.trackId === 0) return;

    const trackId = focusList.length === 1 ? focusList[0].trackSection.trackId : selectTrackData.trackId;
    const track = trackList.find((track) => track.id === trackId);

    if (!track) return;

    const copyTrack = CopyUtil.copyTrack(track);
    const copySection = CopyUtil.copySection(clipBoard);

    if (focusList.length === 0) {
        copySection.trackStartTime = selectTrackData.selectedTime;
        copySection.trackId = selectTrackData.trackId;
    } else {
        const focusSection = focusList[0].trackSection;
        copySection.trackStartTime = focusSection.trackStartTime + focusSection.length;
        copySection.trackId = focusSection.trackId;
    }

    const command = new PasteCommand(copyTrack, copySection);

    CommandManager.execute(command);
};

const executeSplitCommand = (cursorPosition: number, trackId: number, sectionId: number): void => {
    const { isPause } = store.getState();
    if (!isPause) return;

    const track = Controller.getTrack(trackId);
    const trackSection = track?.trackSectionList.find((section) => section.id === sectionId);
    if (!trackSection || !track) return;

    const splitCommand = new SplitCommand(cursorPosition, CopyUtil.copyTrack(track), CopyUtil.copySection(trackSection));
    CommandManager.execute(splitCommand);
};

const executeAddTrackCommand = (): void => {
    const { isPause } = store.getState();
    if (!isPause) return;

    const addTrackCommand = new AddTrackCommand();
    CommandManager.execute(addTrackCommand);
};

const executeMoveCommand = (prevTrackId: number, currentTrackId: number, trackSection: TrackSection, movingCursorTime: number, prevCursorTime: number) => {
    const { trackList, isPause } = store.getState();
    if (!isPause) return;
    const prevTrack = trackList.find((track) => track.id === prevTrackId);
    const currentTrack = trackList.find((track) => track.id === currentTrackId);

    if (!prevTrack || !currentTrack) return;

    const command = new MoveCommand(CopyUtil.copyTrack(prevTrack), CopyUtil.copyTrack(currentTrack), trackSection, movingCursorTime, prevCursorTime);
    CommandManager.execute(command);
};
  
const executeDeleteTrackCommand = (trackId: number): void => {
    const { isPause } = store.getState();
    if (!isPause) return;
  
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
};

const executeColorChangeCommand = (focusList: FocusInfo[], color: string): void => {
    const trackList = Controller.getTrackList();
    const colorChangeCommand = new ColorChangeCommand(focusList, color, trackList);
    CommandManager.execute(colorChangeCommand);
}

export default {
    executeUndoCommand,
    executeRedoCommand,
    executeDeleteCommand,
    executeCutCommand,
    executePasteCommand,
    executeSplitCommand,
    executeAddTrackCommand,
    executeMoveCommand,
    executeDeleteTrackCommand,
    executeColorChangeCommand
}
