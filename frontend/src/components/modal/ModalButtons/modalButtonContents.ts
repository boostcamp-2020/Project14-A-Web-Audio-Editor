import { ModalButtonType } from "../modalType/modalType"

const modalButtonContents: ModalButtonType = {
  source: `
    <button class='modal-green-button' type='button'>불러오기</button>
    <button class='modal-close-button' type='button'>취소</button>`,
  effect: `<button class='modal-close-button' type='button'>취소</button>`,
  download: `<a class="compress-button" id="download-link" ><button class="save-button" type='button' disabled='disabled'>변환</button></a>
    <button class='modal-close-button' type='button'>취소</button>`
};

export {
  modalButtonContents
}; 
