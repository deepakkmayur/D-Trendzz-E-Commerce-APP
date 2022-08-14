const db = require("../config/database");
const collection = require("../config/collection");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const crypto = require("crypto");
const { resolve } = require("path");
const { productCollection } = require("../config/collection");
const objectId = require("mongodb").ObjectId;
const Razorpay=require('razorpay');
const { ObjectId } = require("mongodb");
require('dotenv').config()



const instance = new Razorpay({
  key_id: process.env.RAZORPAY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});



const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:process.env.NODEMAILER_API_KEY
       ,
    },
  })
);

module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      const isUser = await db
        .get()
        .collection(collection.userCollection)
        .findOne({ email: userData.email }); // steps for checking email previously exist or not

      // console.log(isUser);

      if (!isUser) {
        userData.password = await bcrypt.hash(userData.password, 10);
        db.get()
          .collection(collection.userCollection)
          .insertOne(userData)
          .then((data) => {
            resolve(data.insertedId);
          });
      } else {
        resolve();
      }
    });
    // console.log(userData);
  },

  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      let user = await db
        .get()
        .collection(collection.userCollection)
        .findOne({ email: userData.email,isblockeduser:false });

      if (user) {
        bcrypt.compare(userData.password, user.password).then((data) => {
          // console.log(data);
          // console.log(user.password);
          // console.log(userData.password);
          if (data) {
            // console.log("login success");
            response.user = user;
            response.status = true;
            //  console.log(response);
            resolve(response);
          } else {
            console.log("login failed");
            resolve({ status: false });
          }
        });
      } else {
        console.log("no data found");
        resolve({ status: false });
      }
    });
  },



// profile
  changePassword:(userDetails)=>{
    let {password,userId}=userDetails
    console.log(userDetails,"details");
    console.log(password,"pass");
    console.log(userId,"id");
    try{
      return new Promise(async(resolve,reject)=>{
        let findUser=await db.get().collection(collection.userCollection).findOne({_id:objectId(userId)})
        if(findUser){
           password = await bcrypt.hash(password, 10);
           let update=db.get().collection(collection.userCollection).updateOne({_id:objectId(userId)},{$set:{password:password}})
            if(update){
              resolve()
            }
        
        }
      })
    }catch(error){
      console.log(error);          
    }
  },

                                                             

  bringProfileData:(userID)=>{
return new Promise(async (resolve,reject)=>{
  try{
      let userDetails= db.get().collection(collection.userCollection).findOne({_id:objectId(userID)})
      if(userDetails){
       
        resolve(userDetails)
      }

  }catch(error){
    console.log(error);
  }
})
  },




  profileUpdate:(userID,userDetails)=>{
    console.log(userDetails,"/////////////////");
    return new Promise(async (resolve,reject)=>{
      try{
        let updateDetails=db.get().collection(collection.userCollection).updateOne({_id:objectId(userID)},
        {
          $set:{
           firstname:userDetails.firstname,
           lastname:userDetails.lastname,
           email:userDetails.email,
           phone:userDetails.phone
          }
        })
        if(updateDetails){
          resolve(updateDetails)
        }
      }catch(error){
        console.log(error);
      }
    })
  },







   //change password via email
  postReset: (userData) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(32, (err, buffer) => {
        if (err) {
          resolve();
        } else {
          const token = buffer.toString("hex");
          db.get()
            .collection(collection.userCollection)
            .findOne({ email: userData.email })
            .then((data) => {
              if (data) {
                db.get()
                  .collection(collection.userCollection)
                  .updateOne(
                    { email: data.email },
                    {
                      $set: {
                        resetToken: token,
                        userTokenExpire: Date.now() + 600000,
                      },
                    }
                  )
                  .then((response) => {
                    if (response) {
                      resolve(response);
                      transporter.sendMail({
                        to: data.email,
                        from: "deepakkmayur1@gmail.com",   
                        subject: "Password Reset",
                        html: ` 
                    <p> Hai ${data.firstname} </p>
                    <p> A password reset for your account was requrestd. </p>
                    <p> Please click the <a href="http://localhost:3000/userforgot_password/${token}">Link</a> to change your password </p>    
                     `,
                      });
                    } else {
                      resolve();
                    }
                  });
              } else {
                resolve();
              }
            });
        }
      });
    });
  },

  getNewPass: (token) => {
    return new Promise((resolve, reject) => {
      // console.log(token);
      db.get()
        .collection(collection.userCollection)
        .findOne({ resetToken: token, userTokenExpire: { $gt: Date.now() } })
        .then((res) => {
          console.log(res);
          if (res) {
            resolve(res);
          } else {
            resolve();
          }
        });
    });
  },

  postNewPass: (userData) => {
    let { password, objId } = userData;
    // console.log(objId);
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.userCollection)
        .findOne({ _id: objectId(objId), userTokenExpire: { $gt: Date.now() } })
        .then(async (user) => {
          if (user) {
            password = await bcrypt.hash(password, 10);
            db.get()
              .collection(collection.userCollection)
              .updateOne(
                { _id: objectId(objId) },    
                {
                  $set: {
                    password: password,
                    resetToken: null,
                    userTokenExpire: null,
                  },
                }
              )
              .then((response) => {
                if (response) {
                  resolve(response);
                } else {
                  resolve();
                }
              })
              .catch((err) => {
                reject(err);
              });
          } else {
            resolve();
          }
        });
    });
  },

  doBringdata: () => {
    return new Promise(async (resolve, reject) => {
      const bringdata = await db
        .get()
        .collection(collection.productCollection)
        .find()
        .toArray();
      if (bringdata) {
        resolve(bringdata);
      } else {
        resolve();
      }
    });
  },

  viewEachproduct: (id) => {
    console.log(id,"//////////////////////id///////");
    return new Promise(async (resolve, reject) => {
      const productDetails = await db
        .get()
        .collection(collection.productCollection)
        .findOne({ _id: objectId(id) });
      if (productDetails) {
        resolve(productDetails);
      } else resolve();
    });
  },


  categoryFilter: (category) => {
    return new Promise(async (resolve, reject) => {
      try {
        const filter = await db.get().collection(collection.categoryCollection).aggregate([
          {
            $lookup: {
              from: collection.productCollection,
              localField: "_id",
              foreignField: "category",
              as: "filterProducts",
            }
          }
        ]).toArray()

        if (filter) {
          const filterdPrd = filter.filter((val) => {
            return val.category_name === category
          })
          // console.log("filterd", filterdPrd);
          resolve(filterdPrd)
        } else {
          resolve()
        }
      } catch (error) {
        console.log(error);
      }

    })
  },









  addTocart: (userId, proId) => {
    let productObj = {
      item: objectId(proId),
      quantity: 1,
    };
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collection.cartCollection)
        .findOne({ user: objectId(userId) });
      // console.log(userCart);
      if (userCart) {
        let productExist = userCart.products.findIndex((product) => {
          return product.item == proId;
        });

        // console.log(productExist);
        if (productExist != -1) {
          return db
            .get()
            .collection(collection.cartCollection)
            .updateOne(
              {
                "products.item": objectId(proId),
              },
              {
                $inc: { "products.$.quantity": 1 },
              }
            )
            .then((response) => {
              resolve(response);
            });
        }

        db.get()
          .collection(collection.cartCollection)
          .updateOne(
            { user: objectId(userId) },
            {
              $push: { products: productObj },
            }
          )
          .then((response) => {
            resolve(response);
          });
      } else {
        let cartObj = {
          user: objectId(userId),
          products: [productObj],
        };
        db.get()
          .collection(collection.cartCollection)
          .insertOne(cartObj)
          .then((response) => {
            resolve(response);
          });
      }
    });
  },



  getCartproducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartProducts = await db
        .get()
        .collection(collection.cartCollection)
        .aggregate([
          { $match: { user: objectId(userId) } },
          { $unwind: "$products" },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.productCollection,
              localField: "item",
              foreignField: "_id",
              as: "productDetails",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: {
                $arrayElemAt: ["$productDetails", 0],
              },

            },

          }, 
          {
            $addFields: {
              sum: { $multiply: ["$product.price", "$quantity"] }
            }           
          }
        ])
        .toArray();

      resolve(cartProducts);
      console.log("/////////cart ptoducts--------------//////////////////",cartProducts);
    });
  },




  changeProductQuantity: (details) => {

    details.count = parseInt(details.count);
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.cartCollection)
        .updateOne(
          {
            _id: objectId(details.cart),
            "products.item": objectId(details.product),
          },
          {
            $inc: { "products.$.quantity": details.count },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },



  getCartcount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartCount = 0;
      let cartData = await db
        .get()    
        .collection(collection.cartCollection)   
        .findOne({ user: objectId(userId) });
       
      if (cartData) {
        cartCount = cartData.products.length;
       console.log("///////////////////////////cart count in if");
        resolve(cartCount);
      }else{
        console.log("///////////////////////////cart count in else");
        resolve(cartCount)
      } 
    });
  },


  getWishlistcount:(userID)=>{

    return new Promise(async (resolve, reject) => {
      let wishlistCount = 0;
      let wishlistData = await db
        .get()
        .collection(collection.wishlistCollection)
        .findOne({ userId: objectId(userID) });
        if(wishlistData){
          wishlistCount=wishlistData.products.length
          
          // console.log(wishlistCount,"///////////wishlist////////////");
          
          resolve(wishlistCount)
         }
    })
  }, 




  deleteFromcart: (userID, productID) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.cartCollection)
        .updateOne(
          { user: objectId(userID) },

          { $pull: { products: { item: objectId(productID) } } }
        )
        .then((response) => {
          resolve({ response });
        });
    });
  },



  addTowishlist: (proId, userId) => {
    let proObj = {
      item: objectId(proId),
    };
    return new Promise(async (resolve, reject) => {
      let userWishlist = await db
        .get()
        .collection(collection.wishlistCollection)
        .findOne({ userId: objectId(userId) });
      if (userWishlist) {
        let proExist = userWishlist.products.findIndex((product) => {
          // console.log("-------------user already exist");

          return product.item == proId;
        });
        if (proExist != -1) {
          // console.log("-------------product already exist");
          db.get()
            .collection(collection.wishlistCollection)
            .updateOne(
              {
                "products.item": objectId(proId),
              },
              {
                $set: { "products.$.item": objectId(proId) },
              }
            )
            .then(() => {
              resolve();
            });
        } else {
          // console.log("-------------added new product");
          db.get()
            .collection(collection.wishlistCollection)
            .updateOne(
              { userId: objectId(userId) },
              {
                $push: { products: proObj },
              }
            )
            .then(() => {
              resolve();
            });
        }
      } else {
        let wishListObj = {
          userId: objectId(userId),
          products: [proObj],
        };
        db.get()
          .collection(collection.wishlistCollection)
          .insertOne(wishListObj)
          .then((response) => {
            // console.log("-------------user not exist");
            resolve(response);
          });
      }
    });
  },




  removeFromwishlist: (userID, productID) => {
    return new Promise(async (resolve, reject) => {
      const findProduct = await db
        .get()
        .collection(collection.wishlistCollection)
        .findOne({ userId: objectId(userID) });
      if (findProduct) {
        const deleteProduct = await db
          .get()
          .collection(collection.wishlistCollection)
          .updateOne(
            {
              userId: objectId(userID)
            },
            {
              $pull: {
                products: { item: objectId(productID) }

              }
            }
          )
        if (deleteProduct) {
          resolve(deleteProduct)
        }

      } else
        resolve()
    });
    // console.log(userID, productID, "xxxxxx");
  },




  getWishlistproducts: (userID) => {
    return new Promise(async (resolve, reject) => {
      let wishProducts = await db
        .get()
        .collection(collection.wishlistCollection)
        .aggregate([
          { $match: { userId: objectId(userID) } },
          { $unwind: "$products" },
          { $project: { item: "$products.item" } },

          {
            $lookup: {
              from: collection.productCollection,
              localField: "item",
              foreignField: "_id",
              as: "productDetails",
            },
          },
          {
            $project: {
              item: 1,
              product: {
                $arrayElemAt: ["$productDetails", 0],
              },
            },
          },
        ])
        .toArray();
      // console.log("lookup items-----", wishProducts);

      resolve(wishProducts);
    });
  },

  getCarttotal: (userId) => {
    return new Promise(async (resolve, reject) => {
      const total = await db
        .get()
        .collection(collection.cartCollection)
        .aggregate([
          {
            $match: {
              user: objectId(userId),
            },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.productCollection,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              products: { $arrayElemAt: ["$product", 0] },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ["$quantity", "$products.price"] } },
            },
          },
      
        ])
        .toArray();
      console.log(total, ".////////////////.........cart Total.........//////////////");
      if (total) {
        return resolve(total);
      }
      resolve();
    }); 
  },    


  



  addAddress: (userID, userDetails) => {
    userDetails.time = Date.now()
    return new Promise(async (resolve, reject) => {

      try {

        let address = await db.get().collection(collection.userCollection).updateOne({ _id: objectId(userID) }, { $push: { address: userDetails } })
        if (address) {
          resolve(address)
        }
      } catch (error) {
        console.log(error);
      }

    })    
  },


  viewAddress:(userID)=> {
    return new Promise(async (resolve, reject) => {
      try {

        let Address = await db.get().collection(collection.userCollection).aggregate([
          { $match: { _id: objectId(userID) } },
          { $project: { address: 1 } },
          { $unwind: '$address' },
          { $sort: { 'address.time': -1 } },
          { $limit: 3 },


        ]).toArray()


        if (Address) {
          resolve(Address)
        }
      } catch (error) {
        console.log(error);
        
      }
    })

  },

  getAddress: (userID, addressTime) => {
    addressTime = parseInt(addressTime)
  
    return new Promise(async (resolve, reject) => {
      try {
        let address = await db.get().collection(collection.userCollection).aggregate([
          { $match: { _id: objectId(userID) } },
          { $project: { address: 1 } },
          { $unwind: "$address" },

          { $match: { "address.time": addressTime } }


        ]).toArray()

        resolve(address)

      } catch (error) {
        console.log(error);
      }
    })

  },

  placeOrder: (userID, addressAndTime, cartTotal, cartItem, Address) => {
   
    return new Promise(async (resolve, reject) => {
      let status = addressAndTime.paymentmethod === 'cashondelivery' ? 'placed' : 'pending'
      
      let orderObj = {
        deliveryDetails: {
          address: Address[0].address.address,
          name: Address[0].address.firstname,
          city: Address[0].address.city,
          state: Address[0].address.state,
          pincode: Address[0].address.pincode,
          phone: Address[0].address.phone,
          email: Address[0].address.email,
        },
        //  order_id:new objectId() ,
        paymentMethod: addressAndTime.paymentmethod,
        status: status,
        totalAmount: cartTotal[0].total,
        products: cartItem,
        date: new Date().toDateString(),
      }
      
  
        
        db.get().collection(collection.orderCollection).insertOne({ userId: objectId(userID), orderDetails: orderObj }).then(async (data) => {
          
          await db.get().collection(collection.cartCollection).deleteOne({ user: objectId(userID) })
          //instead of ops[0]._id    now we use insertedId
          
          // console.log(data.insertedId.toString(),"last................................................................................................................")
          resolve(data.insertedId.toString())   
        })      
     
    })
  },


   
  verifyPayment:(details)=>{
    return new Promise((resolve,reject)=>{
      const crypto=require('crypto')
      let hmac = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET_KEY)
      hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]'])
      hmac=hmac.digest('hex')
      if(hmac==details['payment[razorpay_signature]']){
        resolve()
      }else{
        reject()
      }
    })
  },



  changePaymentStatus:(orderId)=>{
     return new Promise((resolve,reject)=>{
      db.get().collection(collection.orderCollection)
      .updateOne({_id:objectId(orderId)},
        
      {
        $set:{
           'orderDetails.status':'placed'
        }
      }
      ).then(()=>{
        resolve()
      })
     })
  },

  

  getCartProductList: (userID) => {
    return new Promise(async (resolve, reject) => {
      try {
        let getProduct = await db.get().collection(collection.cartCollection).aggregate([
          { $match: { user: objectId(userID) } },
          { $unwind: '$products' },
          { $project: { item: '$products.item', quantity: '$products.quantity' } },
       
        ]).toArray()
        // console.log(getProduct, "//////////////////////look up/////////////////////////////////");
        resolve(getProduct)

      } catch (error) {
        console.log(error);
      }
    })
  },



  getOrderedItems: (userID) => {
    return new Promise(async (resolve, reject) => {
      try {
        let getdetails = await db.get().collection(collection.orderCollection).aggregate([           
          { $match: { userId: objectId(userID) } },
          { $unwind: "$orderDetails" },
          { $unwind: "$orderDetails.products" },  
         
          // {$addFields:{newID:ObjectId()}}    
         

        ]).toArray()
        console.log(getdetails[0].orderDetails, "/////////////////////data/1/////////////////////////////////");
        resolve(getdetails)
      } catch (error) {
        console.log(error);
      }

    })
  },


  generateRazorpay: (orderID,cartTotal) => {
    return new Promise((resolve, reject) => {
      // console.log(cartTotal[0].total,"===============cartTotal=====================");
      // console.log(orderID,"===============orderId=====================");

      
      let options = {
        
        amount:cartTotal[0].total*100,  // amount in the smallest currency unit
        
        currency: "INR",
        receipt: orderID
      };
      console.log(options.amount,"////////////options rupess/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////");
      instance.orders.create(options, function(err, order) {
        // console.log('--------',order,'<<<<<<<<order here------------------------------->');
        // console.log(err,'//err//');
        resolve(order)
      });


      // resolve()
    })
  },












};
