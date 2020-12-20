import { Command } from '@command';
import { Controller } from '@controllers';
import { EffectType, StoreChannelType } from '@types';
import { storeChannel } from '@store';
import { Track, Effect, TrackSection } from '@model';
import { CopyUtil, EffectUtil } from '@util';

class AddEffectCommand extends Command {
  private beforeTrackList: Track[];
  private addEffectSectionList: TrackSection[];
  private effect: Effect;

  constructor(beforeTrackList: Track[], addEffectSectionList: TrackSection[], effect: Effect) {
    super();
    this.beforeTrackList = beforeTrackList;
    this.addEffectSectionList = addEffectSectionList;
    this.effect = effect;
  }

  init() {
    const focusList = Controller.getFocusList();

    if (focusList.length === 0) return;
    const trackIdSet = new Set<number>();

    this.addEffectSectionList = focusList.map((focus) => {
      const trackSection = focus.trackSection;
      if (!trackIdSet.has(trackSection.trackId)) {
        const track = Controller.getTrack(trackSection.trackId);
        if (track) this.beforeTrackList.push(CopyUtil.copyTrack(track));
        trackIdSet.add(trackSection.trackId);
      }
      return CopyUtil.copySection(trackSection);
    });
  }


  execute() {
    const addEffectTrackList = this.beforeTrackList.map(track => CopyUtil.copyTrack(track));
    const focusList = Controller.getFocusList();
    this.addEffectSectionList.forEach((addEffectSection) => {
      const targetTrack = addEffectTrackList.find(track => addEffectSection.trackId === track.id);
      targetTrack?.trackSectionList.forEach(section => {
        if (section.id === addEffectSection.id) {
          const newEffect = CopyUtil.copyEffect(this.effect);
          section.effectList.push(newEffect);
        }
        focusList.forEach(focus => {
          if (focus.trackSection.id === section.id) {
            focus.trackSection = section;
          }
        })
      })
    })
    this.publishChannel(addEffectTrackList);

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
    const newTrackList = Controller.getTrackList();
    storeChannel.publish(StoreChannelType.TRACK_CHANNEL, newTrackList);
    storeChannel.publish(StoreChannelType.TOTAL_TIME_CHANNEL, newTrackList);
    storeChannel.publish(StoreChannelType.FOCUS_LIST_CHANNEL, focusList);
  }
}

export default AddEffectCommand;
