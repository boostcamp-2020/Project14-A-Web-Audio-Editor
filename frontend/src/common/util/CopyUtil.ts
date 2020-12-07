import { Source, Track, TrackSection } from '@model';

const copySection = (trackSection: TrackSection): TrackSection => {
  const newTrackSection = new TrackSection({
    id: trackSection.id,
    sourceId: trackSection.sourceId,
    trackId: trackSection.trackId,
    channelStartTime: trackSection.channelStartTime,
    channelEndTime: trackSection.channelEndTime,
    parsedChannelStartTime: trackSection.parsedChannelStartTime,
    parsedChannelEndTime: trackSection.parsedChannelEndTime,
    trackStartTime: trackSection.trackStartTime,
    // effectList: trackSection.effectList,    // Effect 기능 구현시 추가
    audioStartTime: trackSection.audioStartTime
  });

  return newTrackSection;
}

const copyTrack = (track: Track): Track => {
  const newTrack = new Track({
    id: track.id,
    trackSectionList: track.trackSectionList.map(section => copySection(section))
  });

  return newTrack;
}

export { copySection, copyTrack }