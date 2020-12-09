import { getDifferenceWidth } from './WidthUtil';
import { getSplitTime, calculateTimeOfCursorPosition } from './TimeUtil';
import { Controller } from '@controllers';

//마우스가 움직일 때 불림.
const mousemoveMarkerListener: Function = (element: HTMLElement, defaultStartX: number, mainWidth: number) => (e: Event): void => {
  if (!element) return;
  const cursorPosition = e.pageX;

  const cursorNumberTime = calculateTimeOfCursorPosition(defaultStartX, cursorPosition, mainWidth);
  const [minute, second, milsecond] = getSplitTime(cursorNumberTime);
  const cursorWidth = getDifferenceWidth(defaultStartX, cursorPosition);

  if (minute < 0 && second < 0) return;
  Controller.changeCurrentPosition(cursorWidth);
  Controller.changeCursorStringTime(minute, second, milsecond);

  Controller.changeCursorNumberTime(cursorNumberTime);
};

//클릭 시.
const clickMarkerListener = (element: HTMLElement) => (e: Event): void => {
  if (!element) return;
  const [currentPosition, cursorNumberTime] = Controller.getCurrentPosition();

  Controller.changeMarkerPlayStringTime(cursorNumberTime);

  Controller.changeMarkerNumberTime(cursorNumberTime);

  if (!Controller.getIsPauseState()) {
    //play만 시켜주는 게 필요함. playOrPause는 일시정지가 되므로.
    Controller.audioCursorPlay();
  }

  if (currentPosition < 0) return;
  element.style.left = `${currentPosition}px`;
};

export { mousemoveMarkerListener, clickMarkerListener };
