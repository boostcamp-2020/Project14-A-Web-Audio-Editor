import { Controller, CommandController } from '@controllers';
import { TrackSection } from '@model';
import { WidthUtil, TimeUtil, ValidUtil } from '@util';

const showAfterimage = (afterimage: HTMLElement, trackId: number, trackContainerWidth: number, currentCursorPosition: number): void => {
  const dragData = Controller.getSectionDragStartData();
  const isPause = Controller.getIsPauseState();

  if (!dragData || !isPause) return;

  const maxTrackPlayTime = Controller.getMaxTrackPlayTime();
  const secondPerPixel = WidthUtil.getPixelPerSecond(trackContainerWidth, maxTrackPlayTime);
  let { offsetLeft, prevCursorTime } = dragData;


  if (dragData.trackSection.id === 0) {
    prevCursorTime = currentCursorPosition / secondPerPixel;
    dragData.prevCursorTime = prevCursorTime;
    dragData.trackSection.trackStartTime = prevCursorTime - (dragData.trackSection.length / 2);
  }


  if (!offsetLeft || !prevCursorTime) return;
  const track = Controller.getTrack(trackId);
  const movingCursorTime = TimeUtil.calculateTimeOfCursorPosition(offsetLeft, currentCursorPosition, trackContainerWidth, maxTrackPlayTime);


  if (!dragData.trackSection || !track) return;

  let newTrackStartTime = movingCursorTime - (prevCursorTime - dragData.trackSection.trackStartTime);

  if (newTrackStartTime < 0) {
    newTrackStartTime = 0;
  }
  let newTrackEndTime = newTrackStartTime + dragData.trackSection.length;
  let resultValid = ValidUtil.checkEnterTrack(dragData.trackSection, track.trackSectionList, newTrackStartTime, newTrackEndTime);
  if (resultValid.leftValid && !resultValid.rightValid) {
    const prevSection = getPrevTrackSection(trackId, dragData.trackSection.id, newTrackStartTime);
    if (prevSection) {
      const prevEndTime = prevSection.trackStartTime + prevSection.length
      if (newTrackStartTime - prevEndTime < prevSection.length / 4) {
        newTrackStartTime = prevEndTime;
        newTrackEndTime = dragData.trackSection.length;
      }
    }
  } else if (!resultValid.leftValid && resultValid.rightValid) {
    const nextSection = getNextTrackSection(trackId, dragData.trackSection.id, newTrackStartTime, newTrackEndTime);
    if (nextSection) {
      const nextStartTime = nextSection.trackStartTime;
      if (newTrackEndTime - nextStartTime < nextSection.length / 4) {
        newTrackEndTime = nextStartTime;
        newTrackStartTime = newTrackEndTime - dragData.trackSection.length;
      }
    }
  }
  resultValid = ValidUtil.checkEnterTrack(dragData.trackSection, track.trackSectionList, newTrackStartTime, newTrackEndTime);

  if (resultValid.leftValid || resultValid.rightValid) {
    afterimage.style.display = 'none';
    afterimage.style.left = `0px`;
    afterimage.style.width = `0px`;
    return;
  } else {
    afterimage.style.display = 'block';
  }

  afterimage.style.left = `${newTrackStartTime * secondPerPixel}px`;
  afterimage.style.width = `${dragData.trackSection.length * secondPerPixel}px`;
}

const dropTrackSection = (trackId: number, currentCursorPosition: number, trackContainerWidth: number) => {
  const dragData = Controller.getSectionDragStartData();

  if (!dragData) return;
  const { prevCursorTime, offsetLeft } = dragData;
  const maxTrackPlayTime = Controller.getMaxTrackPlayTime();

  if (dragData.trackSection.id === 0 && prevCursorTime) {
    dragData.trackSection.trackStartTime = prevCursorTime - (dragData.trackSection.length / 2);
    dragData.trackSection.trackId = trackId;

  }

  if (!offsetLeft || !prevCursorTime) return;

  const movingCursorTime = TimeUtil.calculateTimeOfCursorPosition(offsetLeft, currentCursorPosition, trackContainerWidth, maxTrackPlayTime);

  Controller.resetFocus();
  CommandController.executeMoveCommand(dragData.trackSection.trackId, trackId, dragData.trackSection, movingCursorTime, prevCursorTime);
}

const getPrevTrackSection = (trackId: number, sectionId: number, trackStartTime: number): TrackSection | undefined => {
  const track = Controller.getTrack(trackId);
  if (!track) return;

  const prevTrackSection = track.trackSectionList.find(section =>
    section.id !== sectionId &&
    section.trackStartTime <= trackStartTime &&
    trackStartTime < section.trackStartTime + section.length
  )
  return prevTrackSection
}

const getNextTrackSection = (trackId: number, sectionId: number, trackStartTime: number, trackEndTime: number): TrackSection | undefined => {
  const track = Controller.getTrack(trackId);
  if (!track) return;

  const nextTrackSection = track.trackSectionList.find(section =>
    section.id !== sectionId &&
    trackStartTime <= section.trackStartTime &&
    section.trackStartTime < trackEndTime
  )
  return nextTrackSection
}


export { showAfterimage, dropTrackSection, getPrevTrackSection, getNextTrackSection };