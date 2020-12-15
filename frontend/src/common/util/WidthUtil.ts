import { ZoomController } from '@controllers';

const getPlayingPixel = (time: number, trackPlayTime: number): number => {
  const playBarElement: HTMLElement | null = document.querySelector('audi-playbar');
  if (!playBarElement) return 0;

  const second = time / 1000;
  const pixelPerSecond: number = ZoomController.getCurrentPixelPerSecond();
  const playingPixel: number = pixelPerSecond * second;

  return playingPixel;
};

const getDifferenceWidth = (startX: number, currentX: number): number => {
  const differenceWidth = currentX - startX;
  return differenceWidth;
};

export { getPlayingPixel, getDifferenceWidth };
