import { Command } from '@command';
import { FocusInfo, StoreChannelType } from '@types';
import { Controller } from '@controllers';
import { TrackSection, Track } from '@model';
import { CopyUtil } from '@util';
import { storeChannel } from '@store';

class ColorChangeCommand extends Command {
    private focusList: FocusInfo[];
    private color: string;
    private copyTrackList: Track[];

    constructor(focusList: FocusInfo[], color: string, trackList: Track[]){
        super();
        this.focusList = focusList;
        this.color = color;
        this.copyTrackList = CopyUtil.copyTrackList(trackList);
    }

    execute(): void {
        try{
            const trackList = Controller.getTrackList();

            this.focusList.forEach((focusInfo: FocusInfo)=>{
                const trackId = focusInfo.trackSection.trackId;
                const sectionId = focusInfo.trackSection.id;
                const focusTrack = trackList.find((track)=>track.id === trackId);
                
                if(focusTrack){
                    const newTrackSectionList = focusTrack?.trackSectionList.map<TrackSection>((trackSection: TrackSection)=>{
                        if(trackSection.id === sectionId){
                            trackSection.sectionColor = this.color;
                            return trackSection;
                        }
                        return trackSection;
                    });

                    if(newTrackSectionList){
                        focusTrack.trackSectionList = newTrackSectionList;
                        Controller.setTrack(focusTrack);
                    }  
                }
            });

            this.publishNewTrackList();
        }catch(e){
            console.log(e);
        }
    }

    undo(): void {
        try{
            this.copyTrackList.forEach((track)=>{
                Controller.setTrack(track);
            });
            this.publishNewTrackList();
        }catch(e){
            console.log(e);
        }
    }

    publishNewTrackList(): void{
        const newTrackList = Controller.getTrackList();
        
        storeChannel.publish(StoreChannelType.TRACK_CHANNEL, newTrackList);
        newTrackList.forEach((track) => {
            storeChannel.publish(StoreChannelType.TRACK_SECTION_LIST_CHANNEL, {
                trackId: track.id,
                trackSectionList: track.trackSectionList
            });
        });
    } 
}

export default ColorChangeCommand;
