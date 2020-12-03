import { Source, Track, TrackSection } from '@model';

const copySection = (trackSection: TrackSection): TrackSection => {
  const newTrackSection = new TrackSection({
    sourceId: trackSection.sourceId,
    trackId: trackSection.trackId,
    channelStartTime: trackSection.channelStartTime,
    channelEndTime: trackSection.channelEndTime,
    parsedChannelStartTime: trackSection.parsedChannelStartTime,
    parsedChannelEndTime: trackSection.parsedChannelEndTime,
    trackStartTime: 0,
    audioStartTime: 0
  });

  return newTrackSection;
}

export { copySection }