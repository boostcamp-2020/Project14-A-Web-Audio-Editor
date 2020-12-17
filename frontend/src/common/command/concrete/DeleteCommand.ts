import { Command } from '@command';
import { Controller } from '@controllers';
import { TrackSection, Track } from '@model';
import { CopyUtil } from '@util';
import { storeChannel } from '@store';
import { StoreChannelType } from '@types';

class DeleteCommand extends Command {
  private beforeTrackList: Track[];
  private deleteSectionList: TrackSection[];

  constructor() {
    super();
    this.beforeTrackList = [];
    this.deleteSectionList = [];
    this.init();
  }

  init() {
    const focusList = Controller.getFocusList();

    if (focusList.length === 0) return;
    const trackIdSet = new Set<number>();

    this.deleteSectionList = focusList.map((focus) => {
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
    Controller.resetFocus();
    const deleteTrackList = this.beforeTrackList.map((track) => CopyUtil.copyTrack(track));

    this.deleteSectionList.forEach((deleteSection) => {
      const deleteTrack = deleteTrackList.find((track) => deleteSection.trackId === track.id);
      if (!deleteTrack) return;

      const deleteSectionIndex = deleteTrack.trackSectionList.findIndex((section) => section.id === deleteSection.id);
      deleteTrack.trackSectionList.splice(deleteSectionIndex, 1);
    });

    deleteTrackList.forEach((track) => {
      Controller.setTrack(track);
      this.publishChannel(track);
    });
  }

  undo() {
    this.beforeTrackList.forEach((track) => {
      Controller.setTrack(track);
      this.publishChannel(track);
    });
  }

  publishChannel(track) {
    storeChannel.publish(StoreChannelType.TRACK_SECTION_LIST_CHANNEL, {
      trackId: track.id,
      trackSectionList: track.trackSectionList
    });
    const newTrackList = Controller.getTrackList();
    storeChannel.publish(StoreChannelType.TRACK_CHANNEL, newTrackList);
    storeChannel.publish(StoreChannelType.TOTAL_TIME_CHANNEL, newTrackList);
  }
}

export default DeleteCommand;
