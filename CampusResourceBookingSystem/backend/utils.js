module.exports.promisify = (op) => {
    return function(...args){
        return new Promise((resolve,reject)=>{
            op(...args,(err,res)=>{
                if (err) reject(err);
                else resolve(res);
            })
        })
    };
};

module.exports.joinObject = (obj,inner,outer) => {
    return Object.entries(obj).map(([key,val])=>key+inner+val).join(outer);
}

module.exports.isNumeric = (x) => !isNaN(Number(x));