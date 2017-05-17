
export class FileDownloader {

  constructor(url) {
    this.cache = new LRUDiscCache();
    this.url = url;
  }

  setUrl(url) {
    this.url = url;
  }

  isUrlEmpty(url) {
    return url == null || url == "";
  }

  //获取文件
  fetch(callBack) {
    if (this.isUrlEmpty(this.url)) {
      return;
    }

    let fileDownloader = this;
    //先看是否有文件缓存
    this.cache.get(this.url, function (data) {
      if (data == null) {
        fileDownloader._download(callBack);
      } else {
        if (callBack != null) {
          callBack.success(data.path);
        }
      }
    });
  }

  //下载文件
  _download(callBack) {
    console.log("start file download");
    wx.downloadFile({
      url: this.url,
      success: this._downloadSuccess(callBack),
      fail: function () {
        console.log("download file fail");
        if (callBack != null) {
          callBack.fail();
        }
      }
    });
  }

  //文件下载成功
  _downloadSuccess(callBack) {
    let fileDownloader = this;
    return function (res) {
      console.log("download file success:" + res.tempFilePath);

      fileDownloader.cache.set(fileDownloader.url, res.tempFilePath, function (filePath) {
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

const disc_cache_key_prefix = "FileDownloader-";

//LRU磁盘缓存策略
class LRUDiscCache {

  _generateKey(url) {
    return disc_cache_key_prefix + url;
  }

  get(url, callBack) {
    let key = this._generateKey(url);

    wx.getStorage({
      key: key,
      success: function (res) {
        console.log("get file cache success " + res.data.path + " " + res.data.accessTime);

        let timeStamp = new Date().getTime();//当前时间戳

        //刷新访问时间戳
        wx.setStorage({
          key: key,
          data: {
            path: res.data.path,
            accessTime: timeStamp
          }
        });

        if (callBack != null) {
          callBack(res.data);
        }
      },
      fail: function () {
        if (callBack != null) {
          callBack(null);
        }
      }
    });

  }

  set(url, tempFilePath, callBack) {
    let cache = this;

    wx.getSavedFileList({
      success: function (res) {
        let totalSize = 0;
        for (let index in res.fileList) {
          let file = res.fileList[index];
          totalSize += file.size / 1024;//kb
        }
        console.log("file cache total size " + totalSize + " kb");

        //larger than 8 M
        if (totalSize >= (10 * 1024 * 0.8)) {
          //需要清理下缓存空间
          console.log("file cache need optimize");

          cache._optimizeSpace(url, tempFilePath, callBack);
        } else {
          cache._set(url, tempFilePath, callBack);
        }
      }
    });
  }

  _optimizeSpace(url, tempFilePath, callBack) {
    let cache = this;

    wx.getStorageInfo({
      success: function (res) {
        let keys = res.keys;
        let fileCaches = [];

        for (let index in keys) {
          let key = keys[index];

          if (key.indexOf(disc_cache_key_prefix) >= 0) {
            try {
              let data = wx.getStorageSync(key);
              if (data != null) {
                fileCaches.push({
                  key: key,
                  path: data.path,
                  accessTime: data.accessTime
                });
              }
            } catch (e) {
              // console.log("_optimizeSpace getStorageSync " + e);
            }
          }
        }

        // console.log("_optimizeSpace fileCaches " + fileCaches.length);

        if (fileCaches.length > 1) {
          fileCaches.sort(function (a, b) {
            return a.accessTime - b.accessTime;
          });

          // for (let i = 0; i < fileCaches.length; i++) {
          //   let fileCache = fileCaches[i];
          //   console.log("_optimizeSpace fileCache " + fileCache.accessTime);
          // }

          //free 40% space
          let deleteNum = parseInt(fileCaches.length * 0.4) + 1;

          for (let i = 0; i < deleteNum; i++) {
            let fileCache = fileCaches[i];

            cache._removeFileAndStorage(fileCache.key, fileCache.path);
          }

        } else if (fileCaches.length == 1) {
          let fileCache = fileCaches[0];

          cache._removeFileAndStorage(fileCache.key, fileCache.path);
        }

        cache._set(url, tempFilePath, callBack);
      },
      fail: function () {
        cache._set(url, tempFilePath, callBack);
      }
    });
  }

  _set(url, tempFilePath, callBack) {
    wx.saveFile({
      tempFilePath: tempFilePath,
      success: this._saveSuccess(url, callBack),
      fail: function () {
        console.log("save file cache fail");
        if (callBack != null) {
          callBack(tempFilePath);
        }
      }
    });
  }

  //文件缓存保存成功
  _saveSuccess(url, callBack) {
    let fileDownloader = this;

    return function (res) {
      let key = fileDownloader._generateKey(url);
      let timeStamp = new Date().getTime();//当前时间戳
      console.log("save file cache success:" + res.savedFilePath + " " + timeStamp);

      wx.setStorage({
        key: key,
        data: {
          path: res.savedFilePath,
          accessTime: timeStamp
        }
      });

      if (callBack != null) {
        callBack(res.savedFilePath);
      }
    };
  }

  //清除缓存
  removeCache() {
    this.removeCache(this.url);
  }

  removeCache(url) {
    if (this.isUrlEmpty(url)) {
      return;
    }

    key = this._generateKey(url);

    this._removeCache(key);
  }

  _removeCache(key) {
    let cache = this;

    wx.getStorage({
      key: key,
      success: function (res) {
        console.log("get file cache success " + res.data.path + " " + res.data.accessTime);

        cache._removeFileAndStorage(key, res.data.path);
      }
    });
  }

  _removeFileAndStorage(key, path) {
    wx.removeSavedFile({
      filePath: path,
    });

    wx.removeStorage({
      key: key,
      success: function (res) { },
    });
  }

  removeAllCaches() {
    let cache = this;

    wx.getStorageInfo({
      success: function (res) {
        let keys = res.keys;
        for (let index in keys) {
          let key = keys[index];

          if (key.indexOf(disc_cache_key_prefix) >= 0) {
            cache._removeCache(key);
          }
        }
      }
    });
  }


}