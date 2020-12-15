class EffectProperties {
   getProperty(property:string):number {
    return 0;
   }

   getType(): BiquadFilterType {
    return 'lowpass';
   }
}

export default EffectProperties;