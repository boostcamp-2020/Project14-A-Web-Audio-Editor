const storeChannel = new(class {
    private channels: Map<string, any>
    private observers: Map<string, Function[]>

    constructor(){
        this.channels = new Map();  //Channel(Key)-Data(Value)
        this.observers = new Map(); //Channel(Key)-Observer[](Value)
    }

    publish(channel, data) {
        this.channels.set(channel, data);
        this.notify(channel);
    }

    subscribe(channel, callback) {
        let callbacks: Function[] | undefined = this.observers.get(channel);
        if(!callbacks) callbacks = []

        let newCallbacks = callbacks.concat(callback);
        this.observers.set(channel, newCallbacks);
    }

    notify(channel) {
        const callbacks: Function[] | undefined = this.observers.get(channel);
        if (!callbacks) return;

        const data = this.channels.get(channel);
        callbacks.forEach((callback) => callback(data));
    }
})();

export{
    storeChannel
}
