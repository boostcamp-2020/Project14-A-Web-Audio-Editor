import { store } from '@store';
import { CopyUtil } from '@util';

const getCurrentPixelPerSecond = (): number => {
  const { zoomInfo: { rate, pixelPerSecond } } = store.getState();
  const currentPixelPerSecond = rate * pixelPerSecond;

  return currentPixelPerSecond;
}

const getCurrentPlayTimeInterval = (): number => {
  const { zoomInfo: { rate, playTimeInterval } } = store.getState();
  const currentPlayTimeInterval = playTimeInterval / rate;

  return currentPlayTimeInterval;
}

const setZoomRate = (newRate: number): void => {
  const { zoomInfo } = store.getState();
  const newZoomInfo = { ...zoomInfo, rate: newRate };

  store.setZoomInfo(newZoomInfo);
}

const setPixelPerSecond = (newPixelPerSecond: number): void => {
  const { zoomInfo } = store.getState();
  const newZoomInfo = { ...zoomInfo, pixelPerSecond: newPixelPerSecond };

  store.setZoomInfo(newZoomInfo);
}

export default {
  getCurrentPixelPerSecond,
  getCurrentPlayTimeInterval,
  setZoomRate,
  setPixelPerSecond
}