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