import { Command } from '@command';
import { Track, TrackSection } from '@model';
import { StoreChannelType } from '@types';
import { storeChannel } from '@store';
import { CopyUtil, ValidUtil, DragUtil } from '@util';
import { Controller, ZoomController } from '@controllers';

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
    const currentScrollAmount = Controller.getCurrentScrollAmount();
    const currentPixelPerSecond = ZoomController.getCurrentPixelPerSecond()
    const scrorllAmountTime = currentScrollAmount / currentPixelPerSecond;

    const newTrackStartTime = this.movingCursorTime - (this.prevCursorTime - this.trackSection.trackStartTime) + scrorllAmountTime;

    const { startTime, endTime } = DragUtil.getRenewTrackTimes(this.currentTrack, this.trackSection, newTrackStartTime);

    const resultValid = ValidUtil.checkEnterTrack(this.trackSection, this.currentTrack.trackSectionList, startTime, endTime);

    if (resultValid.leftValid || resultValid.rightValid) return;

    const newTrackSection = CopyUtil.copySection(this.trackSection);

    newTrackSection.trackId = this.currentTrack.id;
    newTrackSection.trackStartTime = startTime;

    if (newTrackSection.id !== 0) {
      Controller.removeSection(this.prevTrack.id, sectionIndex);
    }

    Controller.addTrackSection(this.currentTrack.id, newTrackSection);
  }

  undo(): void {
    if (this.prevTrack.id !== this.currentTrack.id) {
      Controller.setTrack(this.prevTrack);
      storeChannel.publish(StoreChannelType.TRACK_SECTION_LIST_CHANNEL, {
        trackId: this.prevTrack.id,
        trackSectionList: this.prevTrack.trackSectionList
      });
    }

    Controller.setTrack(this.currentTrack);
    storeChannel.publish(StoreChannelType.TRACK_SECTION_LIST_CHANNEL, {
      trackId: this.currentTrack.id,
      trackSectionList: this.currentTrack.trackSectionList
    });

    const newTrackList = Controller.getTrackList()
    storeChannel.publish(StoreChannelType.TRACK_CHANNEL, newTrackList);
  }
}

export default MoveCommand;
