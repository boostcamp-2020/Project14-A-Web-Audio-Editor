import { Controller } from '@controllers';

const clickMarkerListener = (element: HTMLElement) => (e: Event): void => {
  if (!element) return;
  const [currentPosition, cursorNumberTime] = Controller.getCurrentPosition();
  const isPause = Controller.getIsPauseState();
  const isRepeat = Controller.getIsRepeatState();
  const currentScrollAmount = Controller.getCurrentScrollAmount();

  if (isRepeat) {
    const [loopStartTime, loopEndTime] = Controller.getLoopTime();

    if (cursorNumberTime < loopStartTime || cursorNumberTime > loopEndTime) return;
  }

  Controller.changeMarkerPlayStringTime(cursorNumberTime);
  Controller.changeMarkerNumberTime(cursorNumberTime);

  if (!isPause) {
    Controller.audioCursorPlay();
  }

  if (currentPosition < 0) return;
  element.style.left = `${currentPosition + currentScrollAmount}px`;
};

export { clickMarkerListener };
