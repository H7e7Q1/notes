const fs=require("fs")
const path=require("path")
const parser=require("@babel/parser")
const traverse=require("@babel/traverse").default;
const {transformFromAst}=require("@babel/core")
module.exports=class Webpack{
    constructor(options){
        // console.log(options)
        this.entry=options.entry
        this.output=options.output
        this.modules=[]
    }
    run(){
        const info=this.parse(this.entry)
        // console.log(info )
        //递归处理所有依赖
        this.modules.push(info)
        for (let i = 0; i < this.modules.length; i++) {
            const item = this.modules[i];
            const {dependencies}=item
            if(dependencies){
                for(let j in dependencies){
                    this.modules.push(this.parse(dependencies[j]))
                }
            }
        }
        // console.log(this.modules)
        //修改数据结构 数组转对象
        const obj={}
        this.modules.forEach(ele=>{
            obj[ele.entryFile]={
                dependencies:ele.dependencies,
                code:ele.code
            }
        })
        // console.log(obj)
        //代码生成 文件生成
        this.file(obj)
    }
    //模块内容解析
    parse(entryFile){
        //如何读取模块的内容
        //fs.readFileSync
        const content=fs.readFileSync(entryFile,'utf-8')
        // console.log(content) //入口文件里面的代码
        //拿到内容后分析入口模块内容
        // 1.内容:依赖模块(目的是路径)  怎么拿到路径 babel/parser返回抽象语法树
        const ast =parser.parse(content,{
            sourceType:"module"
        })
        // console.log(ast.program.body[0].source)
         const dependencies={}
        // 1.2只提取import声明的节点,过滤掉表达式这些node ---babel/traverse
        traverse(ast,{
            ImportDeclaration({node}){
                // path.dirname(entryFile)//./src/index.js 取出目录./src
                const newPathName="./"+path.join(path.dirname(entryFile),node.source.value).replace(/\\/,"/")
                // console.log('--------',node.source.value)// ./a.js  ./b.js
                // console.log(newPathName)
                dependencies[node.source.value]=newPathName
            }
        })
        // console.log(dependencies)
        // 2.内容:借助babel/core处理代码 生成代码 片段 
        // transformFromAst
        const {code}=transformFromAst(ast,null,{
            presets:["@babel/preset-env"]
        })
        // console.log(code)
        return {
            entryFile,
            dependencies,
            code
        }
    }
    file(modules){
        const filepath=path.join(this.output.path,this.output.filename)
        // console.log(modules)
        const newModules=JSON.stringify(modules)
        // //生成bundle
        const bundle=`(function(modules){
            function require(module){
                function newRequire(path){
                    return require(modules[module].dependencies[path])
                }
                var exports={};
                (function(exports,require,code){
                    eval(code)
                })(exports,newRequire,modules[module].code)
                return exports;
            }
            require('${this.entry}')
        })(${newModules})`
        fs.writeFileSync(filepath,bundle,"utf-8")
    }
}