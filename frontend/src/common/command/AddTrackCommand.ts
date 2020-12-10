import { Command } from '@command';
import { Controller } from '@controllers';
import { Track } from '@model';
import { storeChannel } from '@store';
import { StoreChannelType } from '@types';

class AddTrackCommand extends Command {
    constructor(){
        super();
    }

    execute(){
        try{
            const newTrack = new Track({id: 0, trackSectionList: []});
            Controller.setTrack(newTrack);

            const newTrackList = Controller.getTrackList();
            this.publishNewTrackList(newTrackList);
        }catch(e){
            console.log(e);
        }
    }

    undo(){
        try{
            const trackList = Controller.getTrackList();
            trackList.pop();

            this.publishNewTrackList(trackList);
        }catch(e){
            console.log(e);
        }
    }

    publishNewTrackList(newTrackList){
        storeChannel.publish(StoreChannelType.TRACK_LIST_CHANNEL, newTrackList);
        newTrackList.forEach((track) => {
            storeChannel.publish(StoreChannelType.TRACK_SECTION_LIST_CHANNEL, {
                trackId: track.id,
                trackSectionList: track.trackSectionList
            });
        });
    }
}

export default AddTrackCommand;
