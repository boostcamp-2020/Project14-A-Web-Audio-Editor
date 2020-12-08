const DEFAULT_TIME = 300;

const getPixelPerSecond = (mainWidth: number): number => {
  const oneSecond: number = parseFloat((Number(mainWidth) / Number(DEFAULT_TIME)).toFixed(2));

  return oneSecond;
};

const getSecondPerPixel = (mainWidth: number): number => {
  const oneSecond: number = getPixelPerSecond(mainWidth);

  const onePixel: number = parseFloat((1 / oneSecond).toFixed(2));

  return onePixel;
};

const getPerPixel = (time: number): number => {
  const playBarElement: HTMLElement | null = document.querySelector('audi-playbar');

  if (!playBarElement) return 0;

  const mainWidth = playBarElement.getBoundingClientRect().right - playBarElement.getBoundingClientRect().left;

  const second = time / 1000;

  const oneSecond: number = getPixelPerSecond(mainWidth);
  const somePixel: number = oneSecond * second;

  return somePixel;
};

const getDifferenceWidth = (startX: number, currentX: number): number => {
  const differenceWidth = currentX - startX;
  return differenceWidth;
};

export { getPixelPerSecond, getPerPixel, getSecondPerPixel, getDifferenceWidth };
