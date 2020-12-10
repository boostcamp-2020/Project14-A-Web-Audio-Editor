import { store } from '@store';
import { CopyUtil } from '@util';
import { Controller } from "@controllers";
import { TrackSection } from '@model';
import { CommandManager, DeleteCommand, PasteCommand, SplitCommand, AddTrackCommand, MoveCommand } from '@command';

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

    const { focusList, trackList, clipBoard, isPause } = store.getState();

    if (focusList.length !== 1 || !isPause) return;


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
}

const executeMoveCommand = (prevTrackId: number, currentTrackId: number, trackSection: TrackSection, movingCursorTime: number, prevCursorTime: number) => {
    const { trackList, isPause } = store.getState();
    if (!isPause) return;
    const prevTrack = trackList.find((track) => track.id === prevTrackId);
    const currentTrack = trackList.find((track) => track.id === currentTrackId);

    if (!prevTrack || !currentTrack) return;

    const command = new MoveCommand(CopyUtil.copyTrack(prevTrack), CopyUtil.copyTrack(currentTrack), trackSection, movingCursorTime, prevCursorTime);
    CommandManager.execute(command);
};

export default {
    executeUndoCommand,
    executeRedoCommand,
    executeDeleteCommand,
    executeCutCommand,
    executePasteCommand,
    executeSplitCommand,
    executeAddTrackCommand,
    executeMoveCommand
}
