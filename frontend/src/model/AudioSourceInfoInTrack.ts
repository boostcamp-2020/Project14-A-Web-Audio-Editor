class AudioSourceInfoInTrack {
    public trackId: number;
    public sectionId: number;
    public bufferSourceNode: AudioBufferSourceNode;

    constructor(trackId:number, sectionId:number, buffer:AudioBufferSourceNode){
        this.trackId = trackId;
        this.sectionId = sectionId;
        this.bufferSourceNode = buffer;
    }
}

export default AudioSourceInfoInTrack;
