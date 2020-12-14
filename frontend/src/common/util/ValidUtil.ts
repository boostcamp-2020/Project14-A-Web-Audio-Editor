import { TrackSection } from '@model'
export const checkEnterTrack = (trackSection: TrackSection, trackSectionList: TrackSection[], newTrackStartTime: number, newTrackEndTime: number): { leftValid: boolean, rightValid: boolean } => {
  const nearLeftSection = trackSectionList.some(
    (section) => section.id !== trackSection.id && section.trackStartTime <= newTrackStartTime && newTrackStartTime < section.trackStartTime + section.length);
  const nearRightSection = trackSectionList.some(
    (section) => section.id !== trackSection.id && newTrackStartTime <= section.trackStartTime && section.trackStartTime < newTrackEndTime);

  return { leftValid: nearLeftSection, rightValid: nearRightSection };
}