const BASE_URL = 'https://123.57.242.177/Batch/Batch/';

Page({

  data: {
    OrderNo: '',
    Product: '',
    Orderer: '',
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
    const { OrderNo, Orderer, Product } = this.data;
    console.log(OrderNo, Orderer, Product);
    wx.request({
      url: BASE_URL + 'SubmitOrderComments',
      method: 'POST',
      data: {
        OrderNo,
        Orderer,
        Product,
      },
      success: (res) => {
        console.log(res);
        if (res.data.status === 0) {
          wx.showToast({
            title: 'Success',
            icon: 'success',
          });
        } else {
          wx.showToast({
            title: 'Fail',
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
