var db = require('../config/connection')
var constants = require('../config/constants')
const bcrpt = require('bcrypt')
const { ObjectId } = require('mongodb')
var objectId = require('mongodb').ObjectId

module.exports = {

    addInvoice:(data)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(constants.BYTES_INVOICE).insertOne(data).then((responce)=>{
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

    getUserWithNumber:(phone, dev, ty, fcm, ti) => {
        return new Promise(async(resolve,reject)=>{
            let user = await db.get().collection(constants.BYTES_USERS).findOne({id:phone})
            resolve(user)

            if (user != null)
            {
                db.get().collection(constants.BYTES_USERS).updateOne(
                    { "_id": user._id }, 
                    { $set: { "f": fcm, "t":ty, "d": dev, "l":ti } }
                )
            }
        })
    },

    getDeliveryAddress:(uid) => {
        return new Promise(async(resolve,reject)=>{
            let empty = []
            let result = await db.get().collection(constants.BYTES_ADDRESS).findOne({_id:ObjectId(uid)})
            if (result != null)
            {
                resolve(result.ad)
            }
            else
            {
                resolve(empty)
            }
            
        })
    },

    deleteDeliveryAddress:(uid, aid) => {
        return new Promise(async(resolve,reject)=>{
            db.get().collection(constants.BYTES_ADDRESS).updateOne(
                { '_id': ObjectId(uid) }, 
                { $pull: { ad: { id: aid } } },
                false, // Upsert
                true, // Multi
            ).then((responce)=>{
                if (responce != null)
                {
                   resolve(responce)
                }
                else
                {
                    reject()
                }
                
           })
        })
    },


    getSingleAddress:(uid, aid) => {
        return new Promise(async(resolve,reject)=>{
            let result = await db.get().collection(constants.BYTES_ADDRESS).findOne({_id: ObjectId(uid)})
            let mm = result.ad.find(id => aid)
            resolve(mm)
        })
    },


    getOrderHistory:(uid, skip, limit) => {
        return new Promise(async(resolve,reject)=>{
            let result = await db.get().collection(constants.BYTES_ORDERS_KEYS).find({u: uid}, {limit:limit, skip:skip}).sort({$natural: -1}).toArray()
            resolve(result)
        })
    },

    addOrder:(data) => {
        return new Promise(async(resolve,reject)=>{

            db.get().collection(constants.BYTES_ORDERS_KEYS).insertOne(data).then((responce)=>{
                if (responce.insertedId != null)
                {
                   resolve(responce.insertedId.toString())
                }
                else
                {
                    reject()
                }
                
           })
        })
    },

    addUser:(data) => {
        return new Promise(async(resolve,reject)=>{
            db.get().collection(constants.BYTES_USERS).insertOne(data).then((responce)=>{
                if (responce.insertedId != null)
                {
                   resolve(responce.insertedId.toString())
                }
                else
                {
                    reject()
                }
                
           })
        })
    },

    addDeliveryAddress:(data, uid) => {
        return new Promise(async(resolve,reject)=>{
            db.get().collection(constants.BYTES_ADDRESS).updateOne(
                { "_id": ObjectId(uid) }, 
                { $push: { "ad": data } },
                { upsert: true } 
               ).then((responce)=>{
                   resolve(responce)
                })
           
        })
    },



    updateAddress:(data, uid) => {
        return new Promise(async(resolve,reject)=>{
            db.get().collection(constants.BYTES_ADDRESS).updateOne(
                { "_id": ObjectId(uid),
            "ad.id": data.id }, 
                { $set: {
                    "ad.$.t": data.t,
                    "ad.$.a": data.a,
                    "ad.$.ty": data.ty,
                    "ad.$.s": data.s,
                    "ad.$.n": data.n,
                    "ad.$.f": data.f,
                    "ad.$.b": data.b,
                    "ad.$.ad": data.ad,
                    "ad.$.p": data.p,
                    "ad.$.se": data.se,
                    "ad.$.la": data.la,
                    "ad.$.ln": data.ln
                }}
                
               ).then((responce)=>{
                   console.log(responce)
                   resolve(responce)
                })
           
        })
    },

    updateUser:(uid, email, name, sur) => {
        return new Promise(async(resolve,reject)=>{
            db.get().collection(constants.BYTES_USERS).updateOne(
                { "_id": ObjectId(uid)}, 
                { $set: {
                    "n": name,
                    "s": sur,
                    "e": email
                }}
                
               ).then((responce)=>{
                   resolve(responce)
                })
           
        })
    },

    updateToken:(uid, fcm, vs, lo) => {
        return new Promise(async(resolve,reject)=>{
            db.get().collection(constants.BYTES_USERS).updateOne(
                { "_id": ObjectId(uid)}, 
                { $set: {
                    "la": lo, // last active
                    "f": fcm,
                    "v": vs
                }}
                
               ).then((responce)=>{
                console.log(responce)
                   resolve(responce)
                })
           
        })
    }


    // checkKey:(superData)=>{
    //     return new Promise(async(resolve, reject)=>{
    //         var responce = {}
    //         let superMan = await db.get().collection(constants.SUPER_COLLECTION).findOne({_id:objectId(superData._id)})
    //         if(superMan)
    //         {
    //             if(superMan.key == "")
    //             {
    //                 let newKey = await bcrpt.hash(superData.key, 10)
    //                 db.get().collection(constants.SUPER_COLLECTION).updateOne({_id:objectId(superData._id)},
    //                 {
    //                     $set:{
    //                         key:newKey
    //                     }
    //                 }).then(()=>{
    //                     responce.user = superMan
    //                     responce.status = true  
    //                     resolve(responce)
    //                 })                    
    //             }
    //             else
    //             {
    //                 bcrpt.compare(superData.key, superMan.key).then((status)=>{
    //                     if(status)
    //                     {
    //                         responce.user = superMan
    //                         responce.status = true  
    //                         resolve(responce)
    //                     }
    //                     else
    //                     {
    //                         responce.user = null
    //                         responce.status = false
    //                         resolve(responce)
    //                     }
    //                 })
    //             }
    //         }
    //         else
    //         {
    //             responce.user = null
    //             responce.status = false
    //             resolve(responce)
    //         }
    //     })
    // }
}