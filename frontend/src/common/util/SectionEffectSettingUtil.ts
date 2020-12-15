//취소
  const hideEffectSetting = (): void => {
    const effectSettingElement = document.querySelector('audi-section-effect-setting');
    const effectListElement = document.querySelector('audi-section-effect-list');
    // const sourceListElement = document.querySelector('audi-source-list');
    if (!effectListElement || !effectSettingElement) return;
  
    effectListElement.show();
    effectSettingElement.hide();
    // sourceListElement.show();
  };
  
  const showEffectSetting = (effectType:string): void => {
    const effectSettingElement = document.querySelector('audi-section-effect-setting');
    const effectListElement = document.querySelector('audi-section-effect-list');
    const sourceListElement = document.querySelector('audi-source-list');

    console.log(effectSettingElement, effectListElement, sourceListElement);

    if (!effectListElement || !sourceListElement ||!effectSettingElement) return;

    effectSettingElement.show(effectType);
    effectListElement.hide();
    sourceListElement.hide();
  };
  
  export { hideEffectSetting, showEffectSetting };
  