const SECTION_TIME = 15;
const DEFAULT_TIME = 300;

const setTime = (time: number): number[] => {
  let newMinute = Math.floor(time / 60);
  let newSecond = time % 60;
  let newMilsecond = Number((newSecond % 1).toFixed(3).split('.')[1]);

  return [newMinute, Math.floor(newSecond), newMilsecond];
};

const getOnePixel = (mainWidth: number): number[] => {
  //1초에 몇 픽셀인지
  const oneSecond: number = parseFloat((Number(mainWidth) / Number(DEFAULT_TIME)).toFixed(2));

  //1px에 몇초인지
  const onePixel: number = parseFloat((1 / oneSecond).toFixed(2));

  return [onePixel, oneSecond];
};

const getSomePixel = (time: number): number => {
  const playBarElement: HTMLElement | null = document.querySelector('audi-playbar');
  const mainWidth = playBarElement?.getBoundingClientRect().right - playBarElement?.getBoundingClientRect().left;

  const second = time / 1000;
  //1초에 몇 픽셀인지
  const oneSecond: number = parseFloat((Number(mainWidth) / Number(DEFAULT_TIME)).toFixed(2));

  const somePixel: number = oneSecond * second;

  return somePixel;
};

const getCursorPosition = (defaultStartX: number, currentX: number, mainWidth: number): number[] => {
  const [onePixel] = getOnePixel(mainWidth);
  const differenceWidth = currentX - defaultStartX;
  const cursorTime = onePixel * differenceWidth;

  const [newMinute, newSecond, newMilsecond] = setTime(cursorTime);

  return [newMinute, newSecond, newMilsecond, differenceWidth, cursorTime]; // {} 으로 retrun해도 좋을 것 같아요
};

const getStringTime = (time: number): string[] => {
  let gap = Math.round(time / SECTION_TIME);
  const timeArray: string[] = [];

  for (let second = 0; second <= time; second += gap) {
    const [newMinute, newSecond] = setTime(second);

    const stringTime = `${newMinute.toString().padStart(2, '0')}:${newSecond.toString().padStart(2, '0')}`;

    timeArray.push(stringTime);
  }
  return timeArray;
};

export { getStringTime, getCursorPosition, setTime, getSomePixel };
