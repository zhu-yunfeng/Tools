Page({

  data: {

  },
tar_conc:function(e){
  this.setData({
    tar_conc:e.detail.value
  })           
},
tar_vol:function(e){
  this.setData({
    tar_vol:e.detail.value
  })           
},
strat_con:function(e){
  this.setData({
    strat_con:e.detail.value
  })           
},
max_fold:function(e){
  this.setData({
    max_fold:e.detail.value
  })           
},
min_vol:function(e){
  this.setData({
    min_vol:e.detail.value
  })  

},



ok:function(){
  const min_vol =  this.data.min_vol;
  var step_dict = {};
  function dict_write(step,fold,target_volume){
  var drug_vol =  Math.ceil(target_volume / fold);  
  if (drug_vol < min_vol){
    drug_vol = min_vol
    var buffer_vol = min_vol * (fold - 1)
  }
  else{
    var buffer_vol = drug_vol * (fold - 1)
  }
  step_dict[step] = [Number(drug_vol),Number(buffer_vol)];
  return drug_vol
  }

  

  var sum_fold = this.data.strat_con / this.data.tar_conc,
      cacu_times = Math.ceil(Math.log(sum_fold) / Math.log(this.data.max_fold)),
      ave_fold = Math.pow(sum_fold,1/cacu_times),
      act_fold = Math.round(ave_fold);
  
  var	 dilute_times = 0,
     residual_fold = sum_fold;
  var concentration = {};
  var step_conc = this.data.strat_con;
  while (residual_fold >= this.data.max_fold){
    residual_fold /= act_fold;
    dilute_times += 1;
    step_conc /=  act_fold;
    concentration[dilute_times] = step_conc;
  }
  if (residual_fold !== 1){
    dilute_times += 1;
    step_conc /=  residual_fold;
    concentration[dilute_times] = step_conc;
    var drug_vol = dict_write(1,residual_fold,this.data.tar_vol)
  }
  else{
    drug_vol = dict_write(1,act_fold,this.data.tar_vol)
  }

  this.setData({
    conclusion:'需要稀释' + dilute_times + '次，总稀释倍数为' + sum_fold.toFixed(2)
  })           
  
  for (var step = 2; step <= dilute_times; step++ ){
        var tar_vol = 1.5 * drug_vol
        drug_vol = dict_write(step,act_fold,tar_vol)
  }

  
  var response = ''
  for (var i = 1; i <= dilute_times; i++ ){	
    response += '第'+ i +'次：原液' +step_dict[dilute_times + 1 - i][0]+ 'uL ，缓冲液 '+ (step_dict[dilute_times + 1 - i][1]).toFixed(2) + 'uL ，稀释倍数'+((step_dict[dilute_times+1-i][0] + step_dict[dilute_times+1-i][1])/step_dict[dilute_times+1-i][0]).toFixed(2) + '倍，浓度' + concentration[i].toFixed(2) + 'ng/mL' +'\n';
  }
  this.setData({
    response:response
  })
},

reset:function () {
  this.setData({
    tar_conc:'',
    tar_vol:'',
    strat_con:'',
    max_fold:'',
    min_vol:''
  })
},

sign:function() {
  wx.showToast({
    title: '+vx：zyf348393381',
    icon:"none",
    duration:4000
  })
  
}



})