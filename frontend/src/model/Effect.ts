import { EffectProperties }  from '@model';

class Effect {
    public id: number;
    public name: string;
    public properties: EffectProperties;
    
    constructor({id = 0, name, properties}){
        this.id = id;
        this.name = name;
        this.properties = properties;
    }
}

export default Effect;
