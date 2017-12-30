class Canvas
{
    constructor()
    {
        this.ctx = document.getElementById('canvas').getContext('2d');
        this.W = canvas.width;
        this.H = canvas.height;
    }
}

class Vector extends Canvas
{
    constructor(w, h)
    {
        super();
        this.X = null;
        this.Y = null;
        this.size = {w: w, h: h};
        this.vel = {x: null, y: null};
    }
    get right() {
        return this.X + this.size.w;
    }
    get bottom() {
        return this.Y + this.size.h;
    }
}

class Sprite extends Vector
{
    constructor(path, fwNumber, fhNumber)
    {
        super(32*2, 32*2);
        this.img = new Image();
        this.img.src = path;
        this.frame = {
                        w: this.img.width/fwNumber,   // frame width
                        h: this.img.height/fhNumber  // frame height
        };
        this.crop = { x:0, y:0 };      // X & Y pos to crop image
        this.counter = { x:0, y:0 };  // tracks animation interval
        this.key = {left:false, right:false, up:false, down:false, spacebar:false};
    }
    animate()
    {
        //  creates animation loop  //
        this.columnSpeed = Math.floor(this.counter.x) % this.columnLength;
        this.columnSpeed *= this.frame.w; // amount to increase each frame
        this.counter.x += 0.2;           // animation speed
        this.draw();
    }

    draw() {
        this.ctx.drawImage(this.img,
            this.crop.x, this.crop.y,
            this.frame.w, this.frame.h,
            this.X, this.Y,
            this.size.w, this.size.h);
    }

    update(columnX, rowY, columnLength) {
        this.columnLength = columnLength;            // update animation column length
        this.columnX = columnX * this.frame.w;      // update column start position
        this.crop.y = rowY * this.frame.h;          // updates the row position
        this.crop.x = this.columnX+this.columnSpeed // implements the animation
    }

    boundaries()
    {
        if (this.X < 0) {
            this.vel.x = 0;
            this.key.left = false
        };
        if (this.right >= this.W) {
            this.vel.x = 0;
            this.key.right = false
        };
        if (this.bottom >= this.H) {
            this.vel.y = 0;
            this.key.down = false
        };
        if (this.Y <= 0) {
            this.vel.y = 0;
            this.key.up = false
        };
    }
}

class Player extends Sprite
{
    constructor()
    {
        super('img/skeleton_spear.png', 13, 21);
        this.X = this.W/2;
        this.Y = this.H/2;
        this.speed = 2 // walk speed
        this.direction = {right:false, left:false, up:false, down:false};

        this.stop = true; this.start = false;
        document.addEventListener('keydown', this.keyPress, false);
        document.addEventListener('keyup', this.keyRelease, false);
    }
    init()
    {
        if(this.stop) this.Xspeed = 0; // stops animtion loop
        this.animate();
        this.boundaries();
        this.controller();
    }
    controller()
    {
        this.vel.x = 0;
        this.vel.y = 0;

        // LEFT //
        if(this.key.left &&!(this.key.right || this.key.up || this.key.down))
        {
            this.update(0, 9, 9);
            this.stop = false;
            this.start = true;
            this.direction = {right:false, left:true, up:false, down:false, attack:5};
            this.vel.x = -this.speed;
        }

        // RIGHT //
        if(this.key.right &&!(this.key.left || this.key.up || this.key.down))
        {
            this.update(0, 11, 8);
            this.stop = false;
            this.start = true;
            this.direction = {right:true, left:false, up:false, down:false, attack:7};
            this.vel.x = this.speed;
        }

        // UP //
        if(this.key.up &&!(this.key.right || this.key.left || this.key.down))
        {
            this.update(0, 8, 9);
            this.stop = false;
            this.start = true;
            this.direction = {right:false, left:false, up:true, down:false, attack:4};
            this.vel.y = -this.speed;
        }

        // DOWN //
        if(this.key.down &&!(this.key.right || this.key.up || this.key.left))
        {
            this.update(0, 10, 9);
            this.stop = false;
            this.start = true;
            this.direction = {right:false, left:false, up:false, down:true, attack:6};
            this.vel.y = this.speed;

        }

        // SPACEBAR - Attack //
        if(this.key.spacebar)
        {
            this.update(0, this.direction.attack, 8); // updates attack direction
            this.vel.y = 0; // stop player if attacking
            this.vel.x = 0; // stop player if attacking
            main.spit.fire = true;
        }

        // updates animation direction
        if(this.stop)
        {
            if(this.direction.right) this.update(0, 7, 1);
            if(this.direction.left) this.update(0, 9, 1);
            if(this.direction.up) this.update(0, 8, 1);
            if(this.direction.down) this.update(0, 10, 1);
        }
        // frame to draw at game start
        if(!this.start) this.update(0, 6, 1);

        this.X += this.vel.x;
        this.Y += this.vel.y;
        this.stop = true; // stops animation loop
    }

    keyPress(e)
    {
        if (e.keyCode == 37) main.player.key.left = true;
        if (e.keyCode == 39) main.player.key.right = true;
        if (e.keyCode == 38) main.player.key.up = true;
        if (e.keyCode == 40) main.player.key.down = true;
        if (e.keyCode == 32) main.player.key.spacebar = true;
        // prevents webpage scrolling
        if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }
    }
    keyRelease(e)
    {
        if (e.keyCode == 37) main.player.key.left = false;
        if (e.keyCode == 39) main.player.key.right = false;
        if (e.keyCode == 38) main.player.key.up = false;
        if (e.keyCode == 40) main.player.key.down = false;
        if (e.keyCode == 32) main.player.key.spacebar = false;
    }
}

class Professor extends Sprite
{
    constructor()
    {
        super('img/professor_.png', 9, 4);
        this.row = Math.floor(Math.random()*(4 -0)+0); // randomizes row
        this.X = Math.floor(Math.random()*(            // random x position
                (this.W-this.size.w)-this.size.w)+this.size.w);
        this.Y = Math.floor(Math.random()*(            // random y position
                (this.H-this.size.w)-this.size.h)+this.size.h);
        this.vel = {
                        x: Math.floor(Math.random()*(2 -1)+1),
                        y: Math.floor(Math.random()*(2 -1)+1),
        };
    }
    init() {
        this.update(0, this.row, 9);
        this.animate();
        this.move();
        this.boundaries();

        this.draw();
    }
    move()
    {
        this.counter.x += 0.03;
        if(this.row == 1) { // left
            this.vel.x *= -this.vel.x;
            this.vel.y = 0;
        }
        if(this.row == 3) { // right
            this.vel.y = 0;
        }
        if(this.row == 2) { // down
            this.vel.x = 0;
        }
        if(this.row == 0) { // up
            this.vel.x = 0;
            this.vel.y *= -this.vel.y;
        }
        this.X += this.vel.x;
        this.Y += this.vel.y;
    }
}

class Spit extends Vector
{
    constructor()
    {
        super(2.5, 2.5);
        this.bullets = [];
        this.hit = false;
        this.fire = false;
    }
    draw()
    {
        for (var i = 0; i < this.bullets.length; i++) {
            this.ctx.beginPath();
            this.ctx.fillStyle = 'white';
            this.X = this.bullets[i][0];
            this.Y = this.bullets[i][1];
            this.ctx.arc(this.X, this.Y, this.size.w, 0, 2*Math.PI);
            this.ctx.fill();
            this.ctx.closePath();
        }
        this.move();
        this.shoot();
    }
    move()
    {
        for (var i = 0; i < this.bullets.length; i++) {
            // if (this.bullets[i][1] < this.H+10) {
            //     this.bullets[i][1] +=7;
            // }
            // else if (this.bullets[i][1] > this.H+9) this.bullets.splice(i, 1);
            // if (this.hit) this.bullets.splice(i, 1);
            if (this.bullets[i][0] < this.W+10) {
                if (this.bullets[i][0] > main.player.X)
                    this.bullets[i][0] +=5;
                if (this.bullets[i][0] < main.player.X)
                    this.bullets[i][0] -=5;
            }

            // if (this.bullets[i][1] > main.player.Y)
            //     this.bullets[i][1] +=5;
            // if (this.bullets[i][1] < main.player.Y)
            //     this.bullets[i][1] -=5;

            if (this.bullets[i][0] > this.W || this.bullets[i][0] < -32
            || this.bullets[i][1] > this.W || this.bullets[i][0] < -32)
                this.bullets.splice(i, 1);
        }
    }
    shoot()
    {
        if (this.fire && this.bullets.length <= .1) {
            if(main.player.direction.right)
                this.bullets.push([main.player.X+32, main.player.Y+40]);
            if(main.player.direction.left)
                this.bullets.push([main.player.X-20, main.player.Y+40]);
            if(main.player.direction.down)
                this.bullets.push([main.player.X-20, main.player.Y+40]);
        }
        this.fire = false;
    }
}

class Main extends Canvas
{
    constructor()
    {
        super();
        this.loop();
        this.player = new Player;
        this.spit = new Spit;
        this.enemys = [];
        this.totalEnemys = 20;

        for (var i = 0; i < this.totalEnemys; i++) {
            this.enemys.push(i);
        }
        for(var i = 0; i < this.enemys.length; i++) {
            this.enemys[i] = new Professor(this.W);
        }
    }

    update(DT)
    {
        this.spit.draw();
        this.enemys.forEach(enemy => {
            enemy.init();

        })
        this.player.init();

        for (var i = 0; i < this.enemys.length; i++) {
        if(this.spit.bottom > this.enemys[i].Y
        && this.spit.bottom < this.enemys[i].bottom
        && this.spit.left >= this.enemys[i].X
        && this.spit.X <= this.enemys[i].X)
        {
            console.log();
            this.enemys.splice(i, 1);
            this.enemys.push(new Victim(-50));
            //this.score++;
        }
        }
    }

    loop(lastTime) { // creates main loop
        const callback = (Mseconds) => {
            this.ctx.clearRect(0, 0, this.W, this.H);
            if(lastTime)
                this.update((Mseconds -lastTime)/1000);
            lastTime = Mseconds;
            requestAnimationFrame(callback);
        }
        callback();
    }
}

// initiates game //
window.onload = main = new Main;
