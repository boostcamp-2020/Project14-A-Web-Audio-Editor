import { TrackSection } from "@model"

class SectionDragStartData {
  public trackSection: TrackSection;
  public prevCursorTime: number | null;
  public offsetLeft: number;

  constructor({
    trackSection,
    prevCursorTime = null,
    offsetLeft,
  }) {
    this.trackSection = trackSection;;
    this.prevCursorTime = prevCursorTime;
    this.offsetLeft = offsetLeft;
  }
}

export default SectionDragStartData;
