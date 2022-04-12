var db = require('../config/connection')
var constants = require('../config/constants')
const bcrpt = require('bcrypt')
const async = require('hbs/lib/async')
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
                            data._id = responce.insertedId.toString()
                            data.id = secV.sec
                           resolve(data)
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

    updateStock:(data) => {
        return new Promise((resolve, reject)=>{
            
            // updating stock
            db.get().collection(constants.RV_STOCK).updateOne({_id:objectId(data._id)},
            {
                $set:
                {
                    q: data.q,
                    t: data.t,
                    rp: data.rp,
                    p: data.p,
                }
            }).then((responce)=>{
                resolve(responce.modifiedCount)
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

    getSale:(data) => {
        return new Promise(async(resolve,reject)=>{
            var myquery = { d: data }
            let stock = await db.get().collection(constants.RV_SALE).find(myquery).toArray()
            resolve(stock)
        })
    },

    makeSale:(data)=>{
        return new Promise(async(resolve, reject)=>{

            var idArray = []
            const jsonArray = data.json
            for (var i=0; i<jsonArray.length; i++)
            {
                idArray.push(objectId(jsonArray[i]._id))
            }

            var myquery = {_id: {$in: idArray}}            
            let stock = await db.get().collection(constants.RV_STOCK).find(myquery, { projection: { q: 1 , id: 1} }).toArray()
            
            if (stock != null && stock.length == idArray.length)
            {
                var error = false;
                var map = {}
                
                for (var i=0; i<jsonArray.length; i++)
                {
                    map[jsonArray[i]._id.toString()] = jsonArray[i].qty
                }

                for (var i=0;i<stock.length;i++)
                {
                    const qtyFromJson = map[stock[i]._id.toString()]
                    if (stock[i].q < qtyFromJson)
                    {
                        error = true
                        break
                    }
                }

                if (!error)
                {
                    var saleArray = []
                    var newQtyArray = []
                    var subTotal = 0
                    for (var i=0; i<jsonArray.length; i++)
                    {
                        var totalA = jsonArray[i].qty * jsonArray[i].pr
                        subTotal += totalA
                        var obj = {"q": jsonArray[i].qty, "qb" : stock[i].q, "p":jsonArray[i].pr
                        ,"_id": stock[i]._id, "id": stock[i].id, "t": totalA}
                        saleArray.push(obj)

                        var newQty = stock[i].q - jsonArray[i].qty
                        var xx = {"_id": stock[i]._id, "q":newQty}
                        newQtyArray.push(xx)
                    }

                    var finalSale = 
                    {
                        t: data.ti,
                        d: data.dt,
                        s: saleArray,
                        cu: data.cu,
                        cc: data.cc,
                        ad: data.ad,
                        ta: subTotal
                    }


                    db.get().collection(constants.RV_SALE).insertOne(finalSale).then((saleResp)=>{
                        if (saleResp != null && saleResp.acknowledged)
                        {
                             // updating 
                            for (var i=0; i<newQtyArray.length; i++)
                            {
                                db.get().collection(constants.RV_STOCK).updateOne({"_id":newQtyArray[i]._id},
                                {
                                    $set:
                                    {
                                        q:newQtyArray[i].q,
                                        lo : saleResp.insertedId
                                    }
                                })
                            }

                            resolve({status: 1, oid:saleResp.insertedId})
                        }
                        else
                        {resolve({status : 0,oid : 0,})}
                    })
                }
                else
                {resolve({status : -1,oid : 0,})} // no qty
            }
            else
            {resolve({status : -2,oid : 0,})} // no item found
            

            // db.get().collection(constants.RV_STOCK).find(myquery, { projection: { q: 1, _id:0 } }).then((qty)=>{
            
            //     if (qty != null)
            //     {
            //         console.log(qty)
            //         // if (qty.q < data.order_qty || data.order_qty < 1)
            //         // {
            //         //     var resppnce = 
            //         //     {
            //         //         status : 2,  // no stock found
            //         //         oid : 0,
            //         //     }
            //         //     resolve(resppnce)
            //         // }
            //         // else
            //         // {
            //         //     // make sale
            //         //     var resppnce = 
            //         //     {
            //         //         status : 1,  // no stock found
            //         //         oid : 12,
            //         //     }
            //         //     resolve(resppnce)
            //         // }
            //     }
            //     else
            //     {
            //         var resppnce = 
            //             {
            //                 status : 0,  // no item found
            //                 oid : 0,
            //                 message : "no item found"
            //             }
            //             resolve(resppnce)
            //     }
          
            // })
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