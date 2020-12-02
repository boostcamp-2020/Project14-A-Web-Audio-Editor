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
  PLAYBAR_MULTIPLE = 'PLAYBAR_MULTIPLE'
}

enum EventType {
  click = 'click',
  dblclick = 'dblclick',
  keyup = 'keyup',
  dragover = 'dragover',
  drop = 'drop',
  change = 'change',
  mousemove = 'mousemove'
}

const eventTypes = ['click', 'dblclick', 'keyup', 'dragover', 'drop', 'change', 'mousemove'];

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
