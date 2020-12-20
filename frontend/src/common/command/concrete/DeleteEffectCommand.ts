import { Command } from '@command';
import { Controller } from '@controllers';
import { StoreChannelType } from '@types';
import { storeChannel } from '@store';
import { Track } from '@model';
import { CopyUtil } from '@util';

class DeleteEffectCommand extends Command {
  private beforeTrackList: Track[];
  private effectId: number;

  constructor(beforeTrackList: Track[], effectId: number) {
    super();
    this.beforeTrackList = beforeTrackList;
    this.effectId = effectId;
  }

  execute() {
    const focusList = Controller.getFocusList();
    const newTrackList = CopyUtil.copyTrackList(this.beforeTrackList);

    focusList.forEach((focus) => {
      const focusedTrackSectionId = focus.trackSection.id;
      newTrackList.forEach((track) => {
        track.trackSectionList.forEach((trackSection) => {
          if (trackSection.id === focusedTrackSectionId) {
            const findIndex = trackSection.effectList.findIndex(effect => effect.id === this.effectId);
            trackSection.effectList.splice(findIndex, 1);
            focus.trackSection = trackSection;
          }
        })
      });
    })
    this.publishChannel(newTrackList);
  }

  undo(): void {
    const newTrackList = CopyUtil.copyTrackList(this.beforeTrackList);
    const focusList = Controller.getFocusList();

    focusList.forEach((focus) => {
      const focusedTrackSectionId = focus.trackSection.id;
      newTrackList.forEach((track) => {
        track.trackSectionList.forEach((trackSection) => {
          if (trackSection.id === focusedTrackSectionId) {
            focus.trackSection = trackSection;
          }
        })
      });
    })

    this.publishChannel(newTrackList);
  }

  publishChannel(trackList: Track[]) {
    const focusList = Controller.getFocusList();

    trackList.forEach(track => {
      Controller.setTrack(track);
      storeChannel.publish(StoreChannelType.TRACK_SECTION_LIST_CHANNEL, {
        trackId: track.id,
        trackSectionList: track.trackSectionList
      });
    })
    storeChannel.publish(StoreChannelType.TRACK_CHANNEL, trackList);
    storeChannel.publish(StoreChannelType.TOTAL_TIME_CHANNEL, trackList);
    storeChannel.publish(StoreChannelType.FOCUS_LIST_CHANNEL, focusList);
  }
}

export default DeleteEffectCommand;
