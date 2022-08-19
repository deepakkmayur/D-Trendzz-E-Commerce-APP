$(document).ready(() => {
   $(".inc").on("click", (eve) => {

      const value = $('#qty-input').val()
      const productid = $('#productID').val() 

      console.log(value, productid)

      $.ajax({
         type: 'POST',
         url: '/cart/increment_quantity',
         data: { incValue: value, productID:productid },
         success: (res) => {
            // document.location.reload()
            $('#refresh-section').load(location.href + " #refresh-section");
            console.log("success")
         }
      })
   })
})

function removeProduct(productId) {
   $(document).ready(()=> {
      $.ajax({
         url: '/remove_wishlist_product',
         data: {
            product: productId
         },
         method: "post",
         success: (response) => {
            $("#refresh-section").load(location.href + "#refresh-section")
         }
      })
   })
}


function addToWishlist(productID){
   $.ajax({
      url:'/add-to-wishlist',
      data:{productID},
      method:'post',
      success:(res)=>{
         
      }
   })
}

function addToCart(productID){
   $.ajax({
      url:'/ADD_TO_CART',
      data:{productID},
      method:'post',
      success:()=>{
         
      }
   })
}


function filterWomen(CATEGORY){
   $(document).ready(()=>{
  $.ajax(
    {
             url: '/category_filter',
             data: {
                category:CATEGORY
             },
             method: "post",
             success: (response) => {
               $("#refresh-section").load(location.href + " #refresh-section")                       
             }
          }
  )
 })
 }


  function filterMen(CATEGORY){
   $(document).ready(()=>{
  $.ajax(
    {
             url: '/category_filter',
             data: {
                category:CATEGORY
             },
             method: "post",
             success: (response) => {
               $("#refresh-section").load(location.href + " #refresh-section")                       
             }
          }
  )
 })
 }

 function allProducts(){
    $(document).ready(()=>{
       $.ajax(
          {
            url:'/shop' ,
             method: "get",
               success: (response) => {
                console.log("success")
               $("#refresh-section").load(location.href + " #refresh-section")                       
             }
          }
       )
    })
 }

