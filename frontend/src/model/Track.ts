import { TrackSection } from "@model"

class AudioTrack{
    public id: number;
    public trackSectionList: TrackSection[];

    constructor({id=0, trackSectionList=[]}: AudioTrack){
        this.id = id;
        this.trackSectionList = trackSectionList;
    }
}

export default AudioTrack;
