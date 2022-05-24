var db = require('../config/connection')
var constants = require('../config/constants')
const bcrpt = require('bcrypt')
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

    getUserWithNumber:(phone) => {
        return new Promise(async(resolve,reject)=>{
            let user = await db.get().collection(constants.BYTES_USERS).findOne({id:phone})
            resolve(user)
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