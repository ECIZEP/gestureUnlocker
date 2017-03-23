function Locker(options) {
    this.width = options.width;
    this.height = options.height;
    var container = document.getElementById(options.id);
    if (!container) {
        throw new Error('container is not exists,check the container id');
    }
    this.container = container;
    this.init();
    //this.success = options.success;
    //this.failed = options.failed;
}

Locker.prototype = {
    init: function () {
        var str = '<canvas id="canvas" width="300" height="300" margin-top: 15px;"></canvas>';
        this.container.innerHTML = str;
        this.canvas = this.container.getElementsByTagName('canvas')[0];
        this.ctx = this.canvas.getContext('2d');
        this.radius = this.width / 14;
        this.initCircles();
        this.bindEvent();
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
    drawPoint: function () {
        this.ctx.fillStyle = "rgb(255,165,0)";
        this.ctx.lineWidth = 3;
        for (var i = 0; i < this.code.length; i++) {
            var index = this.code[i] - 1;
            this.ctx.beginPath();
            this.ctx.arc(this.points[index].x, this.points[index].y, this.radius * 0.4, 0, Math.PI * 2, true);
            this.ctx.closePath();
            this.ctx.fill();
            if (i !== 0) {
                this.drawLine(this.points[this.code[i - 1] - 1], this.points[index]);
            }
        }

    },
    drawLine: function (startPoint, endPoint) {
        this.ctx.strokeStyle = "rgb(255,165,0)";
        this.ctx.beginPath();
        this.ctx.moveTo(startPoint.x, startPoint.y);
        this.ctx.lineTo(endPoint.x, endPoint.y);
        this.ctx.closePath();
        this.ctx.stroke();
    },
    initCircles: function () {
        this.points = [];
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                var obj = {
                    x: j * 4 * this.radius + 3 * this.radius,
                    y: i * 4 * this.radius + 3 * this.radius,
                    number: i * 3 + j + 1
                }
                this.points.push(obj);
            }
        }
        this.drawCircle();
    },
    clear: function () {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    },
    reDraw: function (currentPoint) {
        this.clear();
        this.drawCircle();
        this.drawPoint();


        var index = this.code[this.code.length - 1] - 1;
        this.drawLine(this.points[index], currentPoint);
    },
    relativePosition: function (event) {
        var rect = event.currentTarget.getBoundingClientRect(),
            relativeX = event.touches[0].clientX - rect.left,
            relativeY = event.touches[0].clientY - rect.top;
        return {
            x: relativeX,
            y: relativeY
        }
    },
    codeExist: function (number) {
        for (var i = 0; i < this.code.length; i++) {
            if (this.code[i] === number) {
                return true;
            }
        }
        return false;
    },
    bindEvent: function () {
        var self = this;
        this.code = [];

        this.canvas.addEventListener('touchstart', function (event) {
            event.preventDefault();

            var relative = self.relativePosition(event);

            for (var i = 0; i < self.points.length; i++) {
                if (Math.pow((relative.x - self.points[i].x), 2)
                    + Math.pow(relative.y - self.points[i].y, 2) < Math.pow(self.radius, 2)) {
                    self.code.push(self.points[i].number);
                    self.drawPoint();
                    self.touching = true;
                    break;
                }
            }
        }, false);

        this.canvas.addEventListener('touchmove', function (event) {
            if (self.touching) {
                var relative = self.relativePosition(event);

                self.reDraw(relative);
                for (var i = 0; i < self.points.length; i++) {
                    if (Math.pow((relative.x - self.points[i].x), 2)
                        + Math.pow(relative.y - self.points[i].y, 2) < Math.pow(self.radius, 2)) {
                        if (!self.codeExist(self.points[i].number)) {
                            self.code.push(self.points[i].number);
                        }
                        self.drawPoint();
                        break;
                    }
                }
            }
        }, false);

        this.canvas.addEventListener('touchend', function (event) {

            if (self.touching) {
                self.touching = false;
                self.code = [];
                self.clear();
                self.drawCircle();
                self.drawPoint();
            }
        }, false);
    }
}
