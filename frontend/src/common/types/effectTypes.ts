enum EffectType {
  gain = 'gain',
  compressor = 'compressor',
  reverb = 'reverb',
  filter = 'filter',
  fadein = 'fadein',
  fadeout = 'fadeout'
}

enum EffectTitleType {
  gain = 'Gain',
  compressor = 'Compressor',
  reverb = 'Reverb',
  filter = 'Filter',
  fadein = 'Fade In',
  fadeout = 'Fade Out'
}

enum EffectContentType {
  gain = '<audi-effect-gain data-percentage="100"></audi-effect-gain>',
  compressor = '<audi-effect-compressor></audi-effect-compressor>',
  reverb = '<audi-effect-reverb></audi-effect-reverb>',
  filter = '<audi-effect-filter></audi-effect-filter>',
  fadein = '<audi-effect-fade-in></audi-effect-fade-in>',
  fadeout = '<audi-effect-fade-out></audi-effect-fade-out>'
}

interface EffectStateType {
  effectType: EffectType;
}

interface ModifyingEffectInfo {
  id: number,
  trackId: number,
  trackSectionId: number
}

export {
  EffectStateType,
  EffectType,
  EffectTitleType,
  EffectContentType,
  ModifyingEffectInfo
}
