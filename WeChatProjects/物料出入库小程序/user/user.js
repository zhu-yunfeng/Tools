import Notify from '../../miniprogram_npm/@vant/weapp/notify/notify';
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';
const db = wx.cloud.database();
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    importCount:0,
    exportCount:0,
    data: []
  },

onChange(e) {
    var key = e.detail;
    // var len = this.data.data.length;
    this.setData({
      key: key,
      data: []
    });
    if (e.detail=='*'){
      db.collection('material_db').orderBy("shelf_idx","asc").orderBy("material_name","asc").get().then(res => {
          this.setData({
            data: res.data,
          })
        })
    }else{
      db.collection('material_db').where(_.or([{
        material_name: db.RegExp({
            regexp: '.*' + key,
            options: 'i',
          })
        },
        {
          shelf_idx: db.RegExp({
            regexp: '.*' + key,
            options: 'i',
          })
        },
      ])).orderBy("shelf_idx","asc").orderBy("material_name","asc").get({
        success: res => {
          this.setData({
            data: res.data
          })
        },
      })
    }
},

importButton: function(e){
  db.collection('material_db').where({
    _id : e.currentTarget.id
  }).get().then(res => {
    this.setData({
      status:0,
      ishow: true,
      targetId: res.data[0]._id,
      targetName: res.data[0].material_name,
      targetCount: res.data[0].material_count
    })
  })
},
importCount:function(e){

  this.setData({
    importCount: Number(e.detail)
  });
},
materialImport: function(e){
  var new_count = Number(this.data.targetCount) + Number(this.data.importCount);
  var date = new Date();
  this.setData({
    status:1
  })
    db.collection('material_db').doc(this.data.targetId).update({
      data:{
        material_count: Number(new_count)
      }
    }).then(res => {
      Notify({ type: 'success', message: '入库成功', duration: '1000'});
    }).catch(res => {
      Notify({ type: 'warning', message: '请重试', duration: '1000'});
    });
    //写日志
    if(this.data.status==1){
    db.collection('log_db').add({
      data:{
        action: '入库',
        material_name: this.data.targetName,
        material_count: Number(this.data.importCount),
        date: date.getFullYear() + '-' + (date.getMonth()>9?date.getMonth()+1:'0' + (date.getMonth() + 1)) + '-' + (date.getDate()>9?date.getDate():'0'+ date.getDate()) + '\n' + date.getHours()+":"+date.getMinutes()+':'+date.getSeconds(),
        user_name: this.data.user_name,
      }
    })
  }
    //日志结束
  
},

exportButton: function(e){
  db.collection('material_db').where({
    _id : e.currentTarget.id
  }).get().then(res => {
    this.setData({
      status:0,
      eshow: true,
      targetId: res.data[0]._id,
      targetName: res.data[0].material_name,
      targetCount: res.data[0].material_count
    })
  })
},
exportCount:function(e){
  this.setData({
    exportCount: Number(e.detail)
  })
},
materialExport: function(e){
  var new_count = Number(this.data.targetCount) - Number(this.data.exportCount);
  var date = new Date();
  if (new_count < 0){
    Toast.fail('物料不足，请补货！');
  }else{ 
    this.setData({status:1});
  db.collection('material_db').doc(this.data.targetId).update({
      data:{
        material_count: Number(new_count)
      }
    }).then(res => {
      Notify({ type: 'success', message: '出库成功', duration: '1000'});
    }).catch(res => {
      Notify({ type: 'warning', message: '请重试', duration: '1000'});
    })
  };
  //写日志
  if(this.data.status==1){
  db.collection('log_db').add({
    data:{
      action: '出库',
      material_name: this.data.targetName,
      material_count: Number(this.data.exportCount),
      date: date.getFullYear() + '-' + (date.getMonth()>9?date.getMonth()+1:'0' + (date.getMonth() + 1)) + '-' + (date.getDate()>9?date.getDate():'0'+ date.getDate()) + '\n' + date.getHours()+":"+date.getMinutes()+':'+date.getSeconds(),
      user_name: this.data.user_name,
    }
  })
}
  //日志结束
},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.getUserInfo({
      success: function(res) {
          var user_name = res.userInfo.nickName
          that.setData({user_name: user_name})
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var key = this.data.key;
    var len = this.data.data.length;
    if(key=='*'){
      db.collection('material_db').orderBy("shelf_idx","asc").orderBy("material_name","asc").skip(len).get().then(res => {
        this.setData({
          data: this.data.data.concat(res.data)
        })
      })
    }else{
      db.collection('material_db').where(_.or([{
        material_name: db.RegExp({
            regexp: '.*' + key,
            options: 'i',
          })
        },
        {
          shelf_idx: db.RegExp({
            regexp: '.*' + key,
            options: 'i',
          })
        },
      ])).orderBy("shelf_idx","asc").orderBy("material_name","asc").skip(len).get({
        success: res => {
          this.setData({
            data: this.data.data.concat(res.data)
          })
        },
      })
    };
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})