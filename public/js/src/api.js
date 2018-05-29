const host = window.location.protocol+'//'+window.location.hostname
//ask for web notification
function spawnNotification(theBody,theIcon,theTitle) {
    var options = {
        body: theBody,
        icon: theIcon
    }
    var n = new Notification(theTitle,options);
  }
//standard get
function ajaxGet (url){
  return axios.get(host+url)
}
//standard delete
function ajaxDelete(url){
  console.log(host+url)
  axios.delete(host+url).then((response)=>{
    swal("Sucessfully Deleted!", response.data, "success").then((value) => {
        switch (value) {
          default:
            window.history.go(-1); return false;
        }
    });
  }).catch((error)=>{
    swal("uh-oh!",error.response.data,'error');
  })
}
// Create
function ajaxPost (url, array){
  axios.post(host+url,array).then((response)=>{
    swal(response.data);
  }).catch((error)=>{
    swal(error.response.data);
  })
}
// Update
function ajaxPut (url, array){
  axios.delete(host+url,array).then((response)=>{
    swal(response.data);
    window.location.replace("http://stackoverflow.com");
  }).catch((error)=>{
    swal(error.response.data);
  })
}

// Models and pages
// view department
function botMesageEndpoint(id){
  let host = window.location.protocol+'//'+window.location.hostname;
  let botUrl = host + '/bot/'+id+'/messages';
  botEnd.innerHTML= botEnd.innerHTML +' '+ botUrl
}
//Train Department
function trainDepartment(id,type){
  let url = window.location.protocol+'//'+window.location.hostname+'/department/'+id+"/train"
    if(type==='post'){
      return axios.post(url)
    }else{
      return axios.get(url)    
    }
  }

//get luis intents
function getLuisIntents(id){
    let url = window.location.protocol+'//'+window.location.hostname+'/department/'+id+"/intents";
    return axios.get(url)
}
// check department status
function departmentStatus(id) {
  axios.all([getLuisIntents(id), trainDepartment(id)])
    .then(axios.spread((intents, status)=> {
      let failed,
          trainTable = document.getElementById('train-list'),
          trainList = trainTable.innerHTML
      if(status.data!==''){
          for(let i=0; i< status.data.length; i++){
            if(status.data[i].details.status === "Fail"){
              intents.data.forEach((item,index)=>{
                if(item.id === status.data[i].modelId){
                  trainList = trainList+'<tr><td>'+item.name+'</td>'+'<td>'+status.data[i].details.status+'</td>'+'<td>'+status.data[i].details.failureReason+'</td></tr>'
                }
              })
              trainTable.innerHTML = trainList
              failed = true
            }
          }
          if(failed !==true){
            for(let i=0; i< status.data.length; i++){
              if(status.data[i].details.status === "Success"){
                intents.data.forEach((item,index)=>{
                  if(item.id === status.data[i].modelId){
                    trainList = trainList+'<tr><td>'+item.name+'</td>'+'<td>'+status.data[i].details.status+'</td>'+'<td> N/A </td></tr>'
                  }
                })
                trainTable.innerHTML = trainList
                failed = false
              }
            }
          }
        trainStatus(failed)
      }else{
        swal('Department Info','Department Bot needs to train first','info')
        spawnNotification('Department Bot needs to train first','','Department Info')
        trainModel(id)
      }
    })
  );
}
// Train Modal
function trainModal(id){
    trainDepartment(id,'post').then((resp)=>{
        if(typeof status.data.error !== 'undefined'){
          spawnNotification(status.data.error.message,'','Training Error')
          swal('Training Error',status.data.error.message,'error')
        }else if(typeof status.data.status !== 'undefined'){
          spawnNotification(status.data.status,'','Training Status')
          swal('Training Status',status.data.status,'success')
        }
        departmentStatus(id)
      }).catch((err)=>{
          spawnNotification(err,'','Training Error');
          swal('Training Error',err,'error');
      })
}
// Train Status
function trainStatus(failed){
    let trainStatus = document.getElementById('train-status'),
        trainBtn = document.getElementById('trainBtn'),
        trainP = document.getElementById('trainP')
    if(failed===false){
        trainBtn.title="Bot training is up to date";
        trainBtn.classList.remove('btn-info')
        trainBtn.classList.add('btn-secondary')
        trainStatus.classList.add('fa-check')
        trainStatus.classList.add('text-success')
        trainP.innerHTML = `Department training was a success! Nothing to see here <span class="btn-right"><button class="btn btn-info" onclick = 'reloadBot("<%=data._id%>")'>Train Department</button></span>`;
        spawnNotification('Department is up to date!','','Bot is good to go!!!')
    }else{
        trainBtn.title="Bot needs training!!!"
        trainBtn.classList.remove('btn-info')
        trainBtn.classList.add('btn-warning')
        trainStatus.classList.add('fa-exclamation')
        trainStatus.classList.add('text-danger')
        trainP.innerHTML = "Department training Failed! <span class='btn-right'><button class='btn btn-info' onclick = 'trainModel()'>Train Department</button></span> <p> FewLabels = Not enough Utterances for practical use!</p>"
        spawnNotification('Department training Failed!','','Bot needs training!!!')
        swal('Department training Failed!','Bot needs training!!!','warning')
    }
    document.getElementById('train-table').classList.add('table')
}
// delete department
function deleteDepartment(id){
    let url = window.location.protocol+'//'+window.location.hostname+'/department/'+id,
        delBtn = document.getElementById('delDepartmentBtn');
    delBtn.onclick=ajaxDelete(url)
    $(".bd-delete-modal").modal()
}
//check bing
function checkBing(){
    var bingKey = document.getElementById('bingApiKey'),bingStatus= document.getElementById('bingApiStatus')
    if(bingKey.value === '' && bingStatus.value === 'Enabled'){
        bingKey.required=true
    }else{
        bingKey.required=false
    }
}
// post intent
function postIntent(){
    var postIntent = document.getElementById('newIntent');
    swalt('button clicked')
    postIntent.submit();
}

// delete intent
function deleteIntent(id){
    let url = window.location.protocol+'//'+window.location.hostname+'/intents/'+id,
        delBtn = document.getElementById('delIntentBtn');
    delBtn.onclick=ajaxDelete(url)
    $(".bd-delete-modal").modal()
}
function activateBots(){
  let url = `/bot/dynamic`
  axios.post(host+url).then((response)=>{
    spawnNotification('All Department Bots are Active!!!!','','Activation Sucess')
    swal('Activation Sucess','All Department Bots are Active!!!!','sucess')
  }).catch((error)=>{
    swal(error.response.data);
  })
}
function reloadBot(id){
  let url =`/bot/${id}/dialogs`
  axios.post(host+url).then((response)=>{
    spawnNotification('Bot Dialogs are now Active!!!!','','Activation Sucess')
    swal('Activation Sucess','Bot Dialogs are now Active!!!!','sucess')
  }).catch((error)=>{
    swal(error.response.data);
  })
}
function reloadBots(){
  let url = `/bot/all-dialogs`
  axios.post(host+url).then((response)=>{
    spawnNotification('All Bots Dialogs are Active!!!!','','Activation Sucess')
    swal('Activation Sucess','All Bots Dialogs are Active!!!!','sucess')
  }).catch((error)=>{
    swal(error.response.data);
  })
}