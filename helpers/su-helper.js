var db = require('../config/connection')
var constants = require('../config/constants')
const bcrpt = require('bcrypt')
var objectId = require('mongodb').ObjectId

module.exports = {

    doLogin:(superData)=>{
        return new Promise(async(resolve, reject)=>{
            var responce = {}
            let superMan = await db.get().collection(constants.SUPER_COLLECTION).findOne({id:superData})
            if(superMan)
            {
                responce.user = superMan
                responce.status = true
                resolve(responce)
            }
            else
            {
                responce.user = null
                responce.status = false
                resolve(responce)
            }
        })
        
    },

    addExpense:(data)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(constants.EXPENSES_COLLECTION).insertOne(data).then((responce)=>{
                 if (responce.insertedId != null)
                 {
                    resolve(responce.insertedId)
                 }
                 else
                 {
                     reject()
                 }
                 
            })
        })
    },

    addSalesUser:(data)=>{
        return new Promise(async(resolve,reject)=>{
            let user = await db.get().collection(constants.SALES_USERS).findOne({id:data.id})
            if (user == null)
            {
                delete data.re_pass
                console.log(data.key)
                let newKay = await bcrpt.hash(data.key, 10)
                data.key = newKay
                console.log(data)
                db.get().collection(constants.SALES_USERS).insertOne(data).then((responce)=>{
                    if (responce.insertedId != null)
                    {
                       resolve(1)
                    }
                    else
                    {
                        resolve(0)
                    }
                    
               })
            }
            else {resolve(-1)}
            
        })
    },

    getDefaultSalesUsers:(data)=>{
        return new Promise(async(resolve,reject)=>{
            if (Object.keys(data).length > 0)
            {
                let result = await db.get().collection(constants.SALES_USERS).find({data}).toArray()
            resolve(result)
            }
            else
            {
                let result = await db.get().collection(constants.SALES_USERS).find().toArray()
            resolve(result)
            }
            
        })
    },


    checkKey:(superData)=>{
        return new Promise(async(resolve, reject)=>{
            var responce = {}
            let superMan = await db.get().collection(constants.SUPER_COLLECTION).findOne({_id:objectId(superData._id)})
            if(superMan)
            {
                if(superMan.key == "")
                {
                    let newKey = await bcrpt.hash(superData.key, 10)
                    db.get().collection(constants.SUPER_COLLECTION).updateOne({_id:objectId(superData._id)},
                    {
                        $set:{
                            key:newKey
                        }
                    }).then(()=>{

                        delete superMan.key
                        responce.user = superMan
                        responce.status = true  
                        resolve(responce)
                    })                    
                }
                else
                {
                    bcrpt.compare(superData.key, superMan.key).then((status)=>{
                        if(status)
                        {
                            delete superMan.key
                            responce.user = superMan
                            responce.status = true  
                            resolve(responce)
                        }
                        else
                        {
                            responce.user = null
                            responce.status = false
                            resolve(responce)
                        }
                    })
                }
            }
            else
            {
                responce.user = null
                responce.status = false
                resolve(responce)
            }
        })
    }
}