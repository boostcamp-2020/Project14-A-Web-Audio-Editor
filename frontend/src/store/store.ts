import { StoreStateType, CursorType, ZoomInfoType, StoreChannelType, ModalType, ModalStateType, FocusInfo, SidebarMode, EffectType } from '@types';
import { Track, Source, TrackSection, SectionDragStartData, SelectTrackData, Effect } from '@model';
import { storeChannel } from '@store';
import { ModifyingEffectInfo } from 'src/common/types/effectTypes';

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
      effectIndex: 1,
      clipBoard: null,
      currentPosition: 0,
      markerNumberTime: 0,
      cursorNumberTime: 0,
      isPause: true,
      isRepeat: false,
      prevMaxTrackWidth: 0,
      maxTrackWidth: 0,
      maxTrackPlayTime: 300,
      currentScrollAmount: 0,
      sectionDragStartData: null,
      selectTrackData: new SelectTrackData({ trackId: 0, selectedTime: 0 }),
      zoomInfo: {
        rate: 1.0,
        defaultTrackTime: 300,
        pixelPerSecond: 0,
        playTimeInterval: 20
      },
      loopStartTime: 0,
      loopEndTime: 300,
      sidebarMode: SidebarMode.SOURCE_LIST,
      effectOptionType: EffectType.gain,
      hoverSourceInfo: null,
      isEffectModifyMode: false,
      modifyingEffectInfo: { id: 0, trackId: 0, trackSectionId: 0 }
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

  resetSelectTrackData(): void {
    const { selectTrackData } = this.state;
    selectTrackData.trackId = 0;
    selectTrackData.selectedTime = 0;

    storeChannel.publish(StoreChannelType.SELECT_AUDIO_TRACK, selectTrackData);
  }

  setSelectTrackData(trackId: number, selectedTime: number): void {
    this.state = { ...this.state, selectTrackData: { trackId, selectedTime } };
    storeChannel.publish(StoreChannelType.SELECT_AUDIO_TRACK, this.state.selectTrackData);
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

  setEffectIndex(effectIndex: number) {
    this.state.effectIndex = effectIndex;
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
    storeChannel.publish(StoreChannelType.TOTAL_TIME_CHANNEL, newTrackList);
    storeChannel.publish(StoreChannelType.FILE_TOOLS_CHANNEL, newTrackList);
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
    storeChannel.publish(StoreChannelType.FOCUS_LIST_CHANNEL, newfocusList);
  }

  removeFocus(removeIndex: number) {
    const { focusList } = this.state;
    const newfocusList = [...focusList];
    newfocusList.splice(removeIndex, 1);
    this.state = { ...this.state, focusList: newfocusList };
    storeChannel.publish(StoreChannelType.FOCUS_LIST_CHANNEL, newfocusList);
  }

  resetFocus(): void {
    const newFocusList = [];
    this.state = { ...this.state, focusList: newFocusList };
    storeChannel.publish(StoreChannelType.FOCUS_LIST_CHANNEL, newFocusList);
  }

  setClipBoard(newSection: TrackSection): void {
    this.state.clipBoard = newSection;
    storeChannel.publish(StoreChannelType.CLIPBOARD_CHANNEL, newSection);
  }

  setMarkerNumberTime(newMarkerNumberTime: number): void {
    const { markerNumberTime } = this.state;

    if (markerNumberTime === newMarkerNumberTime) {
      return;
    }
    this.state = { ...this.state, markerNumberTime: newMarkerNumberTime };
  }

  setCursorNumberTime(newCursorNumberTime: number): void {
    this.state = { ...this.state, cursorNumberTime: newCursorNumberTime };
  }

  setIsPauseState(isPauseState: boolean): void {
    this.state = { ...this.state, isPause: isPauseState };
  }

  setMarkerWidth(newMarkerWidth: number | number[]): void {
    storeChannel.publish(StoreChannelType.CURRENT_POSITION_CHANNEL, newMarkerWidth);
  }

  initMarkerWidth(newMarkerWidth: number): void {
    storeChannel.publish(StoreChannelType.RESET_MARKER_POSITION_CHANNEL, newMarkerWidth);
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
    storeChannel.publish(StoreChannelType.FILE_TOOLS_CHANNEL, newTrackList);
  }

  setCursorMode(newCursorMode: CursorType): void {
    const { cursorMode } = this.state;
    if (cursorMode === newCursorMode) return;

    this.state = { ...this.state, cursorMode: newCursorMode };
    storeChannel.publish(StoreChannelType.CURSOR_MODE_CHANNEL, newCursorMode);
  }

  setMaxTrackWidth(newMaxTrackWidth: number): void {
    const { maxTrackWidth } = this.state;
    if (maxTrackWidth === newMaxTrackWidth) return;

    this.state = { ...this.state, maxTrackWidth: newMaxTrackWidth, prevMaxTrackWidth: maxTrackWidth };
    storeChannel.publish(StoreChannelType.MAX_TRACK_WIDTH_CHANNEL, newMaxTrackWidth);
  }

  changePlayOrPauseIcon(iconType: number) {
    storeChannel.publish(StoreChannelType.PLAY_OR_PAUSE_CHANNEL, iconType);
  }

  setIsRepeatState(isRepeat: boolean) {
    this.state = { ...this.state, isRepeat: isRepeat };
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

  setTrackList(newTrackList: Track[]): void {
    this.state = { ...this.state, trackList: newTrackList };
  }

  setTrackIndex(newTrackIndex: number): void {
    this.state = { ...this.state, trackIndex: newTrackIndex };
  }

  setZoomPixelPerSecond(newPixelPerSecond: number): void {
    const { zoomInfo } = this.getState();
    this.state = { ...this.state, zoomInfo: { ...zoomInfo, pixelPerSecond: newPixelPerSecond } };
    storeChannel.publish(StoreChannelType.ZOOM_PIXEL_PER_SECOND_CHANNEL, newPixelPerSecond);
  }

  setZoomRate(newZoomRate: number): void {
    const { zoomInfo } = this.state;
    this.state = { ...this.state, zoomInfo: { ...zoomInfo, rate: newZoomRate } };
    storeChannel.publish(StoreChannelType.ZOOM_RATE_CHANNEL, newZoomRate);
  }

  setLoopStartTime = (newLoopStartTime: number): void => {
    this.state = { ...this.state, loopStartTime: newLoopStartTime };
  };

  setLoopEndTime = (newLoopEndTime: number): void => {
    this.state = { ...this.state, loopEndTime: newLoopEndTime };
  };

  setSidebarMode = (newSidebarMode: SidebarMode): void => {
    const { sidebarMode } = this.state;
    if (sidebarMode === newSidebarMode) return;

    this.state = { ...this.state, sidebarMode: newSidebarMode };
    storeChannel.publish(StoreChannelType.SIDEBAR_MODE_CHANNEL, newSidebarMode);
  }

  setEffectOptionType = (newEffectOptionType: EffectType): void => {
    const { effectOptionType } = this.state

    this.state = { ...this.state, effectOptionType: newEffectOptionType };
    storeChannel.publish(StoreChannelType.EFFECT_OPTION_TYPE_CHANNEL, newEffectOptionType);
  }

  setHoverSourceInfo = (newSource: Source | null): void => {
    this.state = { ...this.state, hoverSourceInfo: newSource };
    storeChannel.publish(StoreChannelType.SOURCELIST_SOURCE_INFO_CHANNEL, newSource);
  }

  deleteEffect = (effectIndex: number, trackIndex: number, trackSectionIndex: number): void => {
    const { trackList } = this.state;
    const newTrackList = [...trackList];
    newTrackList[trackIndex].trackSectionList[trackSectionIndex].effectList.splice(effectIndex, 1);
    this.state = { ...this.state, trackList: newTrackList };

    storeChannel.publish(StoreChannelType.TRACK_CHANNEL, newTrackList);
    storeChannel.publish(StoreChannelType.EFFECT_STATE_CHANNEL, null);
  }

  setIsEffectModifyMode = (mode: boolean) => {
    this.state = { ...this.state, isEffectModifyMode: mode };
  }

  setModifyingEffectInfo = ({ id, trackId, trackSectionId }: ModifyingEffectInfo) => {
    this.state = { ...this.state, modifyingEffectInfo: { id: id, trackId: trackId, trackSectionId: trackSectionId } };
  }

  setModifyingEffect = (newEffect: Effect) => {
    const { trackList, modifyingEffectInfo } = this.state;

    const newTrackList = [...trackList];

    const trackIndex = newTrackList.findIndex((track) => track.id === modifyingEffectInfo.trackId);
    const trackSectionIndex = newTrackList[trackIndex].trackSectionList.findIndex((trackSection) => trackSection.id === modifyingEffectInfo.trackSectionId);
    const effectIndex = newTrackList[trackIndex].trackSectionList[trackSectionIndex].effectList.findIndex((effect) => effect.id === modifyingEffectInfo.id);

    newTrackList[trackIndex].trackSectionList[trackSectionIndex].effectList[effectIndex].properties = newEffect.properties;
    this.state = { ...this.state, trackList: newTrackList };

    storeChannel.publish(StoreChannelType.TRACK_CHANNEL, newTrackList);
  }

})();

export { store };
