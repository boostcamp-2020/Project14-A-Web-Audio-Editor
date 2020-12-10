import { TrackSection } from "@model"

class SectionDragStartData {
  public trackSection: TrackSection;
  public prevCursorTime: number;
  public offsetLeft: number;

  constructor(trackSection: TrackSection, prevCursorTime: number, offsetLeft: number) {
    this.trackSection = trackSection;;
    this.prevCursorTime = prevCursorTime;
    this.offsetLeft = offsetLeft;
  }
}

export default SectionDragStartData;
