import { Command } from '@command';
import { Controller } from '@controllers';
import { StoreChannelType } from '@types';
import { storeChannel } from '@store';
import { Track, Effect } from '@model';
import { CopyUtil } from '@util';

class ModifyEffectCommand extends Command {
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
            const newEffectList = trackSection.effectList.map(effect => {
              if (effect.id === this.effect.id) {
                const modifiedEffect = CopyUtil.copyEffect(this.effect);
                return modifiedEffect;
              }
              return effect;
            })
            trackSection.effectList = [...newEffectList];
            focus.trackSection = trackSection;
          }
        })
      });
    })
    this.publishChannel(newTrackList);
  }

  undo(): void {
    const focusList = Controller.getFocusList();
    const newTrackList = CopyUtil.copyTrackList(this.beforeTrackList);

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

export default ModifyEffectCommand;
