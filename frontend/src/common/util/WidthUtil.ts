import { ZoomController } from "@controllers";

const getPerPixel = (time: number, trackPlayTime: number): number => {
  const playBarElement: HTMLElement | null = document.querySelector('audi-playbar');
  if (!playBarElement) return 0;

  const playBarWidth = playBarElement.getBoundingClientRect().right - playBarElement.getBoundingClientRect().left;
  const second = time / 1000;
  const pixelPerSecond: number = ZoomController.getCurrentPixelPerSecond();
  const somePixel: number = pixelPerSecond * second;

  return somePixel;
};

const getDifferenceWidth = (startX: number, currentX: number): number => {
  const differenceWidth = currentX - startX;
  return differenceWidth;
};

export { getPerPixel, getDifferenceWidth };
