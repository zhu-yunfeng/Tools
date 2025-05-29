// miniprogram/pages/detail/detail.js
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
const db = wx.cloud.database()
const collection = db.collection('material_db')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    status: 0
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

    var material_id = options.id;
    collection.where({
      _id : material_id
    }).get().then(res => {
      this.setData({
        data: res.data[0],
        targetName:res.data[0].material_name,
        targetCount:res.data[0].material_count

      })
    })
  },

  changeSubmit: function(e){
    if (e.detail.value.shelf_idx && e.detail.value.material_name && e.detail.value.material_count && e.detail.value.warning_line){
      collection.doc(this.data.data._id).update({
        data: {
          shelf_idx: e.detail.value.shelf_idx.replace(/^\s*|\s*$/g,"").toUpperCase(),
          material_name: e.detail.value.material_name.replace(/^\s*|\s*$/g,"").toUpperCase(),
          material_count: Number(e.detail.value.material_count),
          warning_line: Number(e.detail.value.warning_line),
          comment: e.detail.value.comment
        },
        success:res=>{
          wx.showToast({
            title: '修改成功',
          });
          // var pages = getCurrentPages();
          // var beforePage = pages[pages.length - 2];
          // console.log(pages)
          // beforePage.setData()
        },
        fail: res=>{
          wx.showToast({
            title: '失败，请重试！',
            icon: "none"
          })
        }
      })
    }else{
      Toast.fail('请输入必填项！');
    }
  },

  onDelete: function(e){
    Dialog.confirm({
      message: '确定要删除这条记录吗？',
    }).then(() => {
      collection.doc(this.data.data._id).remove({
        success:function(res){
           wx.showToast({
             title:"删除成功",
           })
        },
        fail:function(res){
             wx.showToast({
                 title:"失败,请重试",
             })
        }
     });
      var date = new Date();
      db.collection('log_db').add({
        data:{
          action: '删除',
          material_name: this.data.targetName,
          material_count: Number(this.data.targetCount),
          date: date.getFullYear() + '-' + (date.getMonth()>9?date.getMonth()+1:'0' + (date.getMonth() + 1)) + '-' + (date.getDate()>9?date.getDate():'0'+ date.getDate()) + '\n' + date.getHours()+":"+date.getMinutes()+':'+date.getSeconds(),
          user_name: this.data.user_name,
        }
      })
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})