import { Command } from '@command';
import { Controller } from '@controllers';
import { Track } from '@model';
import { storeChannel } from '@store';
import { StoreChannelType } from '@types';

class DeleteTrackCommand extends Command {
  private trackId: number;
  private removeIdx: number;
  private removedTrack: Track | undefined;

  constructor(trackId: number) {
    super();
    this.trackId = trackId;
    this.removeIdx = 0;
    this.removedTrack;
  }

  execute(): void {
    try {
      const markerElement = <HTMLElement>document.querySelector('.marker');

      if (!markerElement) return;
      markerElement.style.height = `0px`;
      this.removeIdx = this.calculateRemoveIdx();
      this.removedTrack = Controller.removeTrackById(this.trackId);

      this.publishNewTrackList();
    } catch (e) {
      console.log(e);
    }
  }

  calculateRemoveIdx(): number {
    const trackList = Controller.getTrackList();
    return trackList.findIndex((track) => track.id === this.trackId);
  }

  undo(): void {
    try {
      if (!this.removedTrack) return;
      Controller.insertTrack(this.removeIdx, this.removedTrack);

      this.publishNewTrackList();
    } catch (e) {
      console.log(e);
    }
  }

  publishNewTrackList(): void {
    const newTrackList = Controller.getTrackList();

    storeChannel.publish(StoreChannelType.TRACK_CHANNEL, newTrackList);
    storeChannel.publish(StoreChannelType.TRACK_LIST_CHANNEL, newTrackList);
    storeChannel.publish(StoreChannelType.CHANGE_TRACK_CHANNEL, null);
    newTrackList.forEach((track) => {
      storeChannel.publish(StoreChannelType.TRACK_SECTION_LIST_CHANNEL, {
        trackId: track.id,
        trackSectionList: track.trackSectionList
      });
    });

    storeChannel.publish(StoreChannelType.TOTAL_TIME_CHANNEL, newTrackList);
  }
}

export default DeleteTrackCommand;
