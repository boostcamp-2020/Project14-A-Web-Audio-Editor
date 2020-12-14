class GainProperties {
    public gain: Number;

    constructor({gain}){
        this.gain = gain;
    }
}

class CompressorProperties {
    public threshold: Number;
    public knee: Number;
    public ratio: Number;
    public attack: Number;
    public release: Number;

    constructor({threshold=-24, knee=30, ratio=12, attack=0.003, release=0.25}) {
        this.threshold = threshold;
        this.knee = knee;
        this.ratio = ratio;
        this.attack = attack;
        this.release = release;
    }
}

class FilterProperties {
    public type: string;
    public frequency: Number;
    public Q: Number;

    constructor({type, frequency=350, Q=1}) {
        this.type = type;
        this.frequency = frequency;
        this.Q = Q;
    }
}

class ReverbProperties {
    public mix: Number;
    public time: Number;
    public decay: Number;

    constructor({mix=0.8, time=0.5, decay=0.5}) {
        this.mix = mix;
        this.time = time;
        this.decay = decay;
    }
}

export { GainProperties, CompressorProperties, FilterProperties, ReverbProperties };
