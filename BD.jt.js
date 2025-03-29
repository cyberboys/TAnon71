Here's a complete implementation of your jet formation animation with Bangladesh flag-colored smoke trails:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Jet Formation Animation</title>
    <style>
        body {
            margin: 0;
            overflow: hidden;
            background-color: #87CEEB; /* Sky blue */
        }
        canvas {
            display: block;
        }
    </style>
</head>
<body>
    <canvas id="jetCanvas"></canvas>

    <script>
        // Stage class to manage the canvas and animation
        class Stage {
            constructor(canvasId) {
                this.canvas = document.getElementById(canvasId);
                this.ctx = this.canvas.getContext('2d');
                this.resize();
                this.objects = [];
                this.animationId = null;
                
                window.addEventListener('resize', this.resize.bind(this));
            }
            
            resize() {
                this.width = window.innerWidth;
                this.height = window.innerHeight;
                this.canvas.width = this.width;
                this.canvas.height = this.height;
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
                    
                    if (obj.shouldRemove) {
                        this.objects.splice(i, 1);
                    }
                }
                
                this.animationId = requestAnimationFrame(() => this.animate());
            }
        }

        // PathMaker class for smooth flight paths
        class PathMaker {
            constructor(stage) {
                this.stage = stage;
            }
            
            generatePath() {
                const points = [];
                
                // Start off-screen left
                points.push({
                    x: -100,
                    y: Math.random() * this.stage.height * 0.8
                });
                
                // Middle control points
                points.push({
                    x: this.stage.width * 0.2,
                    y: Math.random() * this.stage.height * 0.6 + this.stage.height * 0.2
                });
                
                points.push({
                    x: this.stage.width * 0.5,
                    y: Math.random() * this.stage.height * 0.6 + this.stage.height * 0.2
                });
                
                points.push({
                    x: this.stage.width * 0.8,
                    y: Math.random() * this.stage.height * 0.6 + this.stage.height * 0.2
                });
                
                // End off-screen right
                points.push({
                    x: this.stage.width + 100,
                    y: Math.random() * this.stage.height * 0.8
                });
                
                return points;
            }
            
            getPoint(points, t) {
                // Catmull-Rom spline interpolation
                const p0 = points[0];
                const p1 = points[1];
                const p2 = points[2];
                const p3 = points[3];
                
                const t2 = t * t;
                const t3 = t2 * t;
                
                return {
                    x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + 
                        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + 
                        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
                    y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + 
                        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + 
                        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
                };
            }
            
            getTangent(points, t) {
                // Get derivative for direction
                const p0 = points[0];
                const p1 = points[1];
                const p2 = points[2];
                const p3 = points[3];
                
                const t2 = t * t;
                
                return {
                    x: 0.5 * ((-p0.x + p2.x) + 
                        (4 * p0.x - 10 * p1.x + 8 * p2.x - 2 * p3.x) * t + 
                        (-3 * p0.x + 9 * p1.x - 9 * p2.x + 3 * p3.x) * t2),
                    y: 0.5 * ((-p0.y + p2.y) + 
                        (4 * p0.y - 10 * p1.y + 8 * p2.y - 2 * p3.y) * t + 
                        (-3 * p0.y + 9 * p1.y - 9 * p2.y + 3 * p3.y) * t2)
                };
            }
        }

        // SmokeParticle class for the flag-colored trails
        class SmokeParticle {
            constructor(x, y, positionInFormation, totalPlanes) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 8 + 4;
                this.life = 1;
                this.decay = Math.random() * 0.02 + 0.01;
                this.velocity = {
                    x: (Math.random() - 0.5) * 0.3,
                    y: (Math.random() - 0.5) * 0.3
                };
                
                // Determine color based on position in formation (Bangladesh flag colors)
                const third = Math.floor(totalPlanes / 3);
                if (positionInFormation < third || positionInFormation >= totalPlanes - third) {
                    this.color = '#006A4E'; // Bangladesh green
                } else {
                    this.color = '#F42A41'; // Bangladesh red
                }
            }
            
            update() {
                this.x += this.velocity.x;
                this.y += this.velocity.y;
                this.life -= this.decay;
                this.size += 0.1;
            }
            
            draw(ctx) {
                ctx.globalAlpha = this.life;
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
            constructor(stage, pathPoints, offsetX, offsetY, positionInFormation, totalPlanes) {
                this.stage = stage;
                this.pathPoints = pathPoints;
                this.offsetX = offsetX;
                this.offsetY = offsetY;
                this.positionInFormation = positionInFormation;
                this.totalPlanes = totalPlanes;
                this.speed = 0.0005;
                this.progress = 0;
                this.size = 15;
                this.smokeParticles = [];
                this.smokeInterval = 0;
                this.shouldRemove = false;
                this.pathMaker = new PathMaker(stage);
            }
            
            update() {
                this.progress += this.speed;
                
                if (this.progress >= 1) {
                    this.shouldRemove = true;
                    return;
                }
                
                // Get position and direction from path
                const point = this.pathMaker.getPoint(this.pathPoints, this.progress);
                const tangent = this.pathMaker.getTangent(this.pathPoints, this.progress);
                this.angle = Math.atan2(tangent.y, tangent.x);
                
                // Apply formation offset
                this.x = point.x + Math.cos(this.angle + Math.PI/2) * this.offsetX 
                        - Math.sin(this.angle + Math.PI/2) * this.offsetY;
                this.y = point.y + Math.sin(this.angle + Math.PI/2) * this.offsetX 
                        + Math.cos(this.angle + Math.PI/2) * this.offsetY;
                
                // Add smoke particles
                this.smokeInterval++;
                if (this.smokeInterval >= 3) {
                    this.smokeInterval = 0;
                    this.smokeParticles.push(new SmokeParticle(
                        this.x - Math.cos(this.angle) * this.size * 1.5,
                        this.y - Math.sin(this.angle) * this.size * 1.5,
                        this.positionInFormation,
                        this.totalPlanes
                    ));
