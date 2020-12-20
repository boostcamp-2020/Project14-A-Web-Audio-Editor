import { EffectProperties } from '@model';

class FadeInProperties extends EffectProperties {
  private fadeInLength: number;

  constructor({ fadeInLength }) {
    super();
    this.fadeInLength = fadeInLength;
  }

  getProperty(property: string): number {
    let prop;
    switch (property) {
      case 'fadeInLength':
        prop = this.fadeInLength;
        break;
      default:
        break;
    }
    return prop;
  }
}

export default FadeInProperties;