enum EventKeyType {
    SOURCE_UPLOAD_LOAD_BTN_CLICK = 'SOURCE_UPLOAD_LOAD_BTN_CLICK',
    SOURCE_UPLOAD_CLOSE_CLOSE_BTN_CLICK = 'SOURCE_UPLOAD_CLOSE_CLOSE_BTN_CLICK',
    SOURCE_UPLOAD_CONTENT_MULTIPLE = 'SOURCE_UPLOAD_CONTENT_MULTIPLE',
    SOURCE_DOWNLOAD_FILE_NAME_KEYUP = 'SOURCE_DOWNLOAD_FILE_NAME_KEYUP',
    SOURCE_DOWNLOAD_SAVE_BTN_CLICK = 'SOURCE_DOWNLOAD_SAVE_BTN_CLICK',
    SOURCE_DOWNLOAD_CLOSE_BTN_CLICK = 'SOURCE_DOWNLOAD_CLOSE_BTN_CLICK',
    SOURCE_DOWNLOAD_EXTENTION_CHANGE = 'SOURCE_DOWNLOAD_EXTENTION_CHANGE',
    EDITOR_MENU_OPEN_UPLOAD_BTN_CLICK = 'EDITOR_MENU_OPEN_UPLOAD_BTN_CLICK',
    EDITOR_MENU_OPEN_DOWNLOAD_BTN_CLICK = 'EDITOR_MENU_OPEN_DOWNLOAD_BTN_CLICK',
    EFFECT_LIST_CLOSE_BTN_CLICK = 'EFFECT_LIST_CLOSE_BTN_CLICK',
    EFFECT_GAIN_INPUT_PERCENTAGE = 'EFFECT_GAIN_INPUT_PERCENTAGE',
    SOURCE_LIST_DRAGSTART = 'SOURCE_LIST_DRAGSTART',
    AUDIO_TRACK_DRAGOVER_DROP = 'AUDIO_TRACK_DRAGOVER_DROP',
    PLAYBAR_MULTIPLE = 'PLAYBAR_MULTIPLE',
    AUDIO_PLAY_OR_PAUSE = 'AUDIO_PLAY_OR_PAUSE',
    AUDIO_STOP = 'AUDIO_STOP',
    AUDIO_REPEAT = 'AUDIO_REPEAT',
    AUDIO_FAST_REWIND = 'AUDIO_FAST_REWIND',
    AUDIO_FAST_FORWARD = 'AUDIO_FAST_FORWARD',
    AUDIO_SKIP_PREV = 'AUDIO_SKIP_PREV',
    AUDIO_SKIP_NEXT = 'AUDIO_SKIP_NEXT'
}

enum EventType {
    click = 'click',
    dblclick = 'dblclick',
    keyup = 'keyup',
    dragstart = 'dragstart',
    dragover = 'dragover',
    dragenter = 'dragenter',
    dragleave = 'dragleave',
    drop = 'drop',
    change = 'change',
    input = 'input',
    mousemove = 'mousemove'
}

const eventTypes = ['click', 'dblclick', 'keyup', 'dragstart', 'dragover', 'dragenter','dragleave','drop', 'change', 'input', 'mousemove'];

interface EventTargetDataType {
  listener: EventListener;
  bindObj: Object;
}

interface EventDataType {
  eventTypes: EventType[];
  eventKey: string;
  listeners: EventListener[];
  bindObj: Object;
}

export { EventKeyType, EventType, eventTypes, EventTargetDataType, EventDataType };
