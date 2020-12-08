import { getSecondPerPixel, getDifferenceWidth } from './WidthUtil';

const SECTION_TIME = 15;

const getSplitTime = (time: number): number[] => {
  let newMinute = Math.floor(time / 60);
  let newSecond = time % 60;
  let newMilsecond = Number((newSecond % 1).toFixed(3).split('.')[1]);

  return [newMinute, Math.floor(newSecond), newMilsecond];
};

const getStringPlayBarTime = (time: number): string[] => {
  let gap = Math.round(time / SECTION_TIME);
  const timeArray: string[] = [];

  for (let second = 0; second <= time; second += gap) {
    const [newMinute, newSecond] = getSplitTime(second);

    const stringTime = `${newMinute.toString().padStart(2, '0')}:${newSecond.toString().padStart(2, '0')}`;

    timeArray.push(stringTime);
  }
  return timeArray;
};

const getNumberTime = (startX: number, currentX: number, mainWidth: number): number => {
  const secondPerPixel = getSecondPerPixel(mainWidth);
  const differenceWidth = getDifferenceWidth(startX, currentX);
  const cursorNumberTime = secondPerPixel * differenceWidth;

  return cursorNumberTime;
};

const getStringTime = (minute: number, second: number, milsecond: number): string => {
  const stringTime: string = `${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}:${milsecond.toString().padStart(3, '0')}`;

  return stringTime;
};

export { getSplitTime, getStringPlayBarTime, getNumberTime, getStringTime };
