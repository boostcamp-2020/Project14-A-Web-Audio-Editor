import { Command } from '@command';
import { Track, TrackSection } from '@model';
import { StoreChannelType } from '@types';
import { storeChannel } from '@store';
import { CopyUtil, ValidUtil, DragUtil } from '@util';
import { Controller } from '@controllers';

class MoveCommand extends Command {
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

    const newTrackStartTime = this.movingCursorTime - (this.prevCursorTime - this.trackSection.trackStartTime);

    const { startTime, endTime } = DragUtil.getRenewTrackTimes(this.currentTrack, this.trackSection, newTrackStartTime);

    const resultValid = ValidUtil.checkEnterTrack(this.trackSection, this.currentTrack.trackSectionList, startTime, endTime);

    if (resultValid.leftValid || resultValid.rightValid) return;

    const currentScrollTime = Controller.getCurrentScrollTime() || 0;

    const newTrackSection = CopyUtil.copySection(this.trackSection);

    newTrackSection.trackId = this.currentTrack.id;
    newTrackSection.trackStartTime = startTime + currentScrollTime;

    if (newTrackSection.id !== 0) {
      Controller.removeSection(this.prevTrack.id, sectionIndex);
    }

    Controller.addTrackSection(this.currentTrack.id, newTrackSection);
  }

  undo(): void {
    Controller.setTrack(this.prevTrack);
    Controller.setTrack(this.currentTrack);

    if (this.prevTrack.id !== this.currentTrack.id) {
      storeChannel.publish(StoreChannelType.TRACK_SECTION_LIST_CHANNEL, {
        trackId: this.prevTrack.id,
        trackSectionList: this.prevTrack.trackSectionList
      });
      storeChannel.publish(StoreChannelType.TRACK_CHANNEL, this.prevTrack.trackSectionList);
    }

    storeChannel.publish(StoreChannelType.TRACK_SECTION_LIST_CHANNEL, {
      trackId: this.currentTrack.id,
      trackSectionList: this.currentTrack.trackSectionList
    });
    storeChannel.publish(StoreChannelType.TRACK_CHANNEL, this.currentTrack.trackSectionList);
  }
}

export default MoveCommand;
