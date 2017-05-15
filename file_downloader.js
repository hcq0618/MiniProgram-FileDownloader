export class FileDownloader {

  constructor(url, fileCacheKey) {
    this.url = url;
    this.fileCacheKey = fileCacheKey;
  }

  //获取文件
  fetch(callBack) {
    //先看是否有文件缓存
    wx.getStorage({
      key: this.fileCacheKey,
      success: function (res) {
        console.log("get file cache success " + res.data);
        if (callBack != null) {
          callBack.success(res.data);
        }
      },
      fail: this._download(callBack)
    })
  }

  //下载文件
  _download(callBack) {
    let fileDownloader = this;
    return function () {
      console.log("start file download");
      wx.downloadFile({
        url: fileDownloader.url,
        success: fileDownloader._downloadSuccess(fileDownloader, callBack),
        fail: function () {
          console.log("download file fail");
          if (callBack != null) {
            callBack.fail();
          }
        }
      });
    };
  }

  //文件下载成功
  _downloadSuccess(fileDownloader, callBack) {
    return function (res) {
      console.log("download file success:" + res.tempFilePath);
      wx.saveFile({
        tempFilePath: res.tempFilePath,
        success: fileDownloader._saveSuccess(fileDownloader, callBack),
        fail: function () {
          console.log("save file cache fail");
          if (callBack != null) {
            callBack.success(res.tempFilePath);
          }
        }
      });
    };
  }

  //文件缓存保存成功
  _saveSuccess(fileDownloader, callBack) {
    return function (res) {
      console.log("save file cache success:" + res.savedFilePath);
      wx.setStorage({
        key: fileDownloader.fileCacheKey,
        data: res.savedFilePath,
      });

      if (callBack != null) {
        callBack.success(res.savedFilePath);
      }
    };
  }
}