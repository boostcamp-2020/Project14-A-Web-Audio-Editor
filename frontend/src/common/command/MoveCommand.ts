import ICommand from './ICommand';
import { Track, TrackSection } from '@model';
import { StoreChannelType } from '@types';
import { storeChannel } from '@store';
import { CopyUtil, ValidUtil } from '@util';
import { Controller } from '@controllers';

export class MoveCommand extends ICommand {
  private prevTrack: Track;
  private currentTrack: Track;
  private trackSection: TrackSection;
  private movingCursorTime: number;
  private prevCursorTime: number;

  constructor(prevTrack: Track, currentTrack: Track, trackSection: TrackSection, movingCursorTime: number, prevCursorTime: number) {
    super();
    this.prevTrack = prevTrack;
    this.currentTrack = currentTrack;
    this.trackSection = trackSection;
    this.movingCursorTime = movingCursorTime;
    this.prevCursorTime = prevCursorTime;
  }

  execute(): void {
    const sectionIndex = this.prevTrack.trackSectionList.findIndex((section) => section.id === this.trackSection.id);

    if (sectionIndex === -1) return;

    let newTrackStartTime = this.movingCursorTime - (this.prevCursorTime - this.trackSection.trackStartTime);
    const newTrackEndTime = newTrackStartTime + this.trackSection.length;

    if (ValidUtil.checkEnterTrack(this.trackSection, this.currentTrack.trackSectionList, newTrackStartTime, newTrackEndTime)) return;

    if (newTrackStartTime < 0) {
      newTrackStartTime = 0;
    }

    const newTrackSection = CopyUtil.copySection(this.trackSection);
    newTrackSection.trackId = this.currentTrack.id;
    newTrackSection.trackStartTime = newTrackStartTime;
    newTrackSection.audioStartTime = newTrackStartTime;

    Controller.removeSection(this.prevTrack.id, sectionIndex);
    Controller.addTrackSection(this.currentTrack.id, newTrackSection);
  }

  undo(): void {
    Controller.setTrack(this.prevTrack);
    Controller.setTrack(this.currentTrack);

    storeChannel.publish(StoreChannelType.TRACK_SECTION_LIST_CHANNEL, {
      trackId: this.prevTrack.id,
      trackSectionList: this.prevTrack.trackSectionList
    });

    storeChannel.publish(StoreChannelType.TRACK_SECTION_LIST_CHANNEL, {
      trackId: this.currentTrack.id,
      trackSectionList: this.currentTrack.trackSectionList
    });

  }


}
