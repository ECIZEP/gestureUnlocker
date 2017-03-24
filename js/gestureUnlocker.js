
function GestureUnlocker(options) {
    this.sideLength = options.sideLength ? options.sideLength : 0;
    var container = document.querySelector(options.containner);
    if (!container || typeof options.callback !== 'function') {
        throw new Error('container must be offered and the callback should be a function');
    }
    this.lineColor = options.lineColor ? options.lineColor : 'rgb(255,165,0)';
    this.circleColor = options.circleColor ? options.circleColor : '#CFE6FF';
    this.successColor = options.successColor ? options.successColor : 'green';
    this.errorColor = options.errorColor ? options.errorColor : 'red'; 
    this.container = container;
    this.callback = options.callback;
    this._init(options.className);
}

GestureUnlocker.prototype = {

    // 初始化画布面板，绑定事件
    _init: function (className) {
        this.canvas = document.createElement('canvas');
        this.canvas.className = typeof className === 'string' ? className : '';
        this.canvas.width = this.canvas.height = this.sideLength;
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        // 获取canvas盒子模型的数值
        this.borderLeft = window.getComputedStyle(this.canvas).getPropertyValue('border-left-width').replace('px','');
        this.borderTop = window.getComputedStyle(this.canvas).getPropertyValue('border-top-width').replace('px','');
        this.paddingLeft = window.getComputedStyle(this.canvas).getPropertyValue('padding-left').replace('px','');
        this.paddingRight = window.getComputedStyle(this.canvas).getPropertyValue('padding-right').replace('px','');
        this.paddingTop = window.getComputedStyle(this.canvas).getPropertyValue('padding-top').replace('px','');
    
        // clientWidth = width + padding-left + padding-right
        // 如果class样式中定义了width属性，则重新计算canvas的width值
        if (this.canvas.clientWidth - this.paddingLeft - this.paddingRight !== this.canvas.width) {
            this.canvas.width = this.canvas.height = this.canvas.clientWidth - this.paddingLeft - this.paddingRight;
        }

        this.radius = this.canvas.width / 14;
    
        // code： 用户绘画的密码
        this.code = [];
        this._initCircles();
        this._bindEvent();
    },

    // 9个密码圆
    _initCircles: function () {
        this.points = [];
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                this.points.push({
                    x: j * 4 * this.radius + 3 * this.radius,
                    y: i * 4 * this.radius + 3 * this.radius,
                    number: i * 3 + j + 1
                });
            }
        }
        this._drawCircle();
    },

    _drawCircle: function () {
        for (var i = 0; i < this.points.length; i++) {
            this.ctx.strokeStyle = this.circleColor;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(this.points[i].x, this.points[i].y, this.radius, 0, Math.PI * 2, true);
            this.ctx.closePath();
            this.ctx.stroke();
        }
    },

    // 绘画用户滑动的路径
    _drawCurrentPoint: function () {
        this.clear();
        this.ctx.fillStyle = this.lineColor;
        this.ctx.lineWidth = 3;
        for (var i = 0; i < this.code.length; i++) {
            var index = this.code[i] - 1;
            this.ctx.beginPath();
            this.ctx.arc(this.points[index].x, this.points[index].y, this.radius * 0.5, 0, Math.PI * 2, true);
            this.ctx.closePath();
            this.ctx.fill();
            if (i !== 0) {
                this._drawLine(this.points[this.code[i - 1] - 1], this.points[index]);
            }
        }

    },

    // 点到点之间的连线
    _drawLine: function (startPoint, endPoint) {
        this.ctx.strokeStyle = this.lineColor;
        this.ctx.beginPath();
        this.ctx.moveTo(startPoint.x, startPoint.y);
        this.ctx.lineTo(endPoint.x, endPoint.y);
        this.ctx.closePath();
        this.ctx.stroke();
    },

    // 清除用户绘画的路径
    clear: function () {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this._drawCircle();
    },

    // 移动时的线条跟踪
    _movingLine: function (currentPoint) {
        this._drawCurrentPoint();
        var index = this.code[this.code.length - 1] - 1;
        this._drawLine(this.points[index], currentPoint);
    },

    // 用户绘画结束后的正确错误显示
    drawCode: function (isSuccess, clearTime) {
        if (isSuccess) {
            this.ctx.strokeStyle = this.successColor;
        } else {
            this.ctx.strokeStyle = this.errorColor;
        }
        for (var i = 0; i < this.code.length; i++) {
            this.ctx.lineWidth = 3;
            var index = this.code[i] - 1;
            this.ctx.beginPath();
            this.ctx.arc(this.points[index].x, this.points[index].y, this.radius, 0, Math.PI * 2, true);
            this.ctx.closePath();
            this.ctx.stroke();
        }
        clearTime = clearTime ? clearTime : 300;
        setTimeout(() => {
            this.code = [];
            this._drawCurrentPoint();
        }, clearTime);
    },

    // 将event的x,y坐标转换为canvas中的相对绘画源点的坐标
    _relativePosition: function (event) {
        // 不仅要考虑canvas元素相对视口的偏移，还要考虑canvas元素本身盒子模型造成的偏移
        // 相对canvas绘画源点x,y = event-x,y - 视口偏移(文档流中的偏移，包含margin) - 盒子模型偏移(padding和border)
        var rect = event.currentTarget.getBoundingClientRect(),
            relativeX = event.touches[0].clientX - rect.left - this.paddingLeft - this.borderLeft,
            relativeY = event.touches[0].clientY - rect.top - this.paddingTop - this.borderTop;
        
        return {
            x: relativeX,
            y: relativeY
        }
    },

    // 检查点是否已经存在
    _codeExist: function (number) {
        for (var i = 0; i < this.code.length; i++) {
            if (this.code[i] === number) {
                return true;
            }
        }
        return false;
    },

    // 监听滑动
    _bindEvent: function () {
        var self = this;

        this.canvas.addEventListener('touchstart', function (event) {
            event.preventDefault();
            var relative = self._relativePosition(event);

           /* self.ctx.strokeStyle = '#CFE6FF';
            self.ctx.lineWidth = 2;
            self.ctx.beginPath();
            self.ctx.arc(relative.x, relative.y, 1, 0, Math.PI * 2, true);
            self.ctx.closePath();
            self.ctx.stroke();*/
            

            for (var i = 0; i < self.points.length; i++) {
                if (Math.pow((relative.x - self.points[i].x), 2)
                    + Math.pow(relative.y - self.points[i].y, 2) < Math.pow(self.radius, 2)) {
                    self.code.push(self.points[i].number);
                    self._drawCurrentPoint();
                    self.touching = true;
                    break;
                }
            }
        }, false);

        this.canvas.addEventListener('touchmove', function (event) {
            if (self.touching) {
                var relative = self._relativePosition(event);

                for (var i = 0; i < self.points.length; i++) {
                    if (Math.pow((relative.x - self.points[i].x), 2)
                        + Math.pow(relative.y - self.points[i].y, 2) < Math.pow(self.radius, 2)) {
                        if (!self._codeExist(self.points[i].number)) {
                            self.code.push(self.points[i].number);
                        }
                        break;
                    }
                }
                
                self._movingLine(relative);
            }
        }, false);

        this.canvas.addEventListener('touchend', function (event) {
            if (self.touching) {
                self.touching = false;
                // 重画路径，去掉最后移动的线条
                self._drawCurrentPoint();
                var data = {
                    code: self.code.toString().replace(/,/g, ''),
                }
                self.callback.call(self, data);
                self.code = [];
            }
        }, false);
    }
}