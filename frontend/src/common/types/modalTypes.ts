enum ModalType {
    upload = 'upload',
    download = 'download',
    effect = 'effect',
}

enum ModalTitleType {
    upload = '소스 불러오기',
    download = '저장하기',
    effect = '이펙트 목록',
}

enum ModalContentType {
    upload = '<audi-source-upload class=modal-component></audi-source-upload>',
    effect =  '<audi-effect-list></audi-effect-list>',
    download = `<audi-source-download class="modal-component"></audi-source-download>`
}

interface ModalStateType {
    modalType: ModalType;
    isHidden: Boolean;
}

export {
    ModalStateType,
    ModalType,
    ModalTitleType,
    ModalContentType
}
