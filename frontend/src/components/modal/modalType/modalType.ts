enum ModalType {
    none = '',
    source = 'source',
    effect = 'effect',
    download = 'download',
}

enum ModalTitleType {
    source = '소스 불러오기',
    effect = '이펙트 목록',
    download = '저장하기',
}

interface ModalContentType {
    source: string;
    effect: string;
    download: string;
}

interface ModalButtonType {
    source: string;
    effect: string;
    download: string;
}

export {
    ModalType,
    ModalTitleType,
    ModalContentType,
    ModalButtonType
}
