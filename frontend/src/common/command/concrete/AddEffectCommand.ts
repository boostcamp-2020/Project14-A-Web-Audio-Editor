import { Command } from '@command';
import { Controller } from '@controllers';
import { StoreChannelType } from '@types';
import { storeChannel } from '@store';
import { Track, Effect } from '@model';
import { CopyUtil } from '@util';

class AddEffectCommand extends Command {
  private beforeTrackList: Track[];
  private effect: Effect;

  constructor(beforeTrackList: Track[], effect: Effect) {
    super();
    this.beforeTrackList = beforeTrackList;
    this.effect = effect;
  }

  execute() {
    const focusList = Controller.getFocusList();
    const newTrackList = CopyUtil.copyTrackList(this.beforeTrackList);

    focusList.forEach((focus) => {
      const focusedTrackSectionId = focus.trackSection.id;
      newTrackList.forEach((track) => {
        track.trackSectionList.forEach((trackSection) => {
          if (trackSection.id === focusedTrackSectionId) {
            const newEffect = CopyUtil.copyEffect(this.effect);
            trackSection.effectList.push(newEffect);
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
    focusList.forEach(focus => {
      const findIndex = focus.trackSection.effectList.findIndex(effect => effect.id === this.effect.id);
      focus.trackSection.effectList.splice(findIndex, 1);
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

export default AddEffectCommand;
