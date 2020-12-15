import { EffectProperties } from '@model';

class FilterProperties extends EffectProperties {
    private type: BiquadFilterType;
    private frequency: number;
    private Q: number;

    constructor({type, frequency=350, Q=1}) {
        super();
        this.type = type;
        this.frequency = frequency;
        this.Q = Q;
    }

    getProperty(property:string):number {
        let prop;
        switch(property) {
            case 'frequency':
                prop = this.frequency;
                break;
            case 'Q':
                prop = this.Q;
                break;
            default:
                break;
        }
        return prop;
    }

    getType(): BiquadFilterType {
      return this.type;
    }
}

export default FilterProperties;