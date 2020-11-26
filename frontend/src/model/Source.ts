class Source{
    public id: number;
    public fileName: string;
    public sampleRate: number;
    public length: number;
    public duration: number;
    public numberOfChannels: number;
    public channelData: Float32Array[];
     
    constructor(){
        this.id = 0;
        this.fileName = '';
        this.sampleRate = 0;
        this.length = 0;
        this.duration = 0;
        this.numberOfChannels = 0;
        this.channelData = [];
    }
}

export default Source;
