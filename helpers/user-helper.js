var db = require('../config/connection')
var constants = require('../config/constants')
const bcrpt = require('bcrypt')

module.exports = {

    doSignup:(userData)=>{
        return new Promise(async(resolve, reject)=>{
            var responce = {}
            userData.password = await bcrpt.hash(userData.password, 10)
            db.get().collection(constants.USER_COLLECTION).insertOne(userData).then((data)=>{
                responce.user = userData
                responce.user._id = data
                responce.status = true
                resolve(responce)
                
            })
        })
        
    },

    doLogin:(userData)=>{
        return new Promise(async(resolve, reject)=>{
            var responce = {}
            let user = await db.get().collection(constants.USER_COLLECTION).findOne({email:userData.email})
            if(user)
            {
                bcrpt.compare(userData.password, user.password).then((status)=>{
                    if(status)
                    {
                        responce.user = user
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
        
    }
}