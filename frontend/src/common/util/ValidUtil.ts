import { TrackSection } from '@model'
export const checkEnterTrack = (trackSection: TrackSection, trackSectionList: TrackSection[], newTrackStartTime: number, newTrackEndTime: number): boolean => {
  const nearLeftSection = trackSectionList.some(
    (section) => section.id !== trackSection.id && section.trackStartTime <= newTrackStartTime && section.trackStartTime + section.length >= newTrackStartTime
  );
  const nearRightSection = trackSectionList.some(
    (section) => section.id !== trackSection.id && newTrackStartTime <= section.trackStartTime && section.trackStartTime <= newTrackEndTime);

  return nearLeftSection || nearRightSection;
}