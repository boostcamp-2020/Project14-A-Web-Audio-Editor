import { EffectProperties }  from '@model';

class Effect {
    public id: number;
    public trackId: number;
    public trackSectionId: number;
    public name: string;
    public properties: EffectProperties;
    
    constructor({id = 0, trackId = 0, trackSectionId = 0, name, properties}){
        this.id = id;
        this.trackId = trackId;
        this.trackSectionId = trackSectionId;
        this.name = name;
        this.properties = properties;
    }
}

export default Effect;
