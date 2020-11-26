import { Source } from '@model';
import { store } from "@store";

const addSource = (source: Source): void =>{
    store.setSource(source);
}

export default {
    addSource
}
