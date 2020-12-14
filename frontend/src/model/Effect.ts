//import { EffectProperties }  from '@model';
import { GainProperties, CompressorProperties, ReverbProperties, FilterProperties } from './EffectProperties';

class Effect {
    public id: Number;
    public name: string;
    public properties: GainProperties|CompressorProperties|ReverbProperties|FilterProperties;
    constructor({name, properties}){
        this.id = 0;
        this.name = name;
        this.properties = properties;
    }
}

export default Effect;
