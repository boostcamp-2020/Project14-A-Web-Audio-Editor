enum EffectType {
  gain = 'gain',
}

enum EffectTitleType {
  gain = 'Gain',
}

enum EffectContentType {
  gain = '<audi-effect-gain></audi-effect-gain>',
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
