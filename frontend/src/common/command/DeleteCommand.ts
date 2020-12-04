import ICommand from './ICommand'
import { Controller } from '@controllers'
import { TrackSection } from '@model'

export default class DeleteCommand extends ICommand {
  private deleteList: TrackSection[];

  constructor() {
    super();
    this.deleteList = [];
    this.init();
  }

  init() {
    const focusList = Controller.getFocusList();

    if (focusList.length === 0) return;
    this.deleteList = focusList.map(focus => {
      const trackSection = focus.trackSection;
      return new TrackSection({
        id: trackSection.id,
        sourceId: trackSection.sourceId,
        trackId: trackSection.trackId,
        channelStartTime: trackSection.channelStartTime,
        channelEndTime: trackSection.channelEndTime,
        parsedChannelStartTime: trackSection.parsedChannelStartTime,
        parsedChannelEndTime: trackSection.parsedChannelEndTime,
        trackStartTime: trackSection.trackStartTime,
        audioStartTime: trackSection.audioStartTime
      })
    });
  }

  execute() {
    const trackList = Controller.getTrackList();
    Controller.resetFocus();

    this.deleteList.forEach(trackSection => {
      const track = trackList.find(track => trackSection.trackId === track.id);

      if (!track) return;

      const index = track.trackSectionList.findIndex(section => section.id === trackSection.id);

      if (index === -1) return

      Controller.removeSection(track.id, index);
    });
  };

  undo() {
    const trackList = Controller.getTrackList();
    this.deleteList.forEach(trackSection => {
      const track = trackList.find(track => trackSection.trackId === track.id);
      if (!track) return;

      Controller.addTrackSection(track.id, trackSection);
    });
  };
}

