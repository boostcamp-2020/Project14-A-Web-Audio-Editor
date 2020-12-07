import ICommand from './ICommand'
import { Controller } from '@controllers'
import { StoreChannelType } from '@types'
import { storeChannel } from '@store'
import { Track, TrackSection } from '@model'
import { CopyUtil, PlayBarUtil } from '@util'

export class SplitCommand extends ICommand {
  private beforeTrack: Track;
  private cursorPosition: number;
  private trackContainerElement: HTMLElement | null;
  private targetSection: TrackSection;

  constructor(cursorPosition: number, currentTrack: Track, targetSection: TrackSection) {
    super();
    this.cursorPosition = cursorPosition;
    this.beforeTrack = currentTrack;
    this.targetSection = targetSection;
    this.trackContainerElement = document.querySelector('.audi-main-audio-track-container');
  }

  execute() {
    if (!this.trackContainerElement) return;
    const startX = this.trackContainerElement.getBoundingClientRect().left;
    const endX = this.trackContainerElement.getBoundingClientRect().right;
    const [minute, second, milsecond, location, totalCursorTime] = PlayBarUtil.getCursorPosition(startX, this.cursorPosition, endX - startX);

    const splitTime = totalCursorTime - this.targetSection.trackStartTime;
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

    const sectionIndex = this.beforeTrack.trackSectionList.findIndex(section => section.id === this.targetSection.id);

    if (sectionIndex === -1) return;
    const trackId = this.beforeTrack.id;
    Controller.removeSection(trackId, sectionIndex);
    Controller.addTrackSection(trackId, leftSection);
    Controller.addTrackSection(trackId, rightSection);
  };

  undo() {
    const newTrack = CopyUtil.copyTrack(this.beforeTrack);
    Controller.setTrack(newTrack);

    storeChannel.publish(StoreChannelType.TRACK_SECTION_LIST_CHANNEL, {
      trackId: newTrack.id,
      trackSectionList: newTrack.trackSectionList
    });

    storeChannel.publish(StoreChannelType.TRACK_CHANNEL, newTrack.trackSectionList);
  };
}


