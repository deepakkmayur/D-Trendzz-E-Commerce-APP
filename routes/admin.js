const express = require("express");
const { Db } = require("mongodb");
const router = express.Router();            
const objectId = require('mongodb').ObjectId
const adminHelpers = require("../helpers/admin-helpers");
const userHelpers = require("../helpers/user-helpers");

const upload = require("../middleware/multer");


const verifyLogin = function (req, res, next) {
  try {
    if (req.session.isadminLogged) {
      next();
    } else {
      res.redirect("/admin/login");
    }
    
  } catch (error) {
    console.log(error);
    next(error)
  }
};


router.get("/", async (req, res,next)=> {
  try {
    if (req.session.isadminLogged) {
     let totalOrderCount=await adminHelpers.getTotalUsers()
     let totalUserCount=await adminHelpers.getUserCount()
     let onlinePaymentOrderCount=await adminHelpers.getOnlinePaymentCount()
     let CODOrderCount=await adminHelpers.getCODCount()
      res.render("admin/admindashboard", { layout: "admin-main-layout" ,totalOrderCount,totalUserCount,onlinePaymentOrderCount,CODOrderCount});
    } else res.redirect("/admin/login");                
    
  } catch (error) {
   console.log(error);
   next(error) 
  }
});



router.get("/login", (req, res,next) => {
  try {
    if (req.session.isadminLogged) {
      res.redirect("/admin");
    } else
      res.render("admin/adminlogin", {
        adminLogin: true,
        errorMessage: req.flash("key"),
        layout: "admin-main-layout",
      });
    
  } catch (error) {
    console.log(error);
    next(error)
  }
});

router.post("/adminlogin", (req, res,next) => {
  try {
    adminHelpers.doLogin(req.body).then((data) => {
      if (data) {
        req.session.isadminLogged = true;
        res.redirect("/admin");
      } else {
        req.flash("key", "invalid email or password");
        res.redirect("/admin/login");
      }
    });
    
  } catch (error) {
    console.log(error);
    next(error)
  }
});

router.get("/admin_logout", (req, res,next) => {
  try {

    if (req.session.isadminLogged) {
      req.session.destroy((err) => {
        if (err) throw err;
        res.redirect("/admin");
      });
    } else {
      res.redirect("/admin");
    }
    
  } catch (error) {
    console.log(error);
    next(error)
  }
});





router.get("/add_product",verifyLogin, (req, res,next) => {
  try {
    adminHelpers.findCategory().then((category)=>{   
    
      if (req.session.isadminLogged) {
        res.render("admin/addproducts", { layout: "admin-main-layout", errorMessage:req.flash('error'),category });
      } else {
        res.redirect("/admin/login");
      }
    })     
    
  } catch (error) {
    console.log(error);
    next(error)
  }


});

router.post("/add_product", upload.array("image", 3), (req, res,next) => {
  try {
    const img_id = [];    
    req.files.forEach((element) => {              
      img_id.push(element.filename);
    });
  
    //image will be saved as 'img_id' in database
    req.body.img_id = img_id;
    req.body.category = objectId(req.body.category)
  
    adminHelpers.doAddproduct(req.body).then((data) => {                                          
      if (data) {
       
  
        res.redirect("/admin/admin_product");
      } else {
        res.redirect("/admin/add_product");
      }
    });
    
  } catch (error) {
    console.log(error);
    next(error)
  }
});


router.get("/admin_product",verifyLogin, (req, res,next) => {   
 try {
  
   if (req.session.isadminLogged) {
     adminHelpers.showProduct().then((products) => {
      
       res.render("admin/adminproducts", {
         layout: "admin-main-layout",
          products,
       });
     });
   } else {
     res.redirect("/admin/login");
   }
 } catch (error) {
  console.log(erro);
  next(error)
 }
 
});

router.get("/edit_product/:id",verifyLogin, (req, res,next) => {
 try {
   if (req.session.isadminLogged) {
     adminHelpers.doEditpage(req.params).then((foundData) => {
 
       res.render("admin/adminEditproduct", {
         layout: "admin-main-layout",
         editProduct: foundData,
       });
     });
   } else {
     res.redirect("/admin/login");
   }
  
 } catch (error) {
  console.log(error);
  next(error)
 }
});




router.post("/edit_product/:id",upload.array("image", 3),(req, res,next) => {
try {
  const img = [];

  req.files.forEach((element)=>{       
    img.push(element.filename)
  })
  req.body.img_id = img
  adminHelpers
    .doEditproduct(req.body, req.params)
    .then((data) => {
      if(data){
        res.redirect('/admin/admin_product')
         
      }else{
        console.log('error');
      }
   
    })
    .catch((err) => {
      res.redirect("/admin/error");
    });
  
} catch (error) {
  console.log(error);
  next(error)
}
});





router.get("/delete_product/:id", (req, res,next) => {
try {
  adminHelpers
    .doDeleteproduct(req.params)
    .then((data) => {
      if (data) {
        res.redirect("/admin/admin_product");
      }
    })
    .catch((err) => {
      res.redirect("/admin/error");
    });
  
} catch (error) {
  console.log(error);
  next(error)
}
});


router.get('/user_management', verifyLogin,(req,res,next)=>{
  try {
    adminHelpers.userManagement().then((userdetails)=>{
      if(userdetails){
        res.render('admin/adminUsermanagement',{ layout: "admin-main-layout",userdetails })
    
      }else{
        res.redirect('/admin')
      }
    })
    
  } catch (error) {
    console.log(error);
    next(error)
  }
})



router.get('/order_management',verifyLogin,(req,res,next)=>{
try {
  adminHelpers.orderManagement().then((allOrders)=>{
 
   res.render('admin/adminOrderManagement',{layout:"admin-main-layout",allOrders})
  })
  
} catch (error) {
  console.log(error);
  next(error)
}
})






router.get('/block_user/:id',(req,res,next)=>{  
      try {
        adminHelpers.blockUser(req.params).then((data)=>{   
          if(data){
            res.redirect('/admin/user_management')
      
          }else{
      
            res.redirect('/admin/user_management')
          }
        }) 
        
      } catch (error) {
        console.log(error);   
        next(error)
      }
})


router.get('/unblock_user/:id',(req,res,next)=>{
try {
  adminHelpers.unblockUser(req.params).then((data)=>{
    if(data){
      res.redirect('/admin/user_management')
    }else{
      res.redirect('/admin/user_management')
    }
  })  
  
} catch (error) {
  console.log(error);
  next(error)
}
})


router.get("/admin_viewOrder",async(req,res,next)=>{ 
  try {
    if (req.session.isadminLogged) {
       let orderedProducts=await adminHelpers.bringOrderDetails(req.query.id)
   
       res.render('admin/admin-viewOrder',{ layout: "admin-main-layout",orderedProducts })
     }
    
  } catch (error) {
    console.log(error);
    next(error)
  }  
})


router.get('/change_status',async (req,res,next)=>{
  try {
    let statusUpdate=await adminHelpers.adminUpdateStatus(req.query.id,req.query.status)
     if(statusUpdate){    
     let userId=req.query.userId
       res.redirect("back")    
     }
    
  } catch (error) {
    console.log(error);
    next(error)
  }
})

router.get('/view_userProduct',(req,res,next)=>{
try {
 const productDetails= userHelpers.viewEachproduct(req.params.id)
  
} catch (error) {
  console.log(error);
  next(error)
}


})

router.get('/coupon_management',verifyLogin,async (req,res,next)=>{        
try {
 
   const couponDetails=await adminHelpers.getCouponDetails()
   console.log(couponDetails,"========================================couponDetails");
  

  res.render('admin/couponManagement',{ layout: "admin-main-layout",couponDetails })
  
} catch (error) {
  console.log(error);
  next(error)
}
})

router.get('/generate_coupon',verifyLogin,(req,res,next)=>{
  try {
 
    res.render('admin/generateCoupon',{ layout: "admin-main-layout" })
    
  } catch (error) {
    console.log(error);
    next(error)
  }
  })

router.post('/generate_coupon',async(req,res,next)=>{    
  try {
    req.body.coupon_code=req.body.coupon_code.toUpperCase()
 
    await adminHelpers.generateCoupon(req.body)
    res.redirect('/admin/coupon_management')
    
  } catch (error) {
    console.log(error);
    next(error)
  }

})


router.get('/delete_coupon',async(req,res,next)=>{    
  try {
  
    
    await adminHelpers.deleteCoupon(req.query.id)
    res.redirect('/admin/coupon_management')
    
  } catch (error) {
    console.log(error);
    next(error)
  }

})

router.get('/coupon_status',async(req,res,next)=>{    
  try {
    // console.log(req.query,"----------------------status");    
    await adminHelpers.couponStatusChange(req.query.id,req.query.status)
    res.redirect('back')
    
  } catch (error) {
    console.log(error);
    next(error)
  }

})






router.get("/error", (req, res) => {
  res.render("admin/adminerrorpage", { layout: "admin-main-layout" });
});

module.exports = router;
