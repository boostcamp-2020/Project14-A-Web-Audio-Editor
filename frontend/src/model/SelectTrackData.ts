class SelectTrackData {
  public trackId: number;
  public selectedTime: number;

  constructor({
    trackId,
    selectedTime,
  }) {
    this.trackId = trackId;
    this.selectedTime = selectedTime;
  }
}

export default SelectTrackData;
