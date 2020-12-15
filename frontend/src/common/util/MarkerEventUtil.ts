import { Controller } from '@controllers';

const clickMarkerListener = (element: HTMLElement) => (e: Event): void => {
  if (!element) return;
  const [currentPosition, cursorNumberTime] = Controller.getCurrentPosition();

  Controller.changeMarkerPlayStringTime(cursorNumberTime);
  Controller.changeMarkerNumberTime(cursorNumberTime);

  if (!Controller.getIsPauseState()) {

    Controller.audioCursorPlay();
  }

  if (currentPosition < 0) return;
  element.style.left = `${currentPosition}px`;
};

export { clickMarkerListener };
