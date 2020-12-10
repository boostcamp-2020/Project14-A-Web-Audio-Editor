import { Command } from '@command';
import { Controller } from '@controllers';
import { Track } from '@model';
import { storeChannel } from '@store';
import { StoreChannelType } from '@types';

class DeleteTrackCommand extends Command {
    private trackId : number;
    private removeIdx: number;
    private removedTrack: Track | undefined;

    constructor(trackId: number){
        super();
        this.trackId = trackId;
        this.removeIdx = 0;
        this.removedTrack;
    }

    execute(){
        try{
            const trackList = Controller.getTrackList();
            this.removeIdx = trackList.findIndex((track) => track.id === this.trackId);
            this.removedTrack = Controller.removeTrackById(this.trackId);
            
            this.publishNewTrackList();
        }catch(e){
            console.log(e);
        }
    }

    undo(){
        try{
            if(!this.removedTrack) return;

            Controller.insertTrack(this.removeIdx, this.removedTrack);
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
