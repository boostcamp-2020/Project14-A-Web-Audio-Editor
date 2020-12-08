import { getDifferenceWidth } from './WidthUtil';
import { getSplitTime, getNumberTime } from './TimeUtil';
import { Controller } from '@controllers';

const mousemoveMarkerListener: Function = (element: HTMLElement, defaultStartX: number, mainWidth: number) => (e: Event): void => {
  if (!element) return;
  const cursorPosition = e.pageX;

  const cursorNumberTime = getNumberTime(defaultStartX, cursorPosition, mainWidth);
  const [minute, second, milsecond] = getSplitTime(cursorNumberTime);
  const cursorWidth = getDifferenceWidth(defaultStartX, cursorPosition);

  if (minute < 0 && second < 0) return;
  Controller.changeCurrentPosition(cursorWidth);
  Controller.changeCursorStringTime(minute, second, milsecond);
  Controller.changeCursorMarkerNumberTime(cursorNumberTime);
};

const clickMarkerListener = (element: HTMLElement) => (e: Event): void => {
  if (!element) return;
  const [currentPosition, cursorNumberTime] = Controller.getCurrentPosition();

  Controller.changeMarkerPlayStringTime(cursorNumberTime);

  if (!Controller.getIsPauseState()) {
    //play 함수 실행
  }

  if (currentPosition < 0) return;
  element.style.left = `${currentPosition}px`;
};

export { mousemoveMarkerListener, clickMarkerListener };
