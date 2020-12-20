import { store, storeChannel } from '@store';
import { CopyUtil } from '@util';
import { Controller } from "@controllers";
import { TrackSection, Effect } from '@model';
import { FocusInfo, StoreChannelType } from '@types';
import { CommandManager, DeleteCommand, PasteCommand, SplitCommand, AddTrackCommand, DeleteTrackCommand, MoveCommand, ColorChangeCommand, AddEffectCommand, DeleteEffectCommand, ModifyEffectCommand } from '@command';

const executeUndoCommand = () => {
    if (CommandManager.undoList.length === 0) return;
    CommandManager.undo();
    const { undoList, redoList } = CommandManager;
    storeChannel.publish(StoreChannelType.COMMAND_REDO_UNDO_CHANNEL, { undoList, redoList });
};

const executeRedoCommand = () => {
    if (CommandManager.redoList.length === 0) return;

    CommandManager.redo();
    const { undoList, redoList } = CommandManager;
    storeChannel.publish(StoreChannelType.COMMAND_REDO_UNDO_CHANNEL, { undoList, redoList });
};

const executeDeleteCommand = () => {
    const { focusList } = store.getState();
    if (focusList.length === 0) return;

    const command = new DeleteCommand();
    CommandManager.execute(command);
    const { undoList, redoList } = CommandManager;
    storeChannel.publish(StoreChannelType.COMMAND_REDO_UNDO_CHANNEL, { undoList, redoList });
};

const executeCutCommand = () => {
    if (!Controller.setClipBoard()) return;

    const command = new DeleteCommand();
    CommandManager.execute(command);
    const { undoList, redoList } = CommandManager;
    storeChannel.publish(StoreChannelType.COMMAND_REDO_UNDO_CHANNEL, { undoList, redoList });
};

const executePasteCommand = () => {
    const { focusList, trackList, clipBoard, selectTrackData } = store.getState();

    if (focusList.length > 1 || !clipBoard) return;
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

    const { undoList, redoList } = CommandManager;
    storeChannel.publish(StoreChannelType.COMMAND_REDO_UNDO_CHANNEL, { undoList, redoList });
};

const executeSplitCommand = (cursorPosition: number, trackId: number, sectionId: number): void => {
    const track = Controller.getTrack(trackId);
    const trackSection = track?.trackSectionList.find((section) => section.id === sectionId);
    if (!trackSection || !track) return;

    const splitCommand = new SplitCommand(cursorPosition, CopyUtil.copyTrack(track), CopyUtil.copySection(trackSection));
    CommandManager.execute(splitCommand);
    const { undoList, redoList } = CommandManager;
    storeChannel.publish(StoreChannelType.COMMAND_REDO_UNDO_CHANNEL, { undoList, redoList });
};

const executeAddTrackCommand = (): void => {
    const addTrackCommand = new AddTrackCommand();
    CommandManager.execute(addTrackCommand);
    const { undoList, redoList } = CommandManager;
    storeChannel.publish(StoreChannelType.COMMAND_REDO_UNDO_CHANNEL, { undoList, redoList });
};

const executeMoveCommand = (prevTrackId: number, currentTrackId: number, trackSection: TrackSection, movingCursorTime: number, prevCursorTime: number) => {
    const { trackList } = store.getState();
    const prevTrack = trackList.find((track) => track.id === prevTrackId);
    const currentTrack = trackList.find((track) => track.id === currentTrackId);

    if (!prevTrack || !currentTrack) return;

    const command = new MoveCommand(CopyUtil.copyTrack(prevTrack), CopyUtil.copyTrack(currentTrack), trackSection, movingCursorTime, prevCursorTime);
    CommandManager.execute(command);

    const { undoList, redoList } = CommandManager;
    storeChannel.publish(StoreChannelType.COMMAND_REDO_UNDO_CHANNEL, { undoList, redoList });
};

const executeDeleteTrackCommand = (trackId: number): void => {
    if (isMinLengthOfTrackList()) {
        alert("트랙은 최소 3개 이상 존재해야합니다.");
        return;
    }

    const deleteTrackCommand = new DeleteTrackCommand(trackId);
    CommandManager.execute(deleteTrackCommand);

    const { undoList, redoList } = CommandManager;
    storeChannel.publish(StoreChannelType.COMMAND_REDO_UNDO_CHANNEL, { undoList, redoList });
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
    const { undoList, redoList } = CommandManager;
    storeChannel.publish(StoreChannelType.COMMAND_REDO_UNDO_CHANNEL, { undoList, redoList });
}

const executeAddEffectCommand = (effect: Effect) => {
    const { trackList, effectIndex } = store.getState();
    const newTrackList = CopyUtil.copyTrackList(trackList);
    effect.id = effectIndex;
    const fucusList = Controller.getFocusList();
    const focusSectionList = fucusList.map(focus => CopyUtil.copySection(focus.trackSection));
    const addEffectCommand = new AddEffectCommand(newTrackList, focusSectionList, effect);

    store.setEffectIndex(effectIndex + 1);
    CommandManager.execute(addEffectCommand);
}

const executeDeleteEffectCommand = (effectId: number): void => {
    const { trackList } = store.getState();
    const newTrackList = CopyUtil.copyTrackList(trackList);

    const deleteEffectCommand = new DeleteEffectCommand(newTrackList, effectId);

    CommandManager.execute(deleteEffectCommand);
}

const executeModifyEffectCommand = (effect: Effect) => {
    const { trackList } = store.getState();
    const newTrackList = CopyUtil.copyTrackList(trackList);

    const modifyEffectCommand = new ModifyEffectCommand(newTrackList, effect);

    CommandManager.execute(modifyEffectCommand);
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
    executeColorChangeCommand,
    executeAddEffectCommand,
    executeDeleteEffectCommand,
    executeModifyEffectCommand
}
