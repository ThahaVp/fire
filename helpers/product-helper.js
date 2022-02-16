var db = require('../config/connection')
var constants = require('../config/constants')
var objectId = require('mongodb').ObjectId

module.exports = {
    
    addProduct:(product, callback) => {
        // before inserting check session user is valid
        db.get().collection(constants.PRODUCT_COLLECTION).insertOne(product).then((data)=>{
            callback(data.insertedId.valueOf())
        })
    },

    getAllProducts:() => {
        return new Promise(async(resolve,reject)=>{
            let products = await db.get().collection(constants.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },

    getProduct:(proId) => {
        return new Promise((resolve,reject)=>{
            db.get().collection(constants.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                resolve(product)
            })
            
        })
    },

    deleteProduct:(proId) => {
        return new Promise((resolve, reject)=>{
            db.get().collection(constants.PRODUCT_COLLECTION).deleteOne({_id:objectId(proId)}).then((responce)=>{
                resolve(responce)
            })
        })
    },

    updateProduct:(proId, data) => {
        return new Promise((resolve, reject)=>{
            db.get().collection(constants.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},
        {
            $set:{
                t:data.t,
                d:data.d,
                c:data.c
            }
        }).then((responce)=>{
            resolve(responce)
        })
        })
    },

    addToCart:(proId, userId, qty)=>{
        return new Promise((resolve, reject)=>{
            db.get().collection(constants.CART_COLLECTION).insertOne()
        })
    }
}