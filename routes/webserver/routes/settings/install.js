const express = require('express')
    , router = express.Router()
    , passport = require('passport')
    , api = require(rootDir+'/lib/api/api');
let isNone

router.get('/',ensureAuthenticated,(req, res) =>{


  api.getDepartments()
  .then((response)=>{
    if(response.data < 1){
      isNone = true}else{isNone = false}
       res.render('./pages/setting/install',{
      title: "Site First Setup Configuration - Dimension Data Bot Portal",
      user:req.user,
      none: isNone
    })
  }).catch((error)=>{
      console.log(error)
      res.send(error)
  })
   
  })

  router.post('/',ensureAuthenticated,(req, res) =>{
    console.log('Generating New Setting')
    if(isNone === false){
      api.postSetting(req.body).then((response)=>{
          res.redirect('/dashboard')
      }).catch((error)=>{
          res.send(error)
      })
    }else{
      api.postSetting(req.body).then((response)=>{
          return api.postLuisApp(req.body.name).then((response)=>{
          return api.postDepartment(req.body,response.data)
      }).then((response)=>{
        let array={department:response.data._id}
        return api.putUser(req.user._id,array)
      })
      }).then((response)=>{
          res.redirect('/dashboard')
      }).catch((error)=>{
          console.log(error)
          res.send(error)
      })
    }
});

module.exports = router
