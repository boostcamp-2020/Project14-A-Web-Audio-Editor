const hideEffectList = (): void => {
  const effectListElement = document.querySelector('audi-section-effect-list');
  const sourceListElement = document.querySelector('audi-source-list');
  const effectSettingElement = document.querySelector('audi-section-effect-setting');
  if (!effectListElement || !sourceListElement ||!effectSettingElement) return;

  effectListElement.hide();
  sourceListElement.show();
  effectSettingElement.hide();
};

const showEffectList = (): void => {
  const effectListElement = document.querySelector('audi-section-effect-list');
  const sourceListElement = document.querySelector('audi-source-list');
  if (!effectListElement || !sourceListElement) return;

  effectListElement.show();
  sourceListElement.hide();
};

export { hideEffectList, showEffectList };
