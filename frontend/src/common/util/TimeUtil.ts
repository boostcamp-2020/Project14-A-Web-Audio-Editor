import { getSecondPerPixel, getDifferenceWidth } from './WidthUtil';

const SECTION_TIME = 15;

const splitTime = (time: number): number[] => {
  let newMinute = Math.floor(time / 60);
  let newSecond = time % 60;
  let newMilsecond = Number((newSecond % 1).toFixed(3).split('.')[1]);

  return [newMinute, Math.floor(newSecond), newMilsecond];
};

const getPlayBarTimes = (time: number): string[] => {
  const offsetOfPlayBarTimes = getOffsetOfPlayBarTimes(time);
  const timeArray: string[] = [];

  for (let second = 0; second <= time; second += offsetOfPlayBarTimes) {
    const [newMinute, newSecond] = splitTime(second);

    const stringTime = `${newMinute.toString().padStart(2, '0')}:${newSecond.toString().padStart(2, '0')}`;

    timeArray.push(stringTime);
  }
  return timeArray;
};

const getOffsetOfPlayBarTimes = (time: number): number => {
  const offsetOfPlayBarTimes = Math.round(time / SECTION_TIME);
  return offsetOfPlayBarTimes;
}

const getNumberTime = (startX: number, currentX: number, mainWidth: number, time:number): number => {
  const secondPerPixel = getSecondPerPixel(mainWidth, time);
  const differenceWidth = getDifferenceWidth(startX, currentX);
  const cursorNumberTime = secondPerPixel * differenceWidth;

  return cursorNumberTime;
};

const getStringTime = (minute: number, second: number, milsecond: number): string => {
  const stringTime: string = `${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}:${milsecond.toString().padStart(3, '0')}`;

  return stringTime;
};

const calculateTimeOfCursorPosition = (startX: number, currentX: number, mainWidth: number, time: number): number => {
  const secondPerPixel = getSecondPerPixel(mainWidth, time);
  const differenceWidth = getDifferenceWidth(startX, currentX);
  const cursorTime = secondPerPixel * differenceWidth;

  return cursorTime;
};

export { getOffsetOfPlayBarTimes, splitTime, getPlayBarTimes, getNumberTime, getStringTime, calculateTimeOfCursorPosition };
