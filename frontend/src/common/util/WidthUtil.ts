const getPixelPerSecond = (elementWidth: number, trackPlayTime: number): number => {
  const pixelPerSecond: number = parseFloat((Number(elementWidth) / Number(trackPlayTime)).toFixed(2));
  return pixelPerSecond;
};

const getSecondPerPixel = (elementWidth: number, trackPlayTime: number): number => {
  const pixelPerSecond = getPixelPerSecond(elementWidth, trackPlayTime);
  const secondPerPixel: number = parseFloat((1 / pixelPerSecond).toFixed(2));
  return secondPerPixel;
};

const getPerPixel = (time: number, trackPlayTime: number): number => {
  const playBarElement: HTMLElement | null = document.querySelector('audi-playbar');
  if (!playBarElement) return 0;

  const playBarWidth = playBarElement.getBoundingClientRect().right - playBarElement.getBoundingClientRect().left;
  const second = time / 1000;
  const pixelPerSecond: number = getPixelPerSecond(playBarWidth, trackPlayTime);
  const somePixel: number = pixelPerSecond * second;

  return somePixel;
};

const getDifferenceWidth = (startX: number, currentX: number): number => {
  const differenceWidth = currentX - startX;
  return differenceWidth;
};

export { getPixelPerSecond, getPerPixel, getSecondPerPixel, getDifferenceWidth };
