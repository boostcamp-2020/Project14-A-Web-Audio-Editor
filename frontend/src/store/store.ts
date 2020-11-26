import { StateType } from "./storeType";
import { Source } from "../model"

const store = new (class Store{
    private state: StateType;

    constructor(){
        this.state = {
            sourceList:[]
        }
    }

    setSource(source: Source){
        const { sourceList } = this.state;
        source.id = sourceList.length;

        this.state = {...this.state, sourceList: sourceList.concat(source)};
    }
})();

export {
    store
}
