import {EventType} from './eventType';

interface EventDataType{
    eventTypes: EventType[];
    eventKey: string;
    listeners: EventListener[];
    bindObj: Object;
}

export {
    EventDataType
}
