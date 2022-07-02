var db = require('../config/connection')
var constants = require('../config/constants')
const bcrpt = require('bcrypt')
var objectId = require('mongodb').ObjectId

module.exports = {

    doLogin:(superData)=>{
        return new Promise(async(resolve, reject)=>{
            var responce = {}
            let superMan = await db.get().collection(constants.SALES_USERS).findOne({id:superData})
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

    

    addStore:(data, others)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(constants.STORE_COLLECTION).insertOne(data).then((responce)=>{
                 if (responce.insertedId != null)
                 {
                    others._id = objectId(responce.insertedId)
                    db.get().collection(constants.STORE_ADMIN_COLLECTION).insertOne(others).then((res)=>{
                        resolve({id: responce.insertedId, status: 1})
                   })
                 }
                 else
                 {
                    resolve({id: "", status: 0})
                 }
                 
            })
        })
    },

    addOrderBilling:(data)=>{
        return new Promise((resolve, reject)=>{

            // updating store
            db.get().collection(constants.STORE_COLLECTION).updateOne({_id:objectId(data._id)},
            {
                $set:
                {
                    ra: data.ra,
                    mo: data.mo
                }
            }).then((responce)=>{
                resolve(responce.modifiedCount)
            })
        })
    },

    checkKey:(data)=>{
        return new Promise(async(resolve, reject)=>{
            var responce = {}
            let salesMan = await db.get().collection(constants.SALES_USERS).findOne({_id:objectId(data._id)})
            if(salesMan)
            {
                    bcrpt.compare(data.key, salesMan.key).then((status)=>{
                        if(status)
                        {
                            responce.user = salesMan
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
            else
            {
                responce.user = null
                responce.status = false
                resolve(responce)
            }
        })
    },


    ///// DOCTOR //////

    addService:(data, others)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(constants.TOKEN_SERVICE_COLLECTION).insertOne(data).then((responce)=>{
                 if (responce.insertedId != null)
                 {
                    others._id = objectId(responce.insertedId)
                    db.get().collection(constants.TOKEN_SERVICE_ADMIN_COLLECTION).insertOne(others).then((res)=>{
                        resolve({id: responce.insertedId, status: 1})
                   })
                 }
                 else
                 {
                    resolve({id: "", status: 0})
                 }
                 
            })
        })
    },
}