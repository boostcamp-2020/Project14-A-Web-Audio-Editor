//임의로 지정한 변수들 입니다.
const width = '750';
const time = '300';

//1초에 몇 픽셀인지
const oneSecond: number = parseFloat((Number(width) / Number(time)).toFixed(2));

//1px에 몇초인지
const onePixel = parseFloat((1 / oneSecond).toFixed(2));

const SECTION_TIME = 15;

const setTime = (time: number): number[] => {
  let newMinute = Math.floor(time / 60);
  let newSecond = time % 60;
  let newMilsecond = Number((newSecond % 1).toFixed(3).split('.')[1]);

  return [newMinute, Math.floor(newSecond), newMilsecond];
};

const getCursorPosition = (defaultStartX: number, currentX: number): number[] => {
  const differenceWidth = currentX - defaultStartX;
  const cursorTime = onePixel * differenceWidth;

  const [newMinute, newSecond, newMilsecond] = setTime(cursorTime);

  return [newMinute, newSecond, newMilsecond, differenceWidth];
};

const getStringTime = (): string[] => {
  const time = 300;
  let gap = Math.round(time / SECTION_TIME);
  const timeArray: string[] = [];

  for (let second = 0; second <= time; second += gap) {
    const [newMinute, newSecond] = setTime(second);

    const stringTime = `${newMinute.toString().padStart(2, '0')}:${newSecond.toString().padStart(2, '0')}`;

    timeArray.push(stringTime);
  }
  return timeArray;
};

export { getStringTime, getCursorPosition, setTime };
