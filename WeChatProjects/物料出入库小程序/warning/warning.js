import Notify from '../../miniprogram_npm/@vant/weapp/notify/notify';
const db = wx.cloud.database();
const collection = db.collection('material_db');
const $ = db.command.aggregate
Page({

  /**
   * 页面的初始数据
   */
  data: {
    importCount:0,
    data:[]
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
    this.getTotal()
    
  },

  async getTotal(){
      await collection.count().then(res=>{this.setData({total:res.total})});
      for(var j=0;j<this.data.total/20;j++){
        collection.aggregate().skip(j*20).project({
          matched: $.lt(['$material_count', '$warning_line'])
        }).end().then(res => {
          for(var i=0;i<res.list.length;i++){
            if(res.list[i].matched == true){
              collection.where({
                _id : res.list[i]._id
              }).get().then(res => {
                this.setData({
                  data: this.data.data.concat(res.data)
                })
              })
            }
          };
        }).catch(res => {
          wx.showToast({
            title: '失败，请重试！',
          })
        })
      };
  },

    

  importButton: function(e){
    db.collection('material_db').where({
      _id : e.currentTarget.id
    }).get().then(res => {
      this.setData({
        ishow: true,
        targetId: res.data[0]._id,
        targetName: res.data[0].material_name,
        targetCount: res.data[0].material_count
      })
    })
  },
  importCount: function(e){
    this.setData({
      importCount: Number(e.detail)
    })
    
  },
  materialImport: function(e){
    var new_count = Number(this.data.targetCount) + Number(this.data.importCount);
    var date = new Date();
      db.collection('material_db').doc(this.data.targetId).update({
        data:{
          material_count: Number(new_count)
        }
      }).then(res => {
        Notify({ type: 'success', message: '入库成功', duration: '1000'});
        wx.navigateTo({
          url: './warning',
        })
      }).catch(res => {
        Notify({ type: 'warning', message: '请重试', duration: '1000'});
      });
      //写日志
      db.collection('log_db').add({
        data:{
          action: '补货',
          material_name: this.data.targetName,
          material_count: Number(this.data.importCount),
          date: date.getFullYear() + '-' + (date.getMonth()>9?date.getMonth()+1:'0' + (date.getMonth() + 1)) + '-' + (date.getDate()>9?date.getDate():'0'+ date.getDate()) + '\n' + date.getHours()+":"+date.getMinutes()+':'+date.getSeconds(),
          user_name: this.data.user_name,
        }
      })
      //日志结束
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})