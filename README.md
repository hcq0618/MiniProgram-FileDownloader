# WeChatApp-FileDownloader
A download file lib for wechat app

1.fetch file cache if file cache existed, or else download file

2.use ES6

For Example:
```
import { FileDownloader } from "file_downloader"
//or use require if u want

wx.showLoading({
  title: 'loading...',
});

let fileDownloader = new FileDownloader(url, fileCacheKey);
//or use var if u want

fileDownloader.fetch({
    success: function (filePath) {
      wx.hideLoading();
    },
    fail: function () {
      wx.hideLoading();
    }
  });
```


## License
MIT License

Copyright (c) 2017 Hcq

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
