const mongodb = require("mongodb")
const mongoClient = mongodb.MongoClient


const state = { db: null }

module.exports.dbconnect = (done) => {

   const url = "mongodb://127.0.0.1"
   const dbname = "dtrendzz"
   mongoClient.connect(url, (err, data) => {
      if (err) {
         console.log("db not connected////////////////////////")
         // console.log(err,"////////////////////////")
         console.log(err);
         return done(err)
      }
      else {
         console.log("db connected///////////////////////////")
         state.db = data.db(dbname)
         // console.log(state.db);
         done()
      }
   })

}


module.exports.get = function () {
   return state.db
}





