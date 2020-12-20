import { EffectProperties } from '@model';

class FadeOutProperties extends EffectProperties {
    private fadeOutLength: number;

    constructor({ fadeOutLength }) {
        super();
        this.fadeOutLength = fadeOutLength;
    }

    getProperty(property: string): number {
        let prop;
        switch (property) {
            case 'fadeOutLength':
                prop = this.fadeOutLength;
                break;
            default:
                break;
        }
        return prop;
    }
}

export default FadeOutProperties;