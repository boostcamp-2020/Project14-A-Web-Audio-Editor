import { StateType } from "./storeType";
import { Source } from "../model"
import { StoreChannelType } from "@types"
import { storeChannel } from "@store";

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

        const newSourceList = sourceList.concat(source);
        this.state = {...this.state, sourceList: newSourceList};
        storeChannel.publish(StoreChannelType.SOURCE_LIST_CHANNEL, newSourceList);
    }
})();

export {
    store
}
