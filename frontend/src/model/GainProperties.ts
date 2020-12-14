import { EffectProperties } from '@model';

class GainProperties extends EffectProperties{
    private gain: number;

    constructor({gain}){
        super();
        this.gain = gain;
    }

    getProperty(property:string):number {
        return this.gain;
    } 
}

export default GainProperties;