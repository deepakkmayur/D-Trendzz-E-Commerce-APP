const mongodb=require("mongodb")
const mongoClient=mongodb.MongoClient


const state={db:null}  

module.exports.dbconnect=(done)=>{

   const url="mongodb://localhost:27017"
   const dbname="dtrendzz"
   mongoClient.connect(url,(err,data)=>{
      if(err)
      return done(err) 
      else{
         state.db=data.db(dbname)
         done()
      

      }
 })

}
 

module.exports.get=function(){
   return state.db
}





