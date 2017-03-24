function Locker(options) {
    this.width = options.width;
    this.height = options.height;
    var container = document.getElementById(options.id);
    if (!container || typeof options.callback !== 'function') {
        throw new Error('options is incomplete');
    }
    this.container = container;
    this.init();
    this.callback = options.callback;
}

Locker.prototype = {

    // 初始化画布面板，绑定事件
    init: function () {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.radius = this.width / 14;
        // code： 用户绘画的密码
        this.code = [];
        this.initCircles();
        this.bindEvent();
    },

    // 9个密码圆
    initCircles: function () {
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
        this.drawCircle();
    },

    drawCircle: function () {
        for (var i = 0; i < this.points.length; i++) {
            this.ctx.strokeStyle = '#CFE6FF';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(this.points[i].x, this.points[i].y, this.radius, 0, Math.PI * 2, true);
            this.ctx.closePath();
            this.ctx.stroke();
        }
    },

    // 绘画用户滑动的路径
    drawCurrentPoint: function () {
        this.clear();
        this.ctx.fillStyle = "rgb(255,165,0)";
        this.ctx.lineWidth = 3;
        for (var i = 0; i < this.code.length; i++) {
            var index = this.code[i] - 1;
            this.ctx.beginPath();
            this.ctx.arc(this.points[index].x, this.points[index].y, this.radius * 0.5, 0, Math.PI * 2, true);
            this.ctx.closePath();
            this.ctx.fill();
            if (i !== 0) {
                this.drawLine(this.points[this.code[i - 1] - 1], this.points[index]);
            }
        }

    },

    // 点到点之间的连线
    drawLine: function (startPoint, endPoint) {
        this.ctx.strokeStyle = "rgb(255,165,0)";
        this.ctx.beginPath();
        this.ctx.moveTo(startPoint.x, startPoint.y);
        this.ctx.lineTo(endPoint.x, endPoint.y);
        this.ctx.closePath();
        this.ctx.stroke();
    },

    // 清除用户绘画的路径
    clear: function () {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.drawCircle();
    },

    // 移动时的线条跟踪
    movingLine: function (currentPoint) {
        this.drawCurrentPoint();
        var index = this.code[this.code.length - 1] - 1;
        this.drawLine(this.points[index], currentPoint);
    },

    // 用户绘画结束后的正确错误显示
    drawCode: function (isSuccess, clearTime) {
        if (isSuccess) {
            this.ctx.strokeStyle = "green";
        } else {
            this.ctx.strokeStyle = "red";
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
            this.drawCurrentPoint();
        }, clearTime);
    },

    // 获取touch的点相对于canvas的坐标
    relativePosition: function (event) {
        var rect = event.currentTarget.getBoundingClientRect(),
            relativeX = event.touches[0].clientX - rect.left,
            relativeY = event.touches[0].clientY - rect.top;
        return {
            x: relativeX,
            y: relativeY
        }
    },

    // 检查点是否已经存在
    codeExist: function (number) {
        for (var i = 0; i < this.code.length; i++) {
            if (this.code[i] === number) {
                return true;
            }
        }
        return false;
    },

    // 监听滑动
    bindEvent: function () {
        var self = this;

        this.canvas.addEventListener('touchstart', function (event) {
            event.preventDefault();
            var relative = self.relativePosition(event);

            for (var i = 0; i < self.points.length; i++) {
                if (Math.pow((relative.x - self.points[i].x), 2)
                    + Math.pow(relative.y - self.points[i].y, 2) < Math.pow(self.radius, 2)) {
                    self.code.push(self.points[i].number);
                    self.drawCurrentPoint();
                    self.touching = true;
                    break;
                }
            }
        }, false);

        this.canvas.addEventListener('touchmove', function (event) {
            if (self.touching) {
                var relative = self.relativePosition(event);

                for (var i = 0; i < self.points.length; i++) {
                    if (Math.pow((relative.x - self.points[i].x), 2)
                        + Math.pow(relative.y - self.points[i].y, 2) < Math.pow(self.radius, 2)) {
                        if (!self.codeExist(self.points[i].number)) {
                            self.code.push(self.points[i].number);
                        }
                        break;
                    }
                }

                self.movingLine(relative);
            }
        }, false);

        this.canvas.addEventListener('touchend', function (event) {
            if (self.touching) {
                self.touching = false;
                // 重画路径，去掉最后移动的线条
                self.drawCurrentPoint();
                var data = {
                    code: self.code.toString().replace(/,/g, ''),
                }
                self.callback.call(self, data);
                self.code = [];
            }
        }, false);
    }
}
