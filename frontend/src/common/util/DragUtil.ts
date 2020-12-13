import { Controller, CommandController } from '@controllers';
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
  const newTrackEndTime = newTrackStartTime + dragData.trackSection.length;

  if (ValidUtil.checkEnterTrack(dragData.trackSection, track.trackSectionList, newTrackStartTime, newTrackEndTime)) {
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


export { showAfterimage, dropTrackSection };