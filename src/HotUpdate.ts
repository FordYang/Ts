const moduleCache:{[name:string]:any[]} = {};

export function hotUpdate(params:string[]):void
{
    if (params && params.length > 0)
    {
        for (let modulename of params)
        {
            try
            {
                require.resolve(modulename);
            }
            catch
            {
                console.log("更新模型错误：", modulename);
                return;
            }
        }

        let moduleName:string = "";

        for (let i:number = 0; i < params.length; i++)
        {
            moduleName = params[i];
            let codepath:string = require.resolve(moduleName);
        
            if (require.cache[codepath])
            {
                let oldObj = require(moduleName);
                delete require.cache[codepath];
                let newObj = require(moduleName);

                if (moduleCache[codepath])
                {
                    let oldObjList = moduleCache[codepath];
                    oldObjList.push(oldObj);
                }
                else 
                {
                    moduleCache[codepath] = [oldObj];
                }

                copyNewFunc(oldObj, newObj);

                let oldObjList = moduleCache[codepath];
                for (let tmpObj of oldObjList)
                {
                    copyOldFunc(tmpObj, newObj);
                }
                // require.cache[codepath]!.exports = oldObj;
            }
        }

        console.log("热更新完成：", params);
    }
}

function copyNewFunc(oldFunc:any, newFunc:any):void
{
    let tempT:string;
    let keys = Object.keys(oldFunc);
    for (let key of keys)
    {
        tempT = typeof oldFunc[key];
        if (tempT === 'function')
        {
            copyNewFunc(oldFunc[key], newFunc[key]);
        }
        else 
        {
            newFunc[key] = oldFunc[key];
        }
    }
}

function copyOldFunc(oldFunc:any, newFunc:any):void
{
    let tempT:string;
    let tempOldF:Function;
    let tempNewF:Function;
    let keys = Object.keys(oldFunc);
    for (let key of keys)
    {
        tempT = typeof oldFunc[key];
        if (tempT === 'function')
        {
            tempOldF = oldFunc[key];
            tempNewF = newFunc[key];
            
            if (tempOldF && tempNewF)
            {
                if (tempOldF.prototype)
                {
                    let oldProto:{[key:string]:PropertyDescriptor} = Object.getOwnPropertyDescriptors(tempOldF.prototype);

                    let tempKeys = Object.getOwnPropertyNames(tempOldF.prototype);
                    for (let tempKey of tempKeys)
                    {
                        if (oldProto[tempKey]?.writable)
                        {
                            tempOldF.prototype[tempKey] = tempNewF.prototype[tempKey];
                        }
                    }
                }
            }

            copyOldFunc(oldFunc[key], newFunc[key]);
        }
    }
}