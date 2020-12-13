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

    let newTrackStartTime = this.movingCursorTime - (this.prevCursorTime - this.trackSection.trackStartTime);

    if (newTrackStartTime < 0) {
      newTrackStartTime = 0;
    }

    let newTrackEndTime = newTrackStartTime + this.trackSection.length;

    let resultValid = ValidUtil.checkEnterTrack(this.trackSection, this.currentTrack.trackSectionList, newTrackStartTime, newTrackEndTime);
    if (resultValid.leftValid && !resultValid.rightValid) {
      const prevSection = DragUtil.getPrevTrackSection(this.currentTrack.id, this.trackSection.id, newTrackStartTime);
      if (prevSection) {
        const prevEndTime = prevSection.trackStartTime + prevSection.length
        if (newTrackStartTime - prevEndTime < prevSection.length / 4) {
          newTrackStartTime = prevEndTime;
          newTrackEndTime = this.trackSection.length;
        }
      }
    } else if (!resultValid.leftValid && resultValid.rightValid) {
      const nextSection = DragUtil.getNextTrackSection(this.currentTrack.id, this.trackSection.id, newTrackStartTime, newTrackEndTime);
      if (nextSection) {
        const nextStartTime = nextSection.trackStartTime;
        if (newTrackEndTime - nextStartTime < nextSection.length / 4) {
          newTrackEndTime = nextStartTime;
          newTrackStartTime = newTrackEndTime - this.trackSection.length;
        }
      }
    }

    resultValid = ValidUtil.checkEnterTrack(this.trackSection, this.currentTrack.trackSectionList, newTrackStartTime, newTrackEndTime);

    if (resultValid.leftValid || resultValid.rightValid) return;

    const currentScrollTime = Controller.getCurrentScrollTime() || 0;

    const newTrackSection = CopyUtil.copySection(this.trackSection);

    newTrackSection.trackId = this.currentTrack.id;
    newTrackSection.trackStartTime = newTrackStartTime + currentScrollTime;

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
