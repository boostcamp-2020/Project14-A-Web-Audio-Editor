import { ModalButtonType } from '../modalType/modalType';

const modalButtonContents: ModalButtonType = {
  source: `
    <button class='modal-green-button' event-key='source-upload' type='button'>불러오기</button>
    <button class='modal-close-button' event-key='source-modal-close' type='button'>취소</button>`,
  effect: `<button class='modal-close-button' event-key='modal-close' type='button'>취소</button>`,
  download: `<a class="compress-button" id="download-link"><button class="save-button" type='button' disabled='disabled' event-key="audi-source-download-button">변환</button></a>
    <button class='modal-close-button' event-key='download-modal-close' type='button'>취소</button>`
};

export { modalButtonContents };
