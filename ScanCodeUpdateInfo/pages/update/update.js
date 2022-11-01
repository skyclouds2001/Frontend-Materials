const BASE_URL = 'https://www.foodmemory.com.cn:8443/Batch/Batch/';

Page({

  data: {
    OrderNo: '',
    Product: '',
    Orderer: '',
    Comments: '',
  },

  onLoad(options) {
    console.log(options);
    const { id } = options;

    wx.request({
      url: BASE_URL + 'GetOrderInfo',
      method: 'GET',
      data: {
        OrderNo: id,
      },
      success: (res) => {
        console.log(res);
        const { JsonData: data } = res.data;
        console.log(data);
        const { OrderNo, Orderer, Product } = JSON.parse(data);
        console.log(OrderNo, Orderer, Product);
        this.setData({
          OrderNo,
          Product,
          Orderer,
        });
      },
      fail: (err) => {
        console.error(err);
      },
    });
  },

  postData() {
    const { Comments, OrderNo } = this.data;
    console.log(OrderNo, Comments);
    wx.request({
      url: BASE_URL + 'SubmitOrderComments',
      method: 'POST',
      data: {
        orderNo: OrderNo,
        comments: Comments,
      },
      success: (res) => {
        console.log(res);
        if (res.data.Status === 0) {
          wx.showToast({
            title: '更新成功',
            icon: 'success',
          });
        } else {
          wx.showToast({
            title: '更新失败',
            icon: 'error',
          });
        }
      },
      fail: (err) => {
        console.error(err);
      },
    });
  },

});
