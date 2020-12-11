import { EffectList } from '@types';

class TrackSection {
    public id: number;
    public trackId: number;
    public sourceId: number;
    public channelStartTime: number;
    public channelEndTime: number;
    public trackStartTime: number;
    public length: number;
    public effectList: object[];

    constructor({
        id,
        trackId,
        sourceId,
        channelStartTime,
        channelEndTime,
        trackStartTime,
        effectList = []
    }) {
        this.id = id;
        this.trackId = trackId;
        this.sourceId = sourceId;
        this.channelStartTime = channelStartTime;
        this.channelEndTime = channelEndTime;
        this.trackStartTime = trackStartTime;
        this.length = this.channelEndTime - this.channelStartTime;
        this.effectList = effectList;
    }
}

export default TrackSection;
