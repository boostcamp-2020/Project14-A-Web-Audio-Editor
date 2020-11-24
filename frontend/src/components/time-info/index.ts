import "./time-info.scss";

export {};

(() => {
  const TimeInfo = class extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.render();
    }

    render() {
        const playTime = "00:00:000";
        const totalTime = "00:00:000";
        const cursorTime = "00:00:000";
    
      this.innerHTML = `
                  <div class="time-info-outer-wrap">
                    <div class="time-info-wrap">
                        <div class="play-time">${playTime}</div>
                        <div class="other-time">
                            <div class="total-time">
                                <div>Total</div>    
                                <div>${totalTime}</div>
                            </div>
                            <div class="cursor-time">
                                <div>Cursor</div>
                                <div>${cursorTime}</div>
                            </div>
                        </div>
                    </div>
                  </div>
              `;
    }
  };
  customElements.define('time-info', TimeInfo);
})();
