import { getDifferenceWidth } from './WidthUtil';
import { splitTime, calculateTimeOfCursorPosition } from './TimeUtil';
import { Controller } from '@controllers';

const mousemoveMarkerListener: Function = (element: HTMLElement, elementLeftX: number, elementWidth: number, currentScrollAmount: number, trackPlayTime: number) => (e: MouseEvent): void => {
  if (!element) return;

  const cursorPosition = e.pageX;
  const scrolledCursorPosition = cursorPosition + currentScrollAmount
  const timeOfCursorPosition = calculateTimeOfCursorPosition(elementLeftX, scrolledCursorPosition, elementWidth, trackPlayTime);
  const [minute, second, milsecond] = splitTime(timeOfCursorPosition);
  const offesetOfCursorPosition = getDifferenceWidth(elementLeftX, cursorPosition);

  if (minute < 0 && second < 0) return;
  Controller.changeCurrentPosition(offesetOfCursorPosition);
  Controller.changeCursorStringTime(minute, second, milsecond);
  Controller.changeCursorNumberTime(timeOfCursorPosition);
};

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

export { mousemoveMarkerListener, clickMarkerListener };
