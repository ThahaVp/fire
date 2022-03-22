var db = require('../config/connection')
var constants = require('../config/constants')
const bcrpt = require('bcrypt')
var objectId = require('mongodb').ObjectId

module.exports = {

    // doLogin:(superData)=>{
    //     return new Promise(async(resolve, reject)=>{
    //         var responce = {}
    //         let superMan = await db.get().collection(constants.SUPER_COLLECTION).findOne({id:superData})
    //         if(superMan)
    //         {
    //             responce.user = superMan
    //             responce.status = true
    //             resolve(responce)
    //         }
    //         else
    //         {
    //             responce.user = null
    //             responce.status = false
    //             resolve(responce)
    //         }
    //     })
        
    // },

    addExpense:(data)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(constants.RV_EXPENSE).insertOne(data).then((responce)=>{
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

    getExpenseOnDate:(date) => {
        return new Promise(async(resolve,reject)=>{
            let products = await db.get().collection(constants.RV_EXPENSE).find({dt:date}).toArray()
            resolve(products)
        })
    },

    editExpense:(expId, newAmount) => {
        return new Promise((resolve, reject)=>{
            
            var query = { _id: "pro_id" }
            db.get().collection(constants.RV_EXPENSE).findOne(query).then((exp)=>{
                var oldAmount = 0
                if (exp.ed == 0)
                {
                    oldAmount = exp.a
                }
                else
                {
                    oldAmount = exp.ed
                }

                // updating expense 
                db.get().collection(constants.RV_EXPENSE).updateOne({_id:objectId(expId)},
                {
                    $set:
                    {
                        a:newAmount,
                        ed:oldAmount
                    }
                }).then((responce)=>{
                    resolve(responce)
                })
            })
        })
    },


    // STOCK

    addStock:(data)=>{
        return new Promise((resolve, reject)=>{
            var myquery = { _id: "pro_id" }
            var newvalues = { $inc: { "sec": 1 } }
            var upsert = { upsert: true }

            // combine these two functions to one

            db.get().collection(constants.COUNTERS).update(myquery,newvalues,upsert,function(err, res){
                db.get().collection(constants.COUNTERS).findOne(myquery).then((secV)=>{
                    data.id = secV.sec
                    db.get().collection(constants.RV_STOCK).insertOne(data).then((responce)=>{
                        if (responce.insertedId != null)
                        {
                            let re = {
                                "mid":responce.insertedId,
                                "id":secV.sec
                            }
                           resolve(re)
                        }
                        else
                        {
                            reject()
                        }
                        
                   })
                })
            })
        })
    },

    getStock:(type) => {
        return new Promise(async(resolve,reject)=>{
            var myquery = { c: type }
            let stock = await db.get().collection(constants.RV_STOCK).find(myquery).toArray()
            resolve(stock)
        })
    },


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