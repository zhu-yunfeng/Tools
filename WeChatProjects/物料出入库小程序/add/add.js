import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';
const db = wx.cloud.database();
const material_db = db.collection('material_db');

Page({

  data: {
    
  },

  onLoad: function (options) {
    var that = this;
    wx.getUserInfo({
      success: function(res) {
          var user_name = res.userInfo.nickName
          that.setData({user_name: user_name})
      }
    });
  },

  addSubmit: function(e){
    this.setData({status:0})
    var date = new Date();
    if (e.detail.value.shelf_idx && e.detail.value.material_name && e.detail.value.material_count && e.detail.value.warning_line){
      this.setData({
        status:1,
        material_name:e.detail.value.material_name.toUpperCase(),
        material_count:e.detail.value.material_count
      })
      material_db.add({
          data:{
            shelf_idx: e.detail.value.shelf_idx.replace(/^\s*|\s*$/g,"").toUpperCase(),
            material_name: e.detail.value.material_name.replace(/^\s*|\s*$/g,"").toUpperCase(),
            material_count: Number(e.detail.value.material_count),
            warning_line: Number(e.detail.value.warning_line),
            comment: e.detail.value.comment,
            date: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(),
            user_name: this.data.user_name,
          }
        }).then(res => {
          wx.showToast({
            title: '入库成功',
          })
          this.setData({
            clear_info: "",
          })
        }).catch(res => {
          wx.showToast({
            title: '失败，请重试！',
            icon: "none"
          })
        })
      }
      else{
        Toast.fail('请输入必填项！');
      };

          //写日志
    if(this.data.status==1){
      db.collection('log_db').add({
        data:{
          action: '新增',
          material_name: this.data.material_name,
          material_count: Number(this.data.material_count),
          date: date.getFullYear() + '-' + (date.getMonth()>9?date.getMonth()+1:'0' + (date.getMonth() + 1)) + '-' + (date.getDate()>9?date.getDate():'0'+ date.getDate()) + '\n' + date.getHours()+":"+date.getMinutes()+':'+date.getSeconds(),
          user_name: this.data.user_name,
        }
      })
    }
      //日志结束
  },

  clearButton: function(){
    this.setData({
      clear_info: ""
    })
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