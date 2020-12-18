import { Command } from '@command';
import { Controller } from '@controllers';
import { Track } from '@model';
import { storeChannel } from '@store';
import { StoreChannelType } from '@types';

class AddTrackCommand extends Command {
    constructor() {
        super();
    }

    execute() {
        try {
            const newTrack = new Track({ id: 0, trackSectionList: [] });
            Controller.setTrack(newTrack);

            this.publishNewTrackList();
        } catch (e) {
            console.log(e);
        }
    }

    undo() {
        try {
            const markerElement = <HTMLElement>document.querySelector('.marker');

            if (!markerElement) return;
            markerElement.style.height = `0px`;
            Controller.popTrackWithIndex();
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
    }
}

export default AddTrackCommand;
