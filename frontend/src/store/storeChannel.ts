import { StoreObserverData, StoreChannelType } from "@types";

class StoreChannel{
    private channels: Map<string, any>
    private observers: Map<string, StoreObserverData[]>

    constructor(){
        this.channels = new Map();
        this.observers = new Map();
    }

    publish(channel: StoreChannelType, data: any): void {
        this.channels.set(channel, data);        
        this.notify(channel);
    }

    subscribe(channel: StoreChannelType, callback: Function, bindObj: Object): void {
        let observerDatas: StoreObserverData[] | undefined = this.observers.get(channel);

        // if(!observerDatas) observerDatas = [{callback, bindObj}];

        if(!observerDatas) { 
            observerDatas = [{callback, bindObj}]
            this.observers.set(channel, observerDatas);
            return;
        };

        const newObserverDatas = observerDatas.concat({callback, bindObj});
        this.observers.set(channel, newObserverDatas);
    }

    notify(channel: StoreChannelType):void {
        const observerDatas: StoreObserverData[] | undefined =  this.observers.get(channel);
        if (!observerDatas) return;
        
        const data = this.channels.get(channel);
        observerDatas.forEach((observerData) => observerData.callback.call(observerData.bindObj,data));
    }
}

const storeChannel = new StoreChannel();

export{
    storeChannel,
    StoreChannel
}
