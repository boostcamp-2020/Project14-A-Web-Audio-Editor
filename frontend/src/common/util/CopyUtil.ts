import { Source, Track, TrackSection, Effect, EffectProperties, GainProperties, CompressorProperties, FilterProperties, ReverbProperties, FadeInProperties, FadeOutProperties } from '@model';
import { EffectTitleType, EffectType } from '../types/effectTypes';

const copySection = (trackSection: TrackSection): TrackSection => {
  const newTrackSection = new TrackSection({
    id: trackSection.id,
    sourceId: trackSection.sourceId,
    trackId: trackSection.trackId,
    channelStartTime: trackSection.channelStartTime,
    channelEndTime: trackSection.channelEndTime,
    trackStartTime: trackSection.trackStartTime,
    sectionColor: trackSection.sectionColor,
    effectList: trackSection.effectList.map((effect: Effect) => copyEffect(effect))
  });

  return newTrackSection;
};

const copyTrack = (track: Track): Track => {
  const newTrack = new Track({
    id: track.id,
    trackSectionList: track.trackSectionList.map((section) => copySection(section))
  });

  return newTrack;
};


const copyTrackList = (trackList: Track[]): Track[] => {
  const newTrackList = trackList.map((track) => copyTrack(track));
  return newTrackList;
}

const copyEffect = (effect: Effect): Effect => {
  const effectId = effect.id;
  const effectName = effect.name;
  const effectProperties = effect.properties;
  let newEffectProperties: EffectProperties | null = null;

  switch (effectName) {
    case EffectType.gain:
      const gain = effectProperties.getProperty('gain');
      newEffectProperties = new GainProperties({ gain: gain });
      break;
    case EffectType.compressor:
      const threshold = effectProperties.getProperty('threshold');
      const knee = effectProperties.getProperty('knee');
      const ratio = effectProperties.getProperty('ratio');
      const attack = effectProperties.getProperty('attack');
      const release = effectProperties.getProperty('release');
      newEffectProperties = new CompressorProperties({ threshold: threshold, knee: knee, ratio: ratio, attack: attack, release: release });
      break;
    case EffectType.filter:
      const type = effectProperties.getType();
      const frequency = effectProperties.getProperty('frequency');
      const Q = effectProperties.getProperty('Q');
      newEffectProperties = new FilterProperties({ type: type, frequency: frequency, Q: Q });
      break;
    case EffectType.reverb:
      const mix = effectProperties.getProperty('mix');
      const time = effectProperties.getProperty('time');
      const decay = effectProperties.getProperty('decay');
      newEffectProperties = new ReverbProperties({ mix: mix, time: time, decay: decay });
      break;
    case EffectType.fadein:
      const fadeInLength = effectProperties.getProperty('fadeInLength');
      newEffectProperties = new FadeInProperties({ fadeInLength });
      break;
    case EffectType.fadeout:
      const fadeOutLength = effectProperties.getProperty('fadeOutLength');
      newEffectProperties = new FadeOutProperties({ fadeOutLength });
      break;
    default:
      break;
  }

  const newEffect = new Effect({
    id: effectId,
    name: effectName,
    properties: newEffectProperties
  });

  return newEffect;
}

export { copySection, copyTrack, copyTrackList, copyEffect };
