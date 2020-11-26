class Source{
    public id: number;
    public fileName: string;
    public sampleRate: number;
    public length: number;
    public duration: number;
    public numberOfChannels: number;
    public channelData: Float32Array[];
    public fileSize: number;

    constructor(file: File, audioBuffer: AudioBuffer){
        this.id = 0;
        this.fileName = file.name;
        this.fileSize = file.size;
        this.sampleRate = audioBuffer.sampleRate;
        this.length = audioBuffer.length;
        this.duration = audioBuffer.duration;
        this.numberOfChannels = audioBuffer.numberOfChannels;
        this.channelData = [];
        
        this.setChannelData(audioBuffer);
    }

    setChannelData(audioBuffer: AudioBuffer){
        for(let i = 0; i < this.numberOfChannels; i++){
            this.channelData[i] = audioBuffer.getChannelData(i);
        }
    }
}

export default Source;
