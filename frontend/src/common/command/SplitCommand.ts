import ICommand from './ICommand';
import { Controller } from '@controllers';
import { StoreChannelType } from '@types';
import { storeChannel } from '@store';
import { Track, TrackSection } from '@model';
import { CopyUtil, TimeUtil } from '@util';

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
    const startX = this.trackContainerElement.getBoundingClientRect().left;
    const endX = this.trackContainerElement.getBoundingClientRect().right;
    const cursorNumberTime = TimeUtil.calculateTimeOfCursorPosition(startX, this.cursorPosition, endX - startX);

    const splitTime = cursorNumberTime - this.targetSection.trackStartTime;
    const leftSection = CopyUtil.copySection(this.targetSection);
    leftSection.id = 0;
    leftSection.channelEndTime = splitTime;
    leftSection.parsedChannelEndTime = splitTime;
    leftSection.length = splitTime;

    const rightSection = CopyUtil.copySection(this.targetSection);
    rightSection.id = 0;
    rightSection.channelStartTime = splitTime;
    rightSection.parsedChannelStartTime = splitTime;
    rightSection.trackStartTime += splitTime;
    rightSection.length -= splitTime;

    const sectionIndex = this.beforeTrack.trackSectionList.findIndex((section) => section.id === this.targetSection.id);

    if (sectionIndex === -1) return;
    const trackId = this.beforeTrack.id;
    Controller.removeSection(trackId, sectionIndex);
    Controller.addTrackSection(trackId, leftSection);
    Controller.addTrackSection(trackId, rightSection);
  }

  calculateTimeOfCursorPosition(trackContainerElement: HTMLDivElement): number{
    const trackContainerLeftX = trackContainerElement.getBoundingClientRect().left;
    const trackContainerRightX = trackContainerElement.getBoundingClientRect().right;
    const trackContainerWidth = trackContainerRightX - trackContainerLeftX;

    const trackPixelsPerSecond = parseFloat((trackContainerWidth / 300).toFixed(2));
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
