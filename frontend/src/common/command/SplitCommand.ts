import ICommand from './ICommand';
import { Controller } from '@controllers';
import { StoreChannelType } from '@types';
import { storeChannel } from '@store';
import { Track, TrackSection } from '@model';
import { CopyUtil } from '@util';

export class SplitCommand extends ICommand {
  private beforeTrack: Track;
  private cursorPosition: number;
  private trackContainerElement: HTMLDivElement | null;
  private targetTrackSection: TrackSection;

  constructor(cursorPosition: number, currentTrack: Track, targetTrackSection: TrackSection) {
    super();
    this.cursorPosition = cursorPosition;
    this.beforeTrack = currentTrack;
    this.targetTrackSection = targetTrackSection;
    this.trackContainerElement = document.querySelector('.audi-main-audio-track-container');
  }

  execute() {
    if (!this.trackContainerElement) return;

    const maxTrackPlayTime = Controller.getMaxTrackPlayTime();
    const timeOfCursorPosition = this.calculateTimeOfCursorPosition(this.trackContainerElement, maxTrackPlayTime);
    const [leftTrackSection, rightTrackSection] = this.splitTrackSection(timeOfCursorPosition);
    this.updateSplitedSections(leftTrackSection, rightTrackSection);
  }

  calculateTimeOfCursorPosition(trackContainerElement: HTMLDivElement, maxTrackPlayTime: number): number {
    const trackContainerLeftX = trackContainerElement.getBoundingClientRect().left;
    const trackContainerRightX = trackContainerElement.getBoundingClientRect().right;
    const trackContainerWidth = trackContainerRightX - trackContainerLeftX;

    const trackPixelsPerSecond = parseFloat((trackContainerWidth / maxTrackPlayTime).toFixed(2));
    const secondsPerTrackPixel = parseFloat((1 / trackPixelsPerSecond).toFixed(2));
    const cursorOffset = this.cursorPosition - trackContainerLeftX;
    const timeOfCursorPosition = secondsPerTrackPixel * cursorOffset;

    return timeOfCursorPosition;
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

    storeChannel.publish(StoreChannelType.TRACK_CHANNEL, newTrack.trackSectionList);
  }
}
