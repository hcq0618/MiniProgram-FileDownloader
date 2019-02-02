import {
  LRUDiscCache
} from "lru-disk-cache"

export class FileDownloader {

  constructor() {
    this.cache = new LRUDiscCache();
  }

  //获取文件
  fetch(url, callBack) {
    if (url == null || url == "") {
      return;
    }

    let fileDownloader = this;
    //先看是否有文件缓存
    this.cache.get(url, function(data) {
      if (data == null) {
        fileDownloader._download(url, callBack);
      } else {
        if (callBack != null) {
          callBack.success(data.path);
        }
      }
    });
  }

  //下载文件
  _download(_url, callBack) {
    console.log("start file download");
    wx.downloadFile({
      url: _url,
      success: this._downloadSuccess(_url, callBack),
      fail: function() {
        console.log("download file fail");
        if (callBack != null) {
          callBack.fail();
        }
      }
    });
  }

  //文件下载成功
  _downloadSuccess(url, callBack) {
    let fileDownloader = this;
    return function(res) {
      console.log("download file success:" + res.tempFilePath);

      fileDownloader.cache.set(url, res.tempFilePath, function(filePath) {
        if (callBack != null) {
          callBack.success(filePath);
        }
      });
    };
  }

  //清除缓存
  removeCache() {
    this.cache.removeCache();
  }

  removeCache(url) {
    this.cache.removeCache(url);
  }

  removeAllCaches() {
    this.cache.removeAllCaches();
  }
}