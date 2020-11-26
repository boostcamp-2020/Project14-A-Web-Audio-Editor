interface ObserverData{
    callback: Function;
    bindObj: Object;
}

class StoreChannel{
    private channels: Map<string, any>
    private observers: Map<string, ObserverData[]>

    constructor(){
        this.channels = new Map();
        this.observers = new Map();
    }

    publish(channel, data) {
        this.channels.set(channel, data);        
        this.notify(channel);
    }

    subscribe(channel, callback, bindObj) {
        let observerDatas: ObserverData[] | undefined = this.observers.get(channel);

        if(!observerDatas) observerDatas = [{callback, bindObj}];

        const newObserverDatas = observerDatas.concat({callback, bindObj});
        this.observers.set(channel, newObserverDatas);
    }

    notify(channel) {
        const observerDatas: ObserverData[] | undefined =  this.observers.get(channel);
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
