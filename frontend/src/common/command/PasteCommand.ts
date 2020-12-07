import ICommand from './ICommand'
import { Controller } from '@controllers'
import { StoreChannelType } from '@types'
import { storeChannel } from '@store'
import { TrackSection, Track } from '@model'
import { CopyUtil } from '@util'

export class PasteCommand extends ICommand {
  private beforeTrack: Track;
  private addTrackSection: TrackSection;

  constructor(track: Track, trackSection: TrackSection) {
    super();
    this.beforeTrack = track;
    this.addTrackSection = trackSection;
  }

  execute() {
    const newTrack: Track = CopyUtil.copyTrack(this.beforeTrack);
    const newSection: TrackSection = CopyUtil.copySection(this.addTrackSection);

    const endTime: number = newSection.trackStartTime + newSection.length;
    const firstDelayIndex: number = newTrack.trackSectionList.findIndex(section => section.trackStartTime >= newSection.trackStartTime && section.trackStartTime < endTime);

    if (firstDelayIndex !== -1) {
      const deleyTime = endTime - newTrack.trackSectionList[firstDelayIndex].audioStartTime;

      newTrack.trackSectionList = newTrack.trackSectionList.map((cur, idx) => {
        if (idx >= firstDelayIndex) {
          cur.trackStartTime += deleyTime;
        }
        return cur;
      })
      Controller.setTrack(newTrack);
      Controller.addTrackSection(newTrack.id, newSection);
    } else {
      Controller.addTrackSection(this.beforeTrack.id, newSection);
    }

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

