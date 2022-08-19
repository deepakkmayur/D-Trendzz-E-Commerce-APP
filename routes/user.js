const { response } = require("express");
const express = require("express");
const db = require("../config/database");
const router = express.Router();
const url = require("url");

const userHelpers = require("../helpers/user-helpers");

const verifyLogin = function (req, res, next) {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};

let cartCount = 0;
let shopProducts;

router.get("/", async (req, res,next) => {

  try {
    if (req.session.loggedIn) {
      var cartCount = await userHelpers.getCartcount(req.session.user._id);
    } else {
      var cartCount = 0;
    }
    
  if(req.query.search){
    console.log(req.query.search,"-------search");
    console.log("----------------------1");
    userHelpers.getSearchData(req.query.search, next).then((searchData)=>{
      console.log(searchData,"////////////////////searchData/////////////first/////////");
      if (searchData) {
        res.render("index", {
          title: "Dtrendzz",
          user: true,
          isuserloggedin: req.session.loggedIn,
          isusersession: req.session.user,
          layout: "main-layout",
          BRINGDATA: searchData,
          cartCount,
        });
      } else {
        res.render("user/error", { layout: "main-layout" });
      }
    }).catch((error)=>{
      next(error)
    })
  }else{
    console.log("----------------------2");
    userHelpers.doBringdata().then((bringdata) => {
      if (bringdata) {
        res.render("index", {
          title: "Dtrendzz",
          user: true,
          isuserloggedin: req.session.loggedIn,
          isusersession: req.session.user,
          layout: "main-layout",
          BRINGDATA: bringdata,
          cartCount,
        });
  
        // console.log(req.session.user.firstname);
      } else {
        res.render("user/error", { layout: "main-layout" });
      }
    });
    
  }
    
  } catch (error) {
    console.log(error);
    next(error)
  }
});

router.get("/login", (req, res, next) => {
  try {
    if (!req.session.loggedIn) {
      res.render("user/login", {
        isLogin: true,
        errorMessage: req.flash("key"),
        blockMessage: req.flash("blocked"),
        layout: "main-layout",
      });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/signup", (req, res, next) => {
  try {
    if (!req.session.loggedIn) {
      res.render("user/signup", { isSignup: true, layout: "main-layout" });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/signup", (req, res, next) => {
  try {
    req.body.isblockeduser = false;

    userHelpers.doSignup(req.body).then((data) => {
      if (data) {
        res.redirect("/login");
      } else {
        res.redirect("/signup");
      }
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/login", (req, res, next) => {
  try {
    userHelpers.doLogin(req.body).then((response) => {
      if (response.status) {
        req.session.loggedIn = true;
        req.session.user = response.user;

        if (!response.user.isblockeduser) {
          res.redirect("/");
        } else {
          req.flash("blocked", "you have been blocked");

          res.redirect("/login");
        }
      } else {
        req.flash("key", "invalid email or password");
        res.redirect("/login");
      }
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/user_logout", (req, res, next) => {
  try {
    req.session.loggedIn = false;

    res.redirect("/");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/userforgot_password", (req, res, next) => {
  try {
    res.render("user/forgotpassword", {
      reset: true,
      errorMessageReset: req.flash("error"),
      layout: "main-layout",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/userforgot_password", (req, res, next) => {
  try {
    userHelpers.postReset(req.body).then((data) => {
      if (data) {
        res.redirect("/");
      } else {
        console.log("second");
        req.flash("error", "no email exist");

        res.redirect("/userforgot_password");
      }
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/userforgot_password/:id", (req, res, next) => {
  try {
    userHelpers.getNewPass(req.params.id).then((user) => {
      if (user) {
        res.render("user/newpassword", {
          objId: user._id,
          layout: "main-layout",
        });
      } else {
        console.log("not found");
      }
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/new_password", (req, res, next) => {
  try {
    userHelpers
      .postNewPass(req.body)
      .then((response) => {
        if (response) {
          res.redirect("/login");
        } else {
          res.redirect("/userforgot_password");
        }
      })
      .catch((err) => {
        redirect("/userforgot_password");
      });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/user_dashboard", verifyLogin, async (req, res, next) => {
  try {
    let cartCount = await userHelpers.getCartcount(req.session.user._id);
    let wishlistCount = await userHelpers.getWishlistcount(
      req.session.user._id
    );
    let orderCount = await userHelpers.getOrderCount(req.session.user._id);
    let orderlistProducts = await userHelpers.getOrderedItems(
      req.session.user._id
    );
    res.render("user/user-dashboard", {
      layout: "main-layout",
      user: true,
      isusersession: req.session.user,
      userDashboard: true,
      cartCount,
      wishlistCount,
      orderCount,
      orderlistProducts,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/my_profile", verifyLogin, async (req, res, next) => {
  try {
    let userId = req.session.user._id;
    let userDetails = await userHelpers.bringProfileData(userId);

    res.render("user/my-profile", {
      layout: "main-layout",
      user: true,
      isusersession: req.session.user,
      isuserloggedin: req.session.loggedIn,
      userId,
      userDetails,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/my_profile", async (req, res, next) => {
  try {
    let updateDetails = await userHelpers.profileUpdate(
      req.session.user._id,
      req.body
    );
    res.redirect("/my_profile");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/change_password", (req, res,next) => {
  try {
    userHelpers.changePassword(req.body).then(() => {
      res.redirect("/my_profile");
    });
    
  } catch (error) {
    console.log(error);
    next(error)
  }
});

router.get("/shop", (req, res,next) => {
  try {
    userHelpers.doBringdata().then((bringData) => {
      if (bringData) {
        shopProducts = bringData;
        // console.log("cart", cartCount);
        res.redirect("/filter-shop");
      }
    });
    
  } catch (error) {
    console.log(error);
    next(error)
  }
});

router.get("/category_filter", (req, res,next) => {
  try {
    parseUrl = url.parse(req.url, true);
    userHelpers.categoryFilter(parseUrl.query.category).then((filterdProduct) => {
      shopProducts = filterdProduct[0].filterProducts;
      res.redirect("/filter-shop");
    });
    
  } catch (error) {
    console.log(error);
    next(error)
  }
});

router.post("/category_filter", (req, res,next) => {
  try {
    userHelpers.categoryFilter(req.body.category).then((filterdProduct) => {
      shopProducts = filterdProduct[0].filterProducts;
      res.redirect("/filter-shop");
    });
    
  } catch (error) {
    console.log(error);
    next(error)
  }
});

router.get("/filter-shop", (req, res,next) => {
  try {
    res.render("user/shop", {
      layout: "main-layout",
      user: true,
      isuserloggedin: req.session.loggedIn,
      isusersession: req.session.user,
      bringdata: shopProducts,
      cartCOUNT: cartCount,
    });
    
  } catch (error) {
   console.log(error); 
   next(error)
  }
});

router.get("/view_product/:id", verifyLogin, (req, res,next) => {
  try {
    userHelpers.viewEachproduct(req.params.id).then((productDetails) => {
      if (productDetails) {
        return res.render("user/view-product", {
          layout: "main-layout",
          user: true,
          isuserloggedin: req.session.loggedIn,
          isusersession: req.session.user,
          productDetails,
          cartCOUNT: cartCount,
        });
      }
      res.redirect("/");
    });
    
  } catch (error) {
    console.log(error);
    next(error)
  }
});

router.post("/ADD_TO_CART", async (req, res, next) => {
  try {
    await userHelpers.addTocart(req.session.user._id, req.body.productID);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/add_to_cart/:id", (req, res,next) => {
  try {
    userHelpers.addTocart(req.session.user._id, req.params.id).then((data) => {
      if (data) {
        res.redirect("/");
      } else {
        res.redirect("/error");
      }
    });
    
  } catch (error) {
    next(error)
  }
});

router.get("/cart", verifyLogin, async (req, res,next) => {
  try {
    let cartProducts = await userHelpers.getCartproducts(req.session.user._id);
    console.log(cartProducts,"----------------------------------------------------cartProducts------------------------------------------");
    let total = await userHelpers.getCarttotal(req.session.user._id);
    let cartCount = await userHelpers.getCartcount(req.session.user._id);
    res.render("user/cart", {
      layout: "main-layout",
      user: true,
      isuserloggedin: req.session.loggedIn,
      isusersession: req.session.user,
      cartProducts,
  
      cartCount,
      total,
    });
    
  } catch (error) {
    console.log(error);
    next(error)
  }
});

router.post("/cart", (req, res,next) => {
  try {
    userHelpers.changeProductQuantity(req.body).then(() => {
      res.json(response);
    });
    
  } catch (error) {
    console.log(error);
    next(error)
  }
});

router.get("/delete_from_cart/:id", verifyLogin, (req, res,next) => {
  try {
    userHelpers.deleteFromcart(req.session.user._id, req.params.id).then(() => {
      res.redirect("/cart");
    });
    
  } catch (error) {
   console.log(error);
   next(error) 
  }
});


router.get("/proceed_to_checkout", verifyLogin, async (req, res,next) => {
  try {
    let cartitems = await userHelpers.getCartproducts(req.session.user._id);
    if (cartitems.length != 0) {
      userHelpers.viewAddress(req.session.user._id).then((ADDRESS) => {
        res.render("user/checkout-address", {
          user: true,
          layout: "main-layout",
          checkout_address: true,
          ADDRESS,
          onlinepayment: true,
          isuserloggedin: req.session.loggedIn,
         isusersession: req.session.user,
        });
      });
    } else {
      res.redirect("/cart");
    }
    
  } catch (error) {
    console.log(error);
    next(error)
  }
});

router.post("/submit_address", (req, res,next) => {
  try {
    userHelpers.addAddress(req.session.user._id, req.body).then((response) => {
    
      res.redirect('back')
    });
    
  } catch (error) {
    console.log(error);
    next(error)
  }
});

router.post("/proceed_to_checkout", async (req, res,next) => {
  try {
    let cartTotal = await userHelpers.getCarttotal(req.session.user._id);
  
    let cartitems = await userHelpers.getCartproducts(req.session.user._id);
  
    let address = await userHelpers.getAddress(
      req.session.user._id,
      req.body.time
    );
  
    userHelpers
      .placeOrder(req.session.user._id, req.body, cartTotal, cartitems, address)
      .then((orderId) => {
        if (req.body["paymentmethod"] === "cashondelivery") {
          res.json({ cashondelivery_success: true });
        } else {
          userHelpers.generateRazorpay(orderId, cartTotal).then((response) => {
            res.json(response);
          });
        }
      });
    
  } catch (error) {
    console.log(error);
    next(error)
  }
});

router.get("/delivered_page", (req, res,next) => {
  try {
    res.render("user/deliveredpage", { layout: "main-layout", user: true, isuserloggedin: req.session.loggedIn,isusersession: req.session.user });
    
  } catch (error) {
    console.log(error);
    next(error)
  }
 

});

router.post("/verify_payment", (req, res,next) => {
  try {
    userHelpers
      .verifyPayment(req.body)
      .then(() => {
        userHelpers
          .changePaymentStatus(req.body["order[receipt]"], req.session.user._id)
          .then(() => {
            console.log("payment success");
            res.json({ status: true });
          });
      })
      .catch((err) => {
        console.log(err);
        res.json({ status: false, errMsg: "" });
      });
    
  } catch (error) {
    console.log(error);
    next(error)
  }
});

router.get("/orderlist_page",verifyLogin, (req, res,next) => {
  try {
    userHelpers
      .getOrderedItems(req.session.user._id)
      .then((orderlistProducts) => {
        res.render("user/orderlistpage", {
          layout: "main-layout",
          user: true,
          orderlistProducts,
          orderlistTable: true,
          orderPlacementDetails: true,
          isuserloggedin: req.session.loggedIn,
          isusersession: req.session.user,
  
        });
      });
    
  } catch (error) {
    console.log(error);
    next(error)
  }
});

router.post("/add-to-wishlist", (req, res,next) => {
  try {
    userHelpers.addTowishlist(req.body.productID, req.session.user._id);
    
  } catch (error) {
    console.log(error);
    next(error)
  }
});

router.get("/wishlist", verifyLogin,async(req, res,next) => {
  try {
    let cartCount = await userHelpers.getCartcount(req.session.user._id);

    userHelpers.getWishlistproducts(req.session.user._id).then((wishproducts) => {
      if (wishproducts) {
        res.render("user/wishlist", {
          layout: "main-layout",
          user: true,
          isuserloggedin: req.session.loggedIn,
          isusersession: req.session.user,
          cartCount,
          wishproducts,
        });
      } else {
        res.redirect("/");
      }
    });
    
  } catch (error) {
    console.log(error);
    next(error)
  }
});

router.post("/remove_wishlist_product", (req, res,next) => {
  try {
    userHelpers
      .removeFromwishlist(req.session.user._id, req.body.product)
      .then((response) => {
        if (response) {
          res.redirect("/wishlist");
        }
      });
    
  } catch (error) {
    console.log(error);
    next(error)
  }
});

router.post('/search',(req,res,next)=>{
  try {
    res.send("hiii")
  } catch (error) {
    console.log(error);
    next(error)
  }
})

router.get("/error",verifyLogin, (re, res) => {
  res.render("user/error", { layout: "main-layout" });
});

module.exports = router;
