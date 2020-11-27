import { EventDataType } from '@types';

interface RootElementType extends HTMLElement{
    registerEventListener: (eventData:EventDataType)=>{};
}

const rootElement: RootElementType | null = document.querySelector('#root');
const registerEventToRoot = (eventData: EventDataType) => rootElement?.registerEventListener(eventData);

export {
    registerEventToRoot
}
