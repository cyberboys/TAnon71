# Jet Formation Animation with Bangladesh Flag Smoke

Here's a complete implementation of your jet formation animation with the requested features:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Jet Formation Animation</title>
    <style>
        body {
            margin: 0;
            overflow: hidden;
            background-color:rgb(248, 248, 248); /* Sky blue background */
        }
        canvas {
            display: block;
        }
    </style>
</head>
<body>
    <canvas id="jetCanvas"></canvas>

    <script>
        // Stage object to manage the canvas
        class Stage {
            constructor(canvasId) {
                this.canvas = document.getElementById(canvasId);
                this.ctx = this.canvas.getContext('2d');
                this.width = window.innerWidth;
                this.height = window.innerHeight;
                this.canvas.width = this.width;
                this.canvas.height = this.height;
                this.objects = [];
                this.animationId = null;
                
                window.addEventListener('resize', () => {
                    this.width = window.innerWidth;
                    this.height = window.innerHeight;
                    this.canvas.width = this.width;
                    this.canvas.height = this.height;
                });
            }
            
            addObject(obj) {
                this.objects.push(obj);
            }
            
            removeObject(obj) {
                const index = this.objects.indexOf(obj);
                if (index > -1) {
                    this.objects.splice(index, 1);
                }
            }
            
            start() {
                if (!this.animationId) {
                    this.animate();
                }
            }
            
            stop() {
                if (this.animationId) {
                    cancelAnimationFrame(this.animationId);
                    this.animationId = null;
                }
            }
            
            animate() {
                this.ctx.clearRect(0, 0, this.width, this.height);
                
                // Update and draw all objects
                for (let i = this.objects.length - 1; i >= 0; i--) {
                    const obj = this.objects[i];
                    obj.update();
                    obj.draw(this.ctx);
                    
                    // Remove objects that are marked for removal
                    if (obj.shouldRemove) {
                        this.objects.splice(i, 1);
                    }
                }
                
                this.animationId = requestAnimationFrame(() => this.animate());
            }
        }

        // PathMaker class to define smooth flight paths
        class PathMaker {
            constructor(stage) {
                this.stage = stage;
                this.controlPoints = [];
            }
            
            generatePath(numPoints = 4) {
                this.controlPoints = [];
                
                // Start off-screen to the left
                this.controlPoints.push({
                    x: -100,
                    y: Math.random() * this.stage.height * 0.8
                });
                
                // Add middle control points
                for (let i = 1; i < numPoints - 1; i++) {
                    this.controlPoints.push({
                        x: Math.random() * this.stage.width * 0.6 + this.stage.width * 0.2,
                        y: Math.random() * this.stage.height * 0.6 + this.stage.height * 0.2
                    });
                }
                
                // End off-screen to the right
                this.controlPoints.push({
                    x: this.stage.width + 100,
                    y: Math.random() * this.stage.height * 0.8
                });
                
                return this;
            }
            
            getPoint(t) {
                // Catmull-Rom spline interpolation
                const points = this.controlPoints;
                const p0 = points[0];
                const p1 = points[1];
                const p2 = points[2];
                const p3 = points[3];
                
                // Adjust t based on the number of segments
                const segment = Math.floor(t * (points.length - 3));
                const segmentT = (t * (points.length - 3)) % 1;
                
                if (segment >= points.length - 3) {
                    return points[points.length - 1];
                }
                
                const p0s = points[segment];
                const p1s = points[segment + 1];
                const p2s = points[segment + 2];
                const p3s = points[segment + 3];
                
                const t2 = segmentT * segmentT;
                const t3 = t2 * segmentT;
                
                return {
                    x: 0.5 * ((2 * p1s.x) +
                              (-p0s.x + p2s.x) * segmentT +
                              (2 * p0s.x - 5 * p1s.x + 4 * p2s.x - p3s.x) * t2 +
                              (-p0s.x + 3 * p1s.x - 3 * p2s.x + p3s.x) * t3),
                    y: 0.5 * ((2 * p1s.y) +
                              (-p0s.y + p2s.y) * segmentT +
                              (2 * p0s.y - 5 * p1s.y + 4 * p2s.y - p3s.y) * t2 +
                              (-p0s.y + 3 * p1s.y - 3 * p2s.y + p3s.y) * t3)
                };
            }
            
            getTangent(t) {
                // Get derivative for direction
                const points = this.controlPoints;
                const segment = Math.floor(t * (points.length - 3));
                const segmentT = (t * (points.length - 3)) % 1;
                
                if (segment >= points.length - 3) {
                    return { x: 1, y: 0 }; // Default to right direction
                }
                
                const p0 = points[segment];
                const p1 = points[segment + 1];
                const p2 = points[segment + 2];
                const p3 = points[segment + 3];
                
                const t2 = segmentT * segmentT;
                
                return {
                    x: 0.5 * ((-p0.x + p2.x) +
                              (4 * p0.x - 10 * p1.x + 8 * p2.x - 2 * p3.x) * segmentT +
                              (-3 * p0.x + 9 * p1.x - 9 * p2.x + 3 * p3.x) * t2),
                    y: 0.5 * ((-p0.y + p2.y) +
                              (4 * p0.y - 10 * p1.y + 8 * p2.y - 2 * p3.y) * segmentT +
                              (-3 * p0.y + 9 * p1.y - 9 * p2.y + 3 * p3.y) * t2)
                };
            }
        }

        // SmokeParticle class for the smoke trail
        class SmokeParticle {
            constructor(x, y, color) {
                this.x = x;
                this.y = y;
                this.color = color;
                this.size = Math.random() * 10 + 5;
                this.life = 1;
                this.decay = Math.random() * 0.02 + 0.01;
                this.velocity = {
                    x: (Math.random() - 0.5) * 0.5,
                    y: (Math.random() - 0.5) * 0.5
                };
            }
            
            update() {
                this.x += this.velocity.x;
                this.y += this.velocity.y;
                this.life -= this.decay;
                this.size += 0.1;
            }
            
            draw(ctx) {
                const alpha = this.life;
                ctx.globalAlpha = alpha;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }
            
            get shouldRemove() {
                return this.life <= 0;
            }
        }

        // JetPlane class for individual planes
        class JetPlane {
            constructor(stage, x, y, angle, offsetX = 0, offsetY = 0) {
                this.stage = stage;
                this.x = x;
                this.y = y;
                this.offsetX = offsetX;
                this.offsetY = offsetY;
                this.angle = angle;
                this.speed = 0.0005;
                this.progress = 0;
                this.pathMaker = new PathMaker(stage).generatePath();
                this.smokeParticles = [];
                this.smokeInterval = 0;
                this.shouldRemove = false;
                this.size = 20;
            }
            
            update() {
                this.progress += this.speed;
                
                if (this.progress >= 1) {
                    this.shouldRemove = true;
                    return;
                }
                
                const point = this.pathMaker.getPoint(this.progress);
                const tangent = this.pathMaker.getTangent(this.progress);
                this.angle = Math.atan2(tangent.y, tangent.x);
                
                this.x = point.x + Math.cos(this.angle + Math.PI/2) * this.offsetX 
                        - Math.sin(this.angle + Math.PI/2) * this.offsetY;
                this.y = point.y + Math.sin(this.angle + Math.PI