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
        return new Promise((resolve, reject)=>{
            db.get().collection(constants.SALES_USERS).insertOne(data).then((responce)=>{
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