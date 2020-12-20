import { getDifferenceWidth } from './WidthUtil';
import { ZoomController } from '@controllers'

const SECTION_TIME = 15;

const splitTime = (time: number): number[] => {
  let newMinute = Math.floor(time / 60);
  let newSecond = time % 60;
  let newMilsecond = Number((newSecond % 1).toFixed(3).split('.')[1]);

  return [newMinute, Math.floor(newSecond), newMilsecond];
};

const getPlayBarTimes = (time: number): string[] => {
  const timeArray: string[] = [];
  const playTimeInterval = ZoomController.getCurrentPlayTimeInterval();

  for (let second = 0; second <= time; second += playTimeInterval) {
    const [newMinute, newSecond] = splitTime(second);

    const stringTime = `${newMinute.toString().padStart(2, '0')}:${newSecond.toString().padStart(2, '0')}`;

    timeArray.push(stringTime);
  }
  return timeArray;
};

const getNumberTime = (startX: number, currentX: number, mainWidth: number, time: number): number => {
  const pixelPerSecond = ZoomController.getCurrentPixelPerSecond();
  const secondPerPixel = 1 / pixelPerSecond;
  const differenceWidth = getDifferenceWidth(startX, currentX);
  const cursorNumberTime = secondPerPixel * differenceWidth;

  return cursorNumberTime;
};

const getStringTime = (minute: number, second: number, milsecond: number): string => {
  const stringTime: string = `${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}:${milsecond.toString().padStart(3, '0')}`;

  return stringTime;
};

const calculateTimeOfCursorPosition = (startX: number, currentX: number): number => {
  const pixelPerSecond = ZoomController.getCurrentPixelPerSecond();
  const secondPerPixel = 1 / pixelPerSecond;

  const differenceWidth = getDifferenceWidth(startX, currentX);
  const cursorTime = secondPerPixel * differenceWidth;

  return cursorTime;
};

const parsePlayTime = (playTime: number): string => {
  if (playTime < 60) {
    const seconds = Math.round(playTime);
    return `${seconds}초`;
  }

  const minute = Math.floor(playTime / 60);
  const seconds = Math.round(playTime % 60);
  return `${minute}분 ${seconds}초`;
}

export { splitTime, getPlayBarTimes, getNumberTime, getStringTime, calculateTimeOfCursorPosition, parsePlayTime };
