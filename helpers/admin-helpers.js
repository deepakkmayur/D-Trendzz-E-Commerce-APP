const db = require("../config/database");
const collection = require("../config/collection");
const bcrypt = require("bcrypt");
const objectid = require("mongodb").ObjectId;

module.exports = {
  doLogin: (userData) => {
 
    return new Promise(async (resolve, reject) => {
      try {
        let admin = await db
          .get()
          .collection(collection.adminCollection)
          .findOne({ email: userData.email });
   
        if (admin) {
          bcrypt.compare(userData.password, admin.password).then((data) => {
       
            if (data) {
      
              resolve(data);
            } else {
              resolve();
            }
          });
        } else {
          resolve();
        }
        
      } catch (error) {
        console.log(error);
        reject(error)
      }
    });
  },



  // doAddproduct: (productData) => {
  //   productData.price = parseInt(productData.price)
  //   return new Promise((resolve, reject) => {
  //     db.get().collection(collection.productCollection).insertOne(productData).then(async (data) => {
  //       if (data) {
  //         resolve(data)

  //       } else {
  //         resolve()
  //       }

  //     })
  //   })

  // },

  doAddproduct: (productData) => {
    if (productData.discount < 100 && productData.discount > 0) {
      productData.price =parseInt( productData.actualprice - (productData.actualprice * productData.discount) / 100)
       
       
    } else {
      (productData.price = productData.actualprice),
        (productData.discount = "0");
    }

    return new Promise((resolve, reject) => {
      try {
        db.get()
          .collection(collection.productCollection)
          .insertOne(productData)
          .then(async (data) => {
            if (data) {
              resolve(data);
            } else {
              resolve();
            }
          });
        
      } catch (error) {
        console.log(error);
        reject(error)
      }
    });
  },

  showProduct: (productData) => {
    return new Promise((resolve, reject) => {
      try {
        db.get()
          .collection(collection.productCollection)
          .insertOne(productData)
          .then(async (data) => {
            if (data) {
              resolve(data);
            } else {
              resolve();
            }
          });
        
      } catch (error) {
        console.log(error);
        reject(error)
      }
    });
  },

  showProduct: () => {
    return new Promise(async (resolve, reject) => {

      try {
        const products = await db
          .get()
          .collection(collection.productCollection)
          .aggregate([
            {
              $lookup: {
                from: "category",
                localField: "category",
                foreignField: "_id",
                as: "lookup_category",
              },
            },
          ])
          .toArray();
        if (products) {
          console.log(products);
          return resolve(products);
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  doEditpage: (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const findEdit = await db
          .get()
          .collection(collection.productCollection)
          .findOne({ _id: objectid(id) });
        if (findEdit) {
          //   console.log(findEdit);
          resolve(findEdit);
        }
        
      } catch (error) {
        console.log(error);
        reject(error)
      }
    });
  },

  doEditproduct: (productDetails, id) => {
    productDetails.price = parseInt(productDetails.price);
    return new Promise(async (resolve, reject) => {
      try {
        
        const edit = await db
          .get()
          .collection(collection.productCollection)
          .updateOne(
            { _id: objectid(id) },
            {
              $set: {
                product_name: productDetails.product_name,
                price: productDetails.price,
                brand: productDetails.brand,
                category: productDetails.category,
                description: productDetails.description,
                img_id: productDetails.img_id,
                stock: productDetails.stock,
                size: productDetails.size,
              },
            }
          );
        if (edit) {
       
          resolve(edit);
        } else {
          resolve();
        }
      } catch (error) {
        console.log(error);
        reject(error)
      }

    });
  },

  doDeleteproduct: (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        let deleteProduct = await db
          .get()
          .collection(collection.productCollection)
          .deleteOne({ _id: objectid(id) });
        if (deleteProduct) {
   
          resolve(deleteProduct);
        } else {
          resolve();
        }
        
      } catch (error) {
        console.log(error);
        reject(error)
      }
    });
  },

  userManagement: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const userdetails = await db
          .get()
          .collection(collection.userCollection)
          .find()
          .toArray();
        if (userdetails) {
          resolve(userdetails);
        } else {
          resolve();
        }
        
      } catch (error) {
        console.log(error);
        reject(error)
      }
    });
  },

  orderManagement: () => {
    try {
      return new Promise(async (resolve, reject) => {
        let orders = await db
          .get()
          .collection(collection.orderCollection)
          .aggregate([
            {
              $match: {},
            },
            {
              $unwind: {
                path: "$orderDetails.products",
              },
            },
            {
              $lookup: {
                from: collection.userCollection,
                localField: "userId",
                foreignField: "_id",
                as: "userData",
              },
            },
          ])
          .toArray();
        console.log("0000000000000000000000000000000000");
        console.log(orders[0].userData, "000000000000000000000000000000");

        resolve(orders);
      });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  },

  blockUser: (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const block = await db
          .get()
          .collection(collection.userCollection)
          .updateOne({ _id: objectid(id) }, { $set: { isblockeduser: true } });
  
        if (block) {
          resolve(block);
        } else {
          resolve();
        }
        
      } catch (error) {
        console.log(error);
        reject(error)
      }
    });
  },

  unblockUser: (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const unblock = await db
          .get()
          .collection(collection.userCollection)
          .updateOne({ _id: objectid(id) }, { $set: { isblockeduser: false } });
  
        if (unblock) {
          resolve(unblock);
        } else {
          resolve();
        }
        
      } catch (error) {
        console.log(error);
        reject(error)
      }
    });
  },

  findCategory: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const category = await db
          .get()
          .collection(collection.categoryCollection)
          .find()
          .toArray();
        if (category) {
          resolve(category);
        } else {
          resolve();
        }
        
      } catch (error) {
       console.log(error);
       reject(error) 
      }
    });
  },


  bringOrderDetails: (userID) => {
    return new Promise(async (resolve, reject) => {
      try {
        let oderedProducts = await db
          .get()
          .collection(collection.orderCollection)
          .aggregate([
            { $match: { userId: objectid(userID) } },
            { $unwind: "$orderDetails.products" },
          ])
          .toArray();

        
        resolve(oderedProducts);
      } catch (error) {
        console.log(error);
        reject(error)
      }
    });
  },

  adminUpdateStatus: (orderID, STATUS) => {
    return new Promise(async (resolve, reject) => {
      try {
        //shipped
        if (STATUS === "shipped") {
          let statusUpdate = await db
            .get()
            .collection(collection.orderCollection)
            .updateOne(
              { _id: objectid(orderID) },
              {
                $set: {
                  "orderDetails.status": STATUS,
                  shipped: true,
                  cancelled: false,
                  delivered: false,
                  out_for_delivery: false,
                  pending: false,
                },
              }
            );
          if (statusUpdate) {
            resolve(statusUpdate);
          }
        }

        //pending
        else if (STATUS === "pending") {
          let statusUpdate = await db
            .get()
            .collection(collection.orderCollection)
            .updateOne(
              { _id: objectid(orderID) },
              {
                $set: {
                  "orderDetails.status": STATUS,
                  pending: true,
                  delivered: false,
                  out_for_delivery: false,
                  shipped: false,
                  cancelled: false,
                },
              }
            );
          if (statusUpdate) {
            resolve(statusUpdate);
          }
        }

        //out_for_delivery
        else if (STATUS === "out_for_delivery") {
          let statusUpdate = await db
            .get()
            .collection(collection.orderCollection)
            .updateOne(
              { _id: objectid(orderID) },
              {
                $set: {
                  "orderDetails.status": STATUS,
                  out_for_delivery: true,
                  cancelled: false,
                  shipped: false,

                  delivered: false,
                  pending: false,
                },
              }
            );
          if (statusUpdate) {
            resolve(statusUpdate);
          }
        }

        //delivered
        else if (STATUS === "delivered") {
          let statusUpdate = await db
            .get()
            .collection(collection.orderCollection)
            .updateOne(
              { _id: objectid(orderID) },
              {
                $set: {
                  "orderDetails.status": STATUS,
                  delivered: true,
                  out_for_delivery: false,
                  shipped: false,
                  cancelled: false,
                  pending: false,
                },
              }
            );
          if (statusUpdate) {
            resolve(statusUpdate);
          }
        }

        //cancelled
        else if (STATUS === "cancelled") {
          let statusUpdate = await db
            .get()
            .collection(collection.orderCollection)
            .updateOne(
              { _id: objectid(orderID) },
              {
                $set: {
                  "orderDetails.status": STATUS,
                  cancelled: true,
                  shipped: false,
                  out_for_delivery: false,
                  delivered: false,
                  pending: false,
                },
              }
            );
          if (statusUpdate) {
            resolve(statusUpdate);
          }
        }
      } catch (error) {
        console.log(error);
        reject(error)
      }
    });
  },

  generateCoupon:(coupon)=>{
     

    if(coupon.discount>0 && coupon.discount<100){
      coupon.discount=coupon.discount
  
    }else{
      coupon.discount=0
    }
    return new Promise(async(resolve,reject)=>{
      try {
        await db.get().collection(collection.couponCollection).insertOne(coupon)
        resolve()
      } catch (error) {
        console.log(error);
        reject(error)
      }
    })

  },
  getCouponDetails:()=>{
   return new Promise(async (resolve,reject)=>{
    try {
      const couponDetails= await db.get().collection(collection.couponCollection).find().toArray()
      resolve(couponDetails)
    } catch (error) {
      console.log(error);
      reject(error)
    }
   })
  },


  deleteCoupon:(couponID)=>{
    return new Promise(async (resolve,reject)=>{
      try {
        await db.get().collection(collection.couponCollection).deleteOne({_id:objectid(couponID)})
        resolve()
      } catch (error) {
        console.log(error);
        reject(error)
      }
    })
  }




};
