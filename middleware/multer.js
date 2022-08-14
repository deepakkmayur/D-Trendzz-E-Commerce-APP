const multer = require('multer')
const uuid = require('uuid').v4;
const path = require('path')


const storage = multer.diskStorage({       
  destination:(req, file, cb)=>{
    cb(null,path.join(__dirname, '../', 'public/multerImage') )
  },
  filename:(req, file, cb) => {
    const {originalname} = file;
    cb(null, `${uuid()}${originalname}`)
  }
})

const fileFilter = (req, file, cb) => {
  if(file.mimetype.split('/')[0] === 'image'){
    return cb(null, true)
  }
  // cb(new Error("error", false))
  cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"),false)     

}


const upload = multer({storage, fileFilter,limits:{fileSize:1000000,files:3}})


module.exports = upload;