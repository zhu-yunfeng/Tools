// miniprogram/pages/change/change.js
const db = wx.cloud.database();
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
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

navigateToDetail: function(e){
  wx.navigateTo({
    url: '../detail/detail?id='+e.currentTarget.id,
  })
},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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