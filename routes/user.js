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

router.get("/", async (req, res) => {
  if (req.session.loggedIn && !req.session.user.isblockeduser) {
    var cartCount = await userHelpers.getCartcount(req.session.user._id);
  } else {
    var cartCount = 0;
  }

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
});

router.get("/login", (req, res) => {
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
});

router.get("/signup", (req, res) => {
  if (!req.session.loggedIn) {
    res.render("user/signup", { isSignup: true, layout: "main-layout" });
  } else {
    res.redirect("/");
  }
});

router.post("/signup", (req, res) => {
  req.body.isblockeduser = false;

  userHelpers.doSignup(req.body).then((data) => {
    if (data) {
      res.redirect("/login");
    } else {
      res.redirect("/signup");
    }
  });
});

router.post("/login", (req, res) => {
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
});

router.get("/user_logout", (req, res) => {
  req.session.loggedIn = false;
  // req.session.destroy((err)=>{
  //   if(err) throw err
  res.redirect("/");
  // })
});

router.get("/userforgot_password", verifyLogin, (req, res) => {
  res.render("user/forgotpassword", {
    reset: true,
    errorMessageReset: req.flash("error"),
    layout: "main-layout",
  });
});

router.post("/userforgot_password", (req, res) => {
  userHelpers.postReset(req.body).then((data) => {
    if (data) {
      res.redirect("/");
    } else {
      console.log("second");
      req.flash("error", "no email exist");

      res.redirect("/userforgot_password");
    }
  });
});

router.get("/userforgot_password/:id", verifyLogin, (req, res) => {
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
});

router.post("/new_password", (req, res) => {
  // console.log(req.body);
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
});

router.get("/user_dashboard", verifyLogin, async (req, res) => {
  let cartCount = await userHelpers.getCartcount(req.session.user._id);
  let wishlistCount = await userHelpers.getWishlistcount(req.session.user._id);
  //  console.log(cartCount,"------------cartcount----------");
  res.render("user/user-dashboard", {
    layout: "main-layout",
    user: true,
    isusersession: req.session.user,
    userDashboard: true,
    cartCount,
    wishlistCount,
  });
});

router.get("/my_profile", verifyLogin, async (req, res) => {
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
});

router.post("/my_profile", async (req, res) => {
  let updateDetails = await userHelpers.profileUpdate(
    req.session.user._id,
    req.body
  );
  // console.log(updateDetails,"------------------------------------------");
  res.redirect("/my_profile");
});

router.post("/change_password", (req, res) => {
  userHelpers.changePassword(req.body).then(() => {
    res.redirect("/my_profile");
  });
});

router.get("/shop", (req, res) => {
  userHelpers.doBringdata().then((bringData) => {
    if (bringData) {
      shopProducts = bringData;
      // console.log("cart", cartCount);
      res.redirect("/filter-shop");
    }
  });
});

router.get("/category_filter", (req, res) => {
  parseUrl = url.parse(req.url, true);
  // console.log(parseUrl.query.category,"///////======//////");
  userHelpers.categoryFilter(parseUrl.query.category).then((filterdProduct) => {
    // console.log(filterdProduct);
    shopProducts = filterdProduct[0].filterProducts;
    res.redirect("/filter-shop");
  });
});

router.post("/category_filter", (req, res) => {
  userHelpers.categoryFilter(req.body.category).then((filterdProduct) => {
    shopProducts = filterdProduct[0].filterProducts;
    res.redirect("/filter-shop");
  });
});

router.get("/filter-shop", (req, res) => {
  res.render("user/shop", {
    layout: "main-layout",
    user: true,
    isuserloggedin: req.session.loggedIn,
    isusersession: req.session.user,
    bringdata: shopProducts,
    cartCOUNT: cartCount,
  });
});

router.get("/view_product/:id", verifyLogin, (req, res) => {
  console.log(req.params.id, "----req.params.id---------------------------");

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
});

router.post("/add_to_cart/:id", (req, res) => {
  // console.log(req.body.qty,"//////////////////");
  userHelpers.addTocart(req.session.user._id, req.params.id).then((data) => {
    if (data) {
      res.redirect("/");
    } else {
      res.redirect("/error");
    }
  });
});

router.get("/cart", verifyLogin, async (req, res) => {
  let cartProducts = await userHelpers.getCartproducts(req.session.user._id);
  let total = await userHelpers.getCarttotal(req.session.user._id);

  //  console.log("-----------cartproducts-----",cartProducts,"-----------cart total",total,"-------------------");

  res.render("user/cart", {
    layout: "main-layout",
    user: true,
    isuserloggedin: req.session.loggedIn,
    isusersession: req.session.user,
    cartProducts,

    cartCOUNT: cartCount,
    total,
  });
});

router.post("/cart", (req, res) => {
  // console.log("-----------------post cart here------------------------------------");
  // console.log(req.body,"--------------------post cart req.body---------");
  userHelpers.changeProductQuantity(req.body).then(() => {
    res.json(response);
  });
});

router.get("/delete_from_cart/:id", verifyLogin, (req, res) => {
  userHelpers.deleteFromcart(req.session.user._id, req.params.id).then(() => {
    res.redirect("/cart");
  });
});

router.get("/proceed_to_checkout", verifyLogin, (req, res) => {
  userHelpers.viewAddress(req.session.user._id).then((ADDRESS) => {
    res.render("user/checkout-address", {
      user: true,
      layout: "main-layout",
      checkout_address: true,
      ADDRESS,
      onlinepayment: true,
    });
  });
});

router.post("/submit_address", (req, res) => {
  // console.log("--------------post---submit_address-----------------------------------");
  userHelpers.addAddress(req.session.user._id, req.body).then((response) => {
    // console.log(response,"-----------------------post- enter-submit address-------------------------------------");
    res.json(response);
  });
});

router.post("/proceed_to_checkout", async (req, res) => {
  // console.log("----------------------------payment page first enter--------------------------------------------------------");
  let cartTotal = await userHelpers.getCarttotal(req.session.user._id);
  // console.log(cartTotal,"----------------------------cartTotal----------------------------------------------------------");
  let cartitems = await userHelpers.getCartproducts(req.session.user._id);
  // console.log(cartitems,"----------------------------cartitems----------------------------------------------------------");
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
});

router.get("/delivered_page", (req, res) => {
  res.render("user/deliveredpage", { layout: "main-layout", user: true });
});

router.post("/verify_payment", (req, res) => {
  userHelpers
    .verifyPayment(req.body)
    .then(() => {
      userHelpers.changePaymentStatus(req.body["order[receipt]"]).then(() => {
        console.log("payment success");
        res.json({ status: true });
      });
    })
    .catch((err) => {
      console.log(err);
      res.json({ status: false, errMsg: "" });
    });
});

router.get("/orderlist_page", (req, res) => {
  userHelpers
    .getOrderedItems(req.session.user._id)
    .then((orderlistProducts) => {
      console.log(
        orderlistProducts,
        "-----------------------------------orderlistProducts------------------------"
      );
      res.render("user/orderlistpage", {
        layout: "main-layout",
        user: true,
        orderlistProducts,
        orderlistTable: true,
        orderPlacementDetails: true,
      });
    });
});

router.get("/add-to-wishlist/:id", verifyLogin, (req, res) => {
  // console.log(req.params.id,"----product id",req.session.user._id,"----user id");
  userHelpers.addTowishlist(req.params.id, req.session.user._id).then(() => {
    res.redirect("/");
  });
});

router.get("/wishlist", verifyLogin, (req, res) => {
  userHelpers.getWishlistproducts(req.session.user._id).then((wishproducts) => {
    // console.log("...............wishListproducts.......",wishproducts);
    if (wishproducts) {
      res.render("user/wishlist", {
        layout: "main-layout",
        user: true,
        isuserloggedin: req.session.loggedIn,
        isusersession: req.session.user,
        cartCOUNT: cartCount,
        wishproducts,
      });
    } else {
      res.redirect("/");
    }
  });
});

router.post("/remove_wishlist_product", (req, res) => {
  userHelpers
    .removeFromwishlist(req.session.user._id, req.body.product)
    .then((response) => {
      if (response) {
        // console.log("res", response);
        res.redirect("/wishlist");
      }
    });
});

router.get("/error", (re, res) => {
  res.render("user/error", { layout: "main-layout" });
});

module.exports = router;
