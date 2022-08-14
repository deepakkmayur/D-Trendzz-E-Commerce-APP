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

