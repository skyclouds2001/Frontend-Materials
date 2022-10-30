Page({

  data: {
    id: ''
  },

  onLoad(options) {
    console.log(options);
    const { url } = options;

    wx.request({
      url: url,
      method: 'GET',
      data: {
        id: ''
      },
      success: (res) => {
        console.log(res);
        this.setData({
          id: 'test'
        })
      },
      fail: (err) => {
        console.error(err);
      }
    })
  },

  postData() {
    wx.request({
      url: url,
      method: 'POST',
      success: (res) => {
        console.log(res);
      },
      fail: (err) => {
        console.error(err);
      }
    })
  },

})
