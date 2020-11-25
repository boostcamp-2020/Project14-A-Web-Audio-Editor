enum ModalType {
    none = '',
    source = 'source',
    effect = 'effect'
}

enum ModalTitleType{
    source = '소스 불러오기',
    effect = '이펙트 목록'
}

interface ModalContentType{
    source : string;
    effect : string;
}

interface ModalButtonType{
    source: string;
    effect: string;
  }

export {
    ModalType,
    ModalTitleType,
    ModalContentType,
    ModalButtonType
}
