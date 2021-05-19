function defineReactive(obj,key,value){
    Observe(value)
    Object.defineProperty(obj,key,{
        get(){
            console.log('get',value)
            return value
        },
        set(newValue){
            if(newValue===value) return
            Observe(newValue)
            console.log('set',newValue)
            value=newValue
        }
    })
}

function Observe(obj){
    if(obj==null || typeof obj!=='object'){
        return
    }
    Object.keys(obj).forEach(key=>{
        defineReactive(obj,key,obj[key])
    })
}

function set(obj,key,value){
    defineReactive(obj,key,value)

}

let obj={a:'111',b:'222',c:{foo:'333'}}
Observe(obj)
obj.a
obj.a='aaa'
obj.c.foo
obj.c.foo='ccc'
obj.c={foo2:'ccc2'}
obj.c.foo2

