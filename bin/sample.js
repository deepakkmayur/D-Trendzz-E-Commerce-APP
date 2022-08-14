  addTocart:(productID,userID,QTY)=>{
    //since we are passing "numbers" (string type)
    let quantity=parseInt(QTY)

  return new Promise(async (resolve,reject)=>{
        let userCart= await db.get().collection(collection.cartCollection).findOne({user:objectId(userID)})

        if(userCart){
             let checkproductID= await db.get().collection(collection.cartCollection).findOne({'products._id':objectId(productID)})

             if(checkproductID){
              //  console.log("-----here---");

               let foundproductID=await db.get().collection(collection.cartCollection).updateOne({'products._id':objectId(productID)},{$inc:{'products.$.qty':1}})
               if(foundproductID){
                resolve(foundproductID)
               } else{
                resolve()
               }
              }else{

                let newProduct=await db.get().collection(collection.productCollection).aggregate([
                   {$match:{_id:objectId(productID) }},
                  { $project:{_id:1,product_name:1,price:1,img_id:1}}
                  ]).toArray()

                    newProduct[0].qty=quantity
                    let product= await db.get().collection(collection.cartCollection).updateOne({user:objectId(userID)},{$push:{products:newProduct[0]}})
                  // let product= await db.get().collection(collection.cartCollection).insertOne({user:objectId(userID)},{products:[newProduct[0]],total:0})
                  console.log("----new aggregate--",product);
                   if(product){
                    resolve(product)
                   }else{
                    resolve()
                   }

                console.log("-----no---");

             }
         }else{

            let aggregateData= await  db.get().collection(collection.productCollection).aggregate([

                { $match:{_id:objectId(productID) }},

                { $project:{_id:1,product_name:1,price:1,img_id:1}}

               ]).toArray()
                //quantity should be inside the products array
                aggregateData[0].qty=quantity
                db.get().collection(collection.cartCollection).insertOne({user:objectId(userID),products:[aggregateData[0]],total:0}).then((data)=>{
                  if(data){
                    resolve(data)
                  }else{
                    resolve()
                  }
                })

         }
  })
  }
