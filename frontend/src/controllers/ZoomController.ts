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

const getCurrentDefaultTrackTime = (): number => {
  const { zoomInfo: { defaultTrackTime, rate } } = store.getState();
  const currentDefaultTrackTime = defaultTrackTime / rate;

  return currentDefaultTrackTime;
}

const getCurrentRate = (): number => {
  const { zoomInfo: { rate } } = store.getState();
  return rate;
}

const setZoomRate = (newRate: number): void => {
  store.setZoomRate(newRate);
}

const setPixelPerSecond = (newPixelPerSecond: number): void => {
  store.setZoomPixelPerSecond(newPixelPerSecond);
}

export default {
  getCurrentPixelPerSecond,
  getCurrentPlayTimeInterval,
  getCurrentDefaultTrackTime,
  getCurrentRate,
  setZoomRate,
  setPixelPerSecond
}