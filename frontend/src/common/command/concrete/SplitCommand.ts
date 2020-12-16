import { Command } from '@command';
import { Controller } from '@controllers';
import { StoreChannelType } from '@types';
import { storeChannel } from '@store';
import { Track, TrackSection } from '@model';
import { CopyUtil, TimeUtil } from '@util';

class SplitCommand extends Command {
  private beforeTrack: Track;
  private cursorPosition: number;
  private targetTrackSection: TrackSection;

  constructor(cursorPosition: number, currentTrack: Track, targetTrackSection: TrackSection) {
    super();
    this.cursorPosition = cursorPosition;
    this.beforeTrack = currentTrack;
    this.targetTrackSection = targetTrackSection;
  }

  execute() {
    const trackAreaElement = document.querySelector('.audio-track-area');
    if (!trackAreaElement) return;

    const maxTrackPlayTime = Controller.getMaxTrackPlayTime();
    const trackAreaLeftX = trackAreaElement.getBoundingClientRect().left;
    const trackAreaRightX = trackAreaElement.getBoundingClientRect().right;
    const trackAreaWidth = trackAreaRightX - trackAreaLeftX;

    const timeOfCursorPosition = TimeUtil.calculateTimeOfCursorPosition(trackAreaLeftX, this.cursorPosition);
    const [leftTrackSection, rightTrackSection] = this.splitTrackSection(timeOfCursorPosition);
    this.updateSplitedSections(leftTrackSection, rightTrackSection);
  }

  splitTrackSection(timeOfCursorPosition: number): TrackSection[] {
    const channelSplitOffset = timeOfCursorPosition - this.targetTrackSection.trackStartTime;
    const channelSplitTime = this.targetTrackSection.channelStartTime + channelSplitOffset;

    const leftTrackSection = CopyUtil.copySection(this.targetTrackSection);
    leftTrackSection.id = 0;
    leftTrackSection.channelEndTime = channelSplitTime;
    leftTrackSection.length = leftTrackSection.channelEndTime - leftTrackSection.channelStartTime;

    const rightTrackSection = CopyUtil.copySection(this.targetTrackSection);
    rightTrackSection.id = 0;
    rightTrackSection.channelStartTime = channelSplitTime;
    rightTrackSection.length = rightTrackSection.channelEndTime - rightTrackSection.channelStartTime;
    rightTrackSection.trackStartTime += channelSplitOffset;

    return [leftTrackSection, rightTrackSection];
  }

  updateSplitedSections(leftTrackSection: TrackSection, rightTrackSection: TrackSection): void {
    const targetTrackSectionIndex = this.beforeTrack.trackSectionList.findIndex(trackSection => trackSection.id === this.targetTrackSection.id);
    if (targetTrackSectionIndex === -1) return;

    const trackId = this.beforeTrack.id;
    Controller.removeSection(trackId, targetTrackSectionIndex);
    Controller.addTrackSection(trackId, leftTrackSection);
    Controller.addTrackSection(trackId, rightTrackSection);
  }

  undo(): void {
    const newTrack = CopyUtil.copyTrack(this.beforeTrack);
    Controller.setTrack(newTrack);

    storeChannel.publish(StoreChannelType.TRACK_SECTION_LIST_CHANNEL, {
      trackId: newTrack.id,
      trackSectionList: newTrack.trackSectionList
    });

    const newTrackList = Controller.getTrackList();
    storeChannel.publish(StoreChannelType.TRACK_CHANNEL, newTrackList);
  }
}

export default SplitCommand;
