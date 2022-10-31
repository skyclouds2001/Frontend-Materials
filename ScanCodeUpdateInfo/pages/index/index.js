Page({

  data: {},

  onLoad() {},

  handleScanCode() {
    wx.scanCode({
      onlyFromCamera: true,
    })
      .then((res) => {
        console.log(res);
        wx.navigateTo({
          url: `/pages/update/update?id=${res.result}`,
        });
      })
      .catch((err) => {
        console.error(err);
      });
  },

});
