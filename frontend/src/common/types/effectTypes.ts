enum EffectType {
  gain = 'gain',
  compressor = 'compressor',
  reverb = 'reverb',
  filter = 'filter'
}

enum EffectTitleType {
  gain = 'Gain',
  compressor = 'Compressor',
  reverb = 'Reverb',
  filter = 'Filter'
}

enum EffectContentType {
  gain = '<audi-effect-gain data-percentage="100"></audi-effect-gain>',
  compressor = '<audi-effect-compressor></audi-effect-compressor>',
  reberb = '<audi-effect-reverb></audi-effect-reverb>',
  filter = '<audi-effect-filter></audi-effect-filter>'
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
