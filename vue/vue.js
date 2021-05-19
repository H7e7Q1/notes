class Observe{
    constructor(data){
        this.observe(data)
    }
    observe(obj){
        if(obj==null || typeof obj!=='object'){
            return
        }
        Object.keys(obj).forEach(key=>{
            this.defineReactive(obj,key,obj[key])
        })
    }
    defineReactive(obj,key,value){
        this.observe(value)
        const dep=new Dep()
        Object.defineProperty(obj,key,{
            get(){
                console.log('get',value)
                // 依赖收集: 把watcher和dep关联
                // 希望Watcher实例化时，访问一下对应key，同时把这个实例设置到Dep.target上面
                Dep.target && dep.addDep(Dep.target)

                return value
            },
            set:(newValue)=>{
                if(value===newValue){
                    return
                }
                console.log('set',newValue)
                this.observe(newValue)
                dep.notify()
                value=newValue
            }
        })
    }
}

class Dep{
    constructor(){
        this.deps=[]
    }
    addDep(weatch){
        this.deps.push(weatch)
    }
    notify(){
        this.deps.forEach(weatch=>{
            weatch.update()
        })
    }
}

class Weatch{
    constructor(vm,key,updateFn){
        this.vm=vm
        this.key=key
        this.updateFn=updateFn

        Dep.target=this
        this.oldValue=vm[key]
        Dep.target=null
    }
    update(){
        if(this.vm[this.key]!==this.oldValue){
            this.updateFn.call(this.vm,this.vm[this.key])
        }
    }

}

class Compile{
    constructor(vm,el){
        this.vm=vm
        this.el=document.querySelector(el)  
        if(this.el){
            // this.compile(this.el)
            
            // 优化
            const fragment = this.compileFragment(this.el);
            this.compile(fragment);
            this.el.appendChild(fragment);
        }
    }
    compileFragment(el) {
        const f = document.createDocumentFragment();
        let firstChild;
        while(firstChild = el.firstChild) {
          f.appendChild(firstChild);
        }
        return f;
      }
    compile(el){
        //遍历子节点
        Array.from(el.childNodes).forEach(node=>{
            // 判断节点类型
            // 1.判断文本类型
            if(this.isTextNode(node)){
                //获取data变量 RegExp.$1
                this.compileText(node)
            }else if(this.isElement(node)){
                this.compileElement(node)
            }

            if (node.childNodes) {
                this.compile(node)
            }
        })

    }
    isTextNode(node){
        return node.nodeType===3 && /\{\{(.*)\}\}/.test(node.textContent)
    }
    compileText(node){
        this.update(node,RegExp.$1,'text')
    }
    isElement(node){
        return node.nodeType===1
    }
    compileElement(node){
       // attrs:   {name: 'v-html', value: 'count'}
        const attrs=node.attributes
        Array.from(attrs).forEach(attr=>{
            //attrname v-html v-text @
            const attrname=attr.name
            //attrValue count
            const attrValue=attr.value
            if(this.isDirector(attrname)){
                const dir=attrname.substring(2)
                this[dir]&&this[dir](node,attrValue,dir)
            }
            if(this.isEventName(attrname)){
                const [, eventName] = attrname.split('@');
                this.onEvent(this.vm,node,eventName,attrValue)
            }
        })
    }
    isDirector(name) {
        return name.startsWith('v-');
      }
    isEventName(name) {
        return name.startsWith('@');
    }
    //事件委托
    onEvent(vm,node,eventDir,eventName){
        const fn=vm.options.methods[eventName]
        node.addEventListener(eventDir,fn.bind(vm))
    }
    html(node,attrValue,dir){
        this.update(node,attrValue,dir)

    }
    text(node,attrValue,dir){
        this.update(node,attrValue,dir)

    }
    model(node,attrValue,dir){
        this.update(node,attrValue,dir)
        node.addEventListener('input',e=>{
            this.vm[attrValue]=e.target.value
        })
    }
    // dir:要做的指令名称
    update(node,key,dir){
        let fn=this[dir+'Updater']
        fn&&fn(node,this.vm[key])
       new Weatch(this.vm,key,value=>{
          fn&&fn(node,value)
       })
    }
    textUpdater(node,val){
        node.textContent=val
    }
    htmlUpdater(node, val) {
        node.innerHTML = val
    }
    modelUpdater(node,val){
        node.value=val
    }
}

class Vue{
    constructor(options){
        this.options=options
        this.el=options.el
        this.data=options.data
        new Observe(this.data)
        this.proxy(this)
        new Compile(this,this.el)
    }
    proxy(vm){
        Object.keys(vm.data).forEach(key=>{
            Object.defineProperty(vm,key,{
                get(){
                    return vm.data[key]
                },
                set(newValue){
                    vm.data[key]=newValue
                }
            })
        })
    }
}