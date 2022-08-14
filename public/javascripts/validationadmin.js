

 console.log("reaching here");    


$(document).ready(function(){
   
  
 console.log("reaching here 2 ");

  $("Adminlogin").validate({
    errorClass: "valierrors",

    rules:{
     
      email:{
        required:true,
        email:true
      },

      password:{
        required:true,
        minlength: 5
      },
     
    }
  })
})


