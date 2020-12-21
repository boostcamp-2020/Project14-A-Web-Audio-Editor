import { Controller, CommandController, ZoomController } from '@controllers';
import { Track, TrackSection } from '@model';
import { WidthUtil, TimeUtil, ValidUtil } from '@util';

const showAfterimage = (afterimage: HTMLElement, trackId: number, trackContainerWidth: number, currentCursorPosition: number): void => {
  const dragData = Controller.getSectionDragStartData();

  if (!dragData) return;

  const currentPixelPerSecond = ZoomController.getCurrentPixelPerSecond();
  const currentScrollAmount = Controller.getCurrentScrollAmount();
  let { offsetLeft, prevCursorTime } = dragData;

  if (dragData.trackSection.id === 0) {
    prevCursorTime = currentCursorPosition / currentPixelPerSecond;
    dragData.prevCursorTime = prevCursorTime;
    dragData.trackSection.trackStartTime = prevCursorTime - (dragData.trackSection.length / 2);
  }

  if (!offsetLeft || !prevCursorTime) return;
  const track = Controller.getTrack(trackId);
  const currentCursorTime = TimeUtil.calculateTimeOfCursorPosition(offsetLeft, currentCursorPosition);
  const scrorllAmountTime = currentScrollAmount / currentPixelPerSecond;
  if (!dragData.trackSection || !track) return;

  const newTrackStartTime = currentCursorTime - (prevCursorTime - dragData.trackSection.trackStartTime) + scrorllAmountTime;

  const { startTime, endTime } = getRenewTrackTimes(track, dragData.trackSection, newTrackStartTime);

  const resultValid = ValidUtil.checkEnterTrack(dragData.trackSection, track.trackSectionList, startTime, endTime);

  if (resultValid.leftValid || resultValid.rightValid) {
    afterimage.style.display = 'none';
    afterimage.style.left = `0px`;
    afterimage.style.width = `0px`;
    return;
  } else {
    afterimage.style.display = 'block';
  }

  afterimage.style.left = `${(startTime) * currentPixelPerSecond}px`;
  afterimage.style.width = `${dragData.trackSection.length * currentPixelPerSecond}px`;
}

const dropTrackSection = (trackId: number, currentCursorPosition: number, trackContainerWidth: number) => {
  const dragData = Controller.getSectionDragStartData();

  if (!dragData) return;
  const { prevCursorTime, offsetLeft } = dragData;

  if (dragData.trackSection.id === 0 && prevCursorTime) {
    dragData.trackSection.trackStartTime = prevCursorTime - (dragData.trackSection.length / 2);
    dragData.trackSection.trackId = trackId;
  }

  if (!offsetLeft || !prevCursorTime) return;

  const currentCursorTime = TimeUtil.calculateTimeOfCursorPosition(offsetLeft, currentCursorPosition);

  Controller.resetFocus();
  CommandController.executeMoveCommand(dragData.trackSection.trackId, trackId, dragData.trackSection, currentCursorTime, prevCursorTime);
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

const getRenewTrackTimes = (currentTrack: Track, dragedTrackSection: TrackSection, newTrackStartTime: number) => {
  if (newTrackStartTime < 0) {
    newTrackStartTime = 0;
  }

  let newTrackEndTime = newTrackStartTime + dragedTrackSection.length;
  let resultValid = ValidUtil.checkEnterTrack(dragedTrackSection, currentTrack.trackSectionList, newTrackStartTime, newTrackEndTime);

  if (resultValid.leftValid && !resultValid.rightValid) {
    const prevSection = getPrevTrackSection(currentTrack.id, dragedTrackSection.id, newTrackStartTime);
    if (prevSection) {
      const prevEndTime = prevSection.trackStartTime + prevSection.length
      if (prevEndTime - newTrackStartTime < prevSection.length / 3) {
        newTrackStartTime = prevEndTime;
        newTrackEndTime = newTrackStartTime + dragedTrackSection.length;
      }
    }
  } else if (!resultValid.leftValid && resultValid.rightValid) {
    const nextSection = getNextTrackSection(currentTrack.id, dragedTrackSection.id, newTrackStartTime, newTrackEndTime);
    if (nextSection) {
      const nextStartTime = nextSection.trackStartTime;
      if (newTrackEndTime - nextStartTime < nextSection.length / 3 && nextStartTime - dragedTrackSection.length >= 0) {
        newTrackEndTime = nextStartTime;
        newTrackStartTime = newTrackEndTime - dragedTrackSection.length;
      }
    }
  }

  return { startTime: newTrackStartTime, endTime: newTrackEndTime }
}


export { showAfterimage, dropTrackSection, getPrevTrackSection, getNextTrackSection, getRenewTrackTimes };