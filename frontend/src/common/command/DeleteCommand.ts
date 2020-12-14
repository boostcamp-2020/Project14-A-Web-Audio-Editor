import { Command } from '@command';
import { Controller } from '@controllers'
import { TrackSection, Track } from '@model'
import { CopyUtil } from '@util'
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

    this.deleteSectionList = focusList.map(focus => {
      const trackSection = focus.trackSection;
      if (!trackIdSet.has(trackSection.id)) {
        const track = Controller.getTrack(trackSection.trackId);
        if (track)
          this.beforeTrackList.push(CopyUtil.copyTrack(track));
      }
      return CopyUtil.copySection(trackSection);
    });
  }

  execute() {
    const trackList = Controller.getTrackList();
    Controller.resetFocus();

    this.deleteSectionList.forEach(trackSection => {
      const track = trackList.find(track => trackSection.trackId === track.id);

      if (!track) return;

      const index = track.trackSectionList.findIndex(section => section.id === trackSection.id);

      if (index === -1) return

      Controller.removeSection(track.id, index);
    });
  };

  undo() {
    this.beforeTrackList.forEach(track => {
      Controller.setTrack(track);
      this.publishChannel(track);
    })

  };

  publishChannel(track) {
    storeChannel.publish(StoreChannelType.TRACK_SECTION_LIST_CHANNEL, {
      trackId: track.id,
      trackSectionList: track.trackSectionList
    });
    storeChannel.publish(StoreChannelType.TRACK_CHANNEL, track.trackSectionList);
  }
}

export default DeleteCommand;
