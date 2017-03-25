# GestureUnlocker 文档

一个H5的响应式手势密码组件

Demo展示地址：[http://sunriseteam.cn/h5/index.html](http://sunriseteam.cn/h5/index.html)

![](./demo.png)

## 如何使用 ?

```javascript
var locker = new GestureUnlocker({
    sideLength: 300,			// 边长，canvas强制正方形
    circleColor: '#353031',		// 圆边的颜色 
    lineColor: 'rgb(255,165,0)', // 滑动时连线的颜色
    successColor: '#289c4a',	// 解锁成功时圆边颜色
    errorColor: 'red',			// 解锁错误时圆边颜色
    containner: ".canvas-container",	// canvas容器选择器
    className: 'unlocker',		// canvas设置样式的class
    callback: function (data) {  // 滑动结束后的回调函数
      	// 滑动的密码: data.code
      	console.log(data.code);
    }
});

// Demo中提供了详细的
```

### 参数详情

| 参数名          | 解释             | 是否必须              |
| ------------ | -------------- | ----------------- |
| sideLength   | 画布的边长          | 可选，默认值：`300`      |
| circleColor  | 圆边的颜色          | 可选，默认值：`#353031`  |
| lineColor    | 滑动时连线的颜色       | 可选，默认值： `#ffa500` |
| successColor | 解锁成功时的圆边高亮颜色   | 可选，默认值：`green`    |
| errorColor   | 解锁失败时的圆边高亮颜色   | 可选，默认值：`red`      |
| containner   | canvas父容器的选择器  | 必须                |
| className    | canvas的类名，定义样式 | 可选，默认无            |
| callback     | 画线结束后的回调函数     | 必须                |

### 方法详情

#### drawCode(isSuccess, clearTime)

**描述**： 将用户滑动的密码的高亮显示，高亮部位为密码所选中圆的圆边，成功时，圆边颜色为参数中定义的`successColor`，失败时为`errorColor`

**参数**：

* isSuccess： 布尔值，传入`true`表示解锁成功，高亮颜色值为参数中`successColor`，否则`errorColor`，默认值`false`
* clearTime： 整型值，单位`ms`，表示多少秒后清除上次动作，恢复界面，默认值`300`

#### clear()

**描述**： 清除上次解锁动作，恢复界面

## 画布宽度自适应特性

可以通过定义`className`来实现画布宽度更具设备宽度自适应：

* `class`中以百分比形式设置`width`


* 若`class`中重新定义了画布`width`值，则会覆盖`sideLength`值，即class中`width`优先级高
* `class`中可以设置`padding`和`border`，不影响画布的宽度计算

### 自适应Demo

```html
// css
<style>
.unlocker {
  width: 100%;
}
</style>

// javascript
<script>
var locker = new GestureUnlocker({
    sideLength: 300,	// class重新定义了宽度，此项设置被覆盖无效
    containner: ".canvas-container",
    className: 'unlocker',
    callback: function (data) {
    }
});
</script>
```

### 自适应实现思路

.......