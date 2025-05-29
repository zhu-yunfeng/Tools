const db = wx.cloud.database();
const collection = db.collection('log_db');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    data:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    collection.orderBy('date','desc').get().then(res => {
      this.setData({
        data: res.data,
      })
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
    var len = this.data.data.length;
    collection.orderBy('date','desc').skip(len).get().then(res => {
      this.setData({
        data: this.data.data.concat(res.data)
      })
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})