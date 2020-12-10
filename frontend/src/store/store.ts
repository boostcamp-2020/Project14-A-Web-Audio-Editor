import { StoreStateType, CursorType } from '@types';
import { Track, Source, TrackSection, SectionDragStartData } from '@model';
import { StoreChannelType, ModalType, ModalStateType, FocusInfo } from '@types';
import { storeChannel } from '@store';

const store = new (class Store {
  private state: StoreStateType;

  constructor() {
    this.state = {
      cursorStringTime: '00:00:000',
      playStringTime: '00:00:000',
      sourceList: [],
      modalState: {
        modalType: ModalType.upload,
        isHidden: true
      },
      isTrackDraggable: false,
      trackList: this.initTrackList(3),
      focusList: [],
      ctrlIsPressed: false,
      cursorMode: CursorType.SELECT_MODE,
      trackIndex: 4,
      sectionIndex: 1,
      clipBoard: null,
      audioSourceInfoInTrackList: [],
      currentPosition: 0,
      markerNumberTime: 0,
      cursorNumberTime: 0,
      isPause: true,
      isRepeat: false,
      maxTrackWidth: 0,
      maxTrackPlayTime: 300,
      currentScrollAmount: 0,
      sectionDragStartData: null
    };
  }

  initTrackList(numOfTracks: number): Track[] {
    return Array(numOfTracks)
      .fill(0)
      .reduce((acc, cur, idx) => {
        const track = new Track({ id: idx + 1, trackSectionList: [] });
        return acc.concat(track);
      }, []);
  }

  getState(): StoreStateType {
    return this.state;
  }

  setSource(source: Source): void {
    const { sourceList } = this.state;
    source.id = sourceList.length;

    const newSourceList = sourceList.concat(source);
    this.state = { ...this.state, sourceList: newSourceList };
    storeChannel.publish(StoreChannelType.SOURCE_LIST_CHANNEL, newSourceList);
  }

  setModalState(newModalType: ModalType, newIsHiiden: Boolean): void {
    const { modalState } = this.state;
    const { modalType, isHidden } = modalState;

    if (modalType === newModalType && isHidden === newIsHiiden) return;

    const newModalState: ModalStateType = { modalType: newModalType, isHidden: newIsHiiden };
    this.state = { ...this.state, modalState: newModalState };
    storeChannel.publish(StoreChannelType.MODAL_STATE_CHANNEL, newModalState);
  }

  setCursorStringTime(newCursorStringTime: string): void {
    const { cursorStringTime } = this.state;

    if (cursorStringTime === newCursorStringTime) return;

    this.state = { ...this.state, cursorStringTime: newCursorStringTime };
    storeChannel.publish(StoreChannelType.CURSOR_TIME_CHANNEL, newCursorStringTime);
  }

  setTrackDragState(newIsTrackDraggable: Boolean): void {
    const { isTrackDraggable } = this.state;
    if (isTrackDraggable === newIsTrackDraggable) return;

    this.state = { ...this.state, isTrackDraggable: newIsTrackDraggable };
    storeChannel.publish(StoreChannelType.TRACK_DRAG_STATE_CHANNEL, newIsTrackDraggable);
  }

  setTrack(newTrack: Track): void {
    const { trackList } = this.state;

    const track = trackList.find((track) => track.id === newTrack.id);
    if (track) {
      track.trackSectionList = [...newTrack.trackSectionList];
    } else {
      newTrack.id = this.state.trackIndex++;
      const newAudioTrackList = trackList.concat(newTrack);

      this.state = { ...this.state, trackList: newAudioTrackList };
    }
  }

  setTrackSection(trackId: number, newTrackSection: TrackSection): void {
    const { trackList } = this.state;
    const track = trackList.find((track) => track.id === trackId);
    if (!track) return;

    const { trackSectionList } = track;
    if (newTrackSection.id === 0) {
      newTrackSection.id = this.state.sectionIndex++;
    }

    const newTrackSectionList = trackSectionList.concat(newTrackSection).sort((a, b) => a.trackStartTime - b.trackStartTime);

    const newTrack = new Track({ ...track, trackSectionList: newTrackSectionList });
    const newTrackList: Array<Track> = trackList.reduce<Track[]>(
      (acc, track) => (track.id === trackId ? acc.concat(newTrack) : acc.concat(track)),
      []
    );

    this.state = { ...this.state, trackList: newTrackList };

    storeChannel.publish(StoreChannelType.TRACK_SECTION_LIST_CHANNEL, {
      trackId: trackId,
      trackSectionList: newTrackSectionList
    });
    storeChannel.publish(StoreChannelType.TRACK_CHANNEL, newTrackList);
    storeChannel.publish(StoreChannelType.EDIT_MENU_CHANNEL, null);
  }

  setCurrentPosition(newCurrentPosition: number): void {
    const { currentPosition } = this.state;

    if (currentPosition === newCurrentPosition) return;

    this.state = { ...this.state, currentPosition: newCurrentPosition };
  }

  setCtrlIsPressed(isPressed: boolean): void {
    this.state.ctrlIsPressed = isPressed;
  }

  addFocus(newFocusInfo: FocusInfo): void {
    const { focusList } = this.state;
    const newfocusList = focusList.concat(newFocusInfo);

    this.state = { ...this.state, focusList: newfocusList };
    storeChannel.publish(StoreChannelType.EDIT_TOOLS_CHANNEL, null);
  }

  removeFocus(removeIndex: number) {
    const { focusList } = this.state;
    const newfocusList = [...focusList];
    newfocusList.splice(removeIndex, 1);
    this.state = { ...this.state, focusList: newfocusList };
    storeChannel.publish(StoreChannelType.EDIT_TOOLS_CHANNEL, null);
  }

  resetFocus(): void {
    this.state = { ...this.state, focusList: [] };
    storeChannel.publish(StoreChannelType.EDIT_TOOLS_CHANNEL, null);
  }

  setClipBoard(newSection: TrackSection): void {
    this.state.clipBoard = newSection;
    storeChannel.publish(StoreChannelType.EDIT_TOOLS_CHANNEL, null);
  }

  setMarkerNumberTime(newMarkerNumberTime: number): void {
    const { markerNumberTime } = this.state;

    if (markerNumberTime === newMarkerNumberTime) {
      return;
    };

    this.state = { ...this.state, markerNumberTime: newMarkerNumberTime };
  }

  setCursorNumberTime(newCursorNumberTime: number): void {
    this.state = { ...this.state, cursorNumberTime: newCursorNumberTime };
  }

  setIsPauseState(isPauseState: boolean): void {
    this.state = { ...this.state, isPause: isPauseState };
  }

  setMarkerWidth(newMarkerWidth: number): void {
    storeChannel.publish(StoreChannelType.CURRENT_POSITION_CHANNEL, newMarkerWidth);
  }

  setPlayStringTime(newPlayStringTime): void {
    this.state = { ...this.state, playStringTime: newPlayStringTime };
    storeChannel.publish(StoreChannelType.PLAY_TIME_CHANNEL, newPlayStringTime);
  }

  removeSection(trackId: number, sectionIndex: number): void {
    const { trackList } = this.state;

    const track = trackList.find((track) => track.id === trackId);
    if (!track) return;

    const { trackSectionList } = track;

    const newTrackSectionList = [...trackSectionList];

    newTrackSectionList.splice(sectionIndex, 1);

    const newTrack = new Track({ ...track, trackSectionList: newTrackSectionList });
    const newTrackList: Array<Track> = trackList.reduce<Track[]>(
      (acc, track) => (track.id === trackId ? acc.concat(newTrack) : acc.concat(track)),
      []
    );

    this.state = { ...this.state, trackList: newTrackList };

    storeChannel.publish(StoreChannelType.TRACK_SECTION_LIST_CHANNEL, {
      trackId: trackId,
      trackSectionList: newTrackSectionList
    });

    storeChannel.publish(StoreChannelType.TRACK_CHANNEL, newTrackList);
    storeChannel.publish(StoreChannelType.EDIT_MENU_CHANNEL, null);
  }

  setCursorMode(newCursorMode: CursorType): void {
    const { cursorMode } = this.state;
    if (cursorMode === newCursorMode) return;

    this.state = { ...this.state, cursorMode: newCursorMode };
    storeChannel.publish(StoreChannelType.CURSOR_MODE_CHANNEL, newCursorMode);
  }

  setMaxTrackWidth(newMaxTrackWidth: number): void {
    const { maxTrackWidth } = this.state;
    if (maxTrackWidth >= newMaxTrackWidth) return;

    this.state = { ...this.state, maxTrackWidth: newMaxTrackWidth };
    storeChannel.publish(StoreChannelType.MAX_TRACK_WIDTH_CHANNEL, newMaxTrackWidth);
  }

  changePlayOrPauseIcon(iconType: number) {
    storeChannel.publish(StoreChannelType.PLAY_OR_PAUSE_CHANNEL, iconType);
  }

  setIsRepeatState(isRepeat: boolean) {
    this.state = { ...this.state, isRepeat: isRepeat };
  }

  changeRepeatIconColor(isRepeat: boolean) {
    storeChannel.publish(StoreChannelType.IS_REPEAT_CHANNEL, isRepeat);
  }

  soloPlay(trackId: number) {
    storeChannel.publish(StoreChannelType.SOLO_CHANNEL, trackId);
  }

  setMaxTrackPlayTime(newMaxTrackPlayTime: number): void {
    const { maxTrackPlayTime } = this.state;
    if (maxTrackPlayTime >= newMaxTrackPlayTime) return;

    this.state = { ...this.state, maxTrackPlayTime: newMaxTrackPlayTime };
    storeChannel.publish(StoreChannelType.MAX_TRACK_PLAY_TIME_CHANNEL, newMaxTrackPlayTime);
  }

  setCurrentScrollAmount(newCurrentScrollAmount: number): void {
    const { currentScrollAmount } = this.state;
    if (currentScrollAmount === newCurrentScrollAmount) return;

    this.state = { ...this.state, currentScrollAmount: newCurrentScrollAmount };
    storeChannel.publish(StoreChannelType.CURRENT_SCROLL_AMOUNT_CHANNEL, newCurrentScrollAmount);
  }

  setSectionDragStartData(newDragStartData: SectionDragStartData): void {
    this.state = { ...this.state, sectionDragStartData: newDragStartData };
  }
})();

export { store };
