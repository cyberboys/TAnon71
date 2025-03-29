class Stage {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        document.body.appendChild(this.canvas);
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.objects = [];
        this.running = true;
        this.start();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.zIndex = '1000';
        this.canvas.style.pointerEvents = 'none';
    }

    start() {
        this.objects.push(new Formation(this));
        this.animate();
    }

    animate() {
        if (!this.running) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.objects = this.objects.filter(obj => !obj.destroyed);
        if (this.objects.length === 0) this.start();
        this.objects.forEach(obj => obj.update(this.ctx));
        requestAnimationFrame(() => this.animate());
    }
}

class Formation {
    constructor(stage) {
        this.stage = stage;
        this.planes = [];
        this.createFormation();
        this.destroyed = false;
    }

    createFormation() {
        let startX = Math.random() * this.stage.canvas.width;
        let startY = Math.random() > 0.5 ? 0 : this.stage.canvas.height;
        let targetX = Math.random() * this.stage.canvas.width;
        let targetY = startY === 0 ? this.stage.canvas.height : 0;
        let speed = 2 + Math.random() * 3;

        this.planes.push(new JetPlane(startX, startY, targetX, targetY, speed));
        this.planes.push(new JetPlane(startX + 20, startY - 20, targetX, targetY, speed));
        this.planes.push(new JetPlane(startX - 20, startY - 20, targetX, targetY, speed));
    }

    update(ctx) {
        this.planes = this.planes.filter(plane => !plane.destroyed);
        if (this.planes.length === 0) this.destroyed = true;
        this.planes.forEach(plane => plane.update(ctx));
    }
}

class JetPlane {
    constructor(x, y, targetX, targetY, speed) {
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.speed = speed;
        this.angle = Math.atan2(targetY - y, targetX - x);
        this.smokeParticles = [];
        this.destroyed = false;
    }

    update(ctx) {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.smokeParticles.push(new SmokeParticle(this.x, this.y));
        this.smokeParticles = this.smokeParticles.filter(p => !p.destroyed);
        this.draw(ctx);
        if (this.offScreen(ctx.canvas)) this.destroyed = true;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = 'red';
        ctx.fillRect(-5, -2, 10, 4);
        ctx.restore();
        this.smokeParticles.forEach(p => p.draw(ctx));
    }

    offScreen(canvas) {
        return this.x < -50 || this.x > canvas.width + 50 || this.y < -50 || this.y > canvas.height + 50;
    }
}

class SmokeParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.opacity = 1;
        this.radius = 3;
        this.destroyed = false;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 200, 200, ${this.opacity})`;
        ctx.fill();
        this.opacity -= 0.02;
        this.radius += 0.1;
        if (this.opacity <= 0) this.destroyed = true;
    }
}

new Stage();
