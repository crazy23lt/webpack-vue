# note 
## HTML

### 标签相关

#### 什么是html语法?(介绍html超文本标记语言)

1. 通过标签写法分类,分为 **单标签(自闭和标签)** **双标签(闭合标签)**
   1. `<tagName attribute_1="value" attribute_2="value">content</tagName>` 双标签(闭合标签)
   2. `<tagName attribute_1="value" attribute_2="value" />` 单标签(自闭合标签)
   3. 单标签：`<br/> <hr/> <input/> <img> <link>`

2. `<!DOCTYPE html>` 文档类型标签,告知浏览器如何解析所获取的页面文件(.html .xhtml)
3. `<meta> 标签`,metadata(元数据,用来描述数据的数据) **用来描述网页文档的属性**,一般不做展示
   1. `<meta charset="utf-8">` 使用 **utf-8** 字符编码解析从服务器加载到本地的二进制文件
   2. `<meta name="keywords" content="xxx,blog,web,node,js,note">` 告诉搜索引擎的页面关键词是啥(SEO)
   3. `<meta name="discription" content="设置一篇有关于....的页面">` 告诉搜索引擎的页面简略内容 



### 标签属性

#### src / url / href 三者区别?



## src / url / href

1. src 		=> source (源)												img标签						相对(/adb/a.img)绝对(http://dxxx/a.img)(可跨域、jsonp) 
2. url 		=> 统一资源定位符											 浏览器地址栏   		协议:ip地址（http://xxx）
3. href 	=> hypertext Reference (超文本参考)		 link、a  标签     

响应式？
seo?







前端所有工作体现在浏览器上，就从浏览器开始。

## 浏览器是如何运行的？

### 进程与线程

- `进程`是CPU**资源分配**的最小单位。
- `线程`是CPU**调度**的最小单位。
- 进程下可有多个线程。
- 线程之间能进行数据通信。

**浏览器具有多进程。**

### 浏览器组成

- Borwser 进程：浏览器主控进程（书签、收藏、tag页面销毁和创建等）
- 第三方插件进程
- GPU进程：进行3d绘制，绘制复合图层
- 浏览器渲染进程（浏览器内核）
  - GUI线程：渲染浏览器视口页面内容，解析html、css，构建出DOM tree、CSS Rule Tree，进行布局（layout）绘制（draw）。
  - js引擎线程：执行js脚本文件。与 GUI线程互斥。








