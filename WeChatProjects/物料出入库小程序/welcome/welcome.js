//index.js
Page({

  data: {
    button_text:'授权登录'
  },

  onLoad: function (options) {
    var that = this;
    wx.getSetting({
      success (res){
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function(res) {
              that.setData({
                button_text:'立即进入'
              })
            }
          })
        }
      }
    })

  },
  onAuth(){
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userInfo']) {
          wx.reLaunch({
            url: '../index/index',
          })
        }
      }
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
    return{
      title: "物料耗材出入库小程序",
      path: "",
    }
  }
})