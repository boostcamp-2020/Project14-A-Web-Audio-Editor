import { EffectProperties } from '@model';

class ReverbProperties extends EffectProperties {
    private mix: number;
    private time: number;
    private decay: number;

    constructor({mix=0.8, time=0.5, decay=0.5}) {
        super();
        this.mix = mix;
        this.time = time;
        this.decay = decay;
    }

    getProperty(property:string):number {
        let prop;
        switch(property) {
            case 'mix':
                prop = this.mix;
                break;
            case 'time':
                prop = this.time;
                break;
            case 'decay':
                prop = this.decay;
                break;
            default:
                break;
        }
        return prop;
    }
}

export default ReverbProperties;