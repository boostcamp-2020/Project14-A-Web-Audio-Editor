import { EffectProperties } from '@model';

class CompressorProperties extends EffectProperties {
    private threshold: number;
    private knee: number;
    private ratio: number;
    private attack: number;
    private release: number;

    constructor({threshold=-24, knee=30, ratio=12, attack=0.003, release=0.25}) {
        super();
        this.threshold = threshold;
        this.knee = knee;
        this.ratio = ratio;
        this.attack = attack;
        this.release = release;
    }

    getProperty(property:string):number {
        let prop;
        switch(property) {
            case 'threshold':
                prop = this.threshold;
                break;
            case 'knee':
                prop = this.knee;
                break;
            case 'ratio':
                prop = this.ratio;
                break;
            case 'attack':
                prop = this.attack;
                break;
            case 'release':
                prop = this.release;
                break;
            default:
                break;
        }
        return prop;
    } 
}

export default CompressorProperties;