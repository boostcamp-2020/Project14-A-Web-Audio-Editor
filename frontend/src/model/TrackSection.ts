// import { EffectList } from '@types';
import { Effect } from '@model';

class TrackSection {
    public id: number;
    public trackId: number;
    public sourceId: number;
    public sectionColor: string;
    public channelStartTime: number;
    public channelEndTime: number;
    public trackStartTime: number;
    public length: number;
    public effectList: Effect[];

    static DEFAULT_SECTION_COLOR = '#2196f3';

    constructor({
        id,
        trackId,
        sourceId,
        channelStartTime,
        channelEndTime,
        trackStartTime,
        effectList = [],
        sectionColor = TrackSection.DEFAULT_SECTION_COLOR,
    }) {
        this.id = id;
        this.trackId = trackId;
        this.sourceId = sourceId;
        this.sectionColor = sectionColor;
        this.channelStartTime = channelStartTime;
        this.channelEndTime = channelEndTime;
        this.trackStartTime = trackStartTime;
        this.length = this.channelEndTime - this.channelStartTime;
        this.effectList = effectList;
    }
}

export default TrackSection;
