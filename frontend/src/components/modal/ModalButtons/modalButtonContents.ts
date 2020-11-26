import { ModalButtonType } from "../modalType/modalType"

const modalButtonContents: ModalButtonType = {
  source: `
    <button class='modal-green-button' event-key='source-upload' type='button'>불러오기</button>
    <button class='modal-close-button' event-key='modal-close' type='button'>취소</button>`,
  effect: `<button class='modal-close-button' event-key='modal-close' type='button'>취소</button>`
};

export {
  modalButtonContents
}; 
