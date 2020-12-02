enum EffectType {
  gain = 'gain',
}

enum EffectTitleType {
  gain = 'Gain',
}

enum EffectContentType {
  gain = '<audi-effect-gain data-percentage="100"></audi-effect-gain>',
}

interface EffectStateType {
  effectType: EffectType;
}

export {
  EffectStateType,
  EffectType,
  EffectTitleType,
  EffectContentType
}
