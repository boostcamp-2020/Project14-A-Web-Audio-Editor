import "./TimeInfo.scss";

(() => {
  const TimeInfo = class extends HTMLElement {
    private playTime:string;
    private totalTime:string;
    private cursorTime:string;

    constructor() {
      super();

      this.playTime = "00:00:000";
      this.totalTime = "00:00:000";
      this.cursorTime = "00:00:000";
    }

    connectedCallback() {
      this.render();
    }

    render() {
      this.playTime = "00:00:000";
      this.totalTime = "00:00:000";
      this.cursorTime = "00:00:000";

      this.innerHTML = `
                  <div class="time-info-outer-wrap">
                    <div class="time-info-wrap">
                        <div class="play-time">${this.playTime}</div>
                        <div class="other-time">
                            <div class="total-time">
                                <div>Total</div>    
                                <div>${this.totalTime}</div>
                            </div>
                            <div class="cursor-time">
                                <div>Cursor</div>
                                <div>${this.cursorTime}</div>
                            </div>
                        </div>
                    </div>
                  </div>
              `;
    }
  };
  customElements.define('time-info', TimeInfo);
})();

export {};
