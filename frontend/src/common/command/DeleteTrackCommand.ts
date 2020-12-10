import { Command } from '@command';
import { Controller } from '@controllers';
import { Track } from '@model';
import { storeChannel } from '@store';
import { StoreChannelType } from '@types';

class DeleteTrackCommand extends Command {
    private removedTrack: Track | undefined;

    constructor(){
        super();
        this.removedTrack;
    }

    execute(){
        try{
            this.removedTrack = Controller.popTrackWithIndex();
            this.publishNewTrackList();
        }catch(e){
            console.log(e);
        }
    }

    undo(){
        try{
            if(!this.removedTrack) return;

            Controller.pushTrackWidthIndex(this.removedTrack);
            this.publishNewTrackList();
        }catch(e){
            console.log(e);
        }
    }

    publishNewTrackList(): void {
        const newTrackList = Controller.getTrackList();
        
        storeChannel.publish(StoreChannelType.TRACK_CHANNEL, newTrackList);
        storeChannel.publish(StoreChannelType.TRACK_LIST_CHANNEL, newTrackList);
        newTrackList.forEach((track) => {
            storeChannel.publish(StoreChannelType.TRACK_SECTION_LIST_CHANNEL, {
                trackId: track.id,
                trackSectionList: track.trackSectionList
            });
        });
    }
}

export default DeleteTrackCommand;
