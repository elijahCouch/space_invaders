const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const spaceShipImage = new Image();
spaceShipImage.src = 'invader.svg'; 

let playerX = canvas.width / 2;
const playerY = canvas.height - 30;
const playerWidth = 50;
const playerHeight = 20;
const playerSpeed = 5;
const bulletSpeed = 7;
const spaceShipSpeed = 2;
const spaceShipSpawnInterval = 2000; 
let rightPressed = false;
let leftPressed = false;
let isShooting = false;
let bullets = [];
let spaceShips = [];
let gameIsOver = false;

// Event listeners
document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

function keyDownHandler(e) {
  if (e.key === 'Right' || e.key === 'ArrowRight') {
    rightPressed = true;
  } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
    leftPressed = true;
  } else if ((e.key === 'Up' || e.key === 'ArrowUp') && !isShooting) {
    shootBullet();
    isShooting = true;
  }
}

function keyUpHandler(e) {
  if (e.key === 'Right' || e.key === 'ArrowRight') {
    rightPressed = false;
  } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
    leftPressed = false;
  } else if (e.key === 'Up' || e.key === 'ArrowUp') {
    isShooting = false;
  }
}

function shootBullet() {
  const bullet = {
    x: playerX + playerWidth / 2,
    y: playerY,
    width: 5,
    height: 10,
    speed: bulletSpeed,
    color: "#ff0000"
  };
  bullets.push(bullet);
}

class SpaceShip {
  constructor() {
    this.width = 50;
    this.height = 50;
    this.speed = spaceShipSpeed;
    this.x = Math.random() * (canvas.width - this.width);
    this.y = -this.height;
    this.direction = 1;
    this.timer = 0;
    this.isAlive = true;
    this.shootTimer = 0;
    this.shootInterval = Math.random() * 2000 + 1000; 
  }

  update() {
    if (this.timer < 3000) { 
      this.x += this.direction * this.speed;
      if (this.x <= 0 || this.x + this.width >= canvas.width) {
        this.direction *= -1;
      }
    } else {
      this.y += this.speed;
    }
    this.timer += 16; 
    this.checkCollision();
    this.shootTimer += 16;
    if (this.shootTimer >= this.shootInterval) {
      this.shootBullet();
      this.shootTimer = 0;
      this.shootInterval = Math.random() * 2000 + 1000; 
    }
  }

checkCollision() {
    bullets.forEach((bullet, bulletIndex) => {
        if (bullet.color === "#ff0000") {
            if (
                bullet.x < this.x + this.width &&
                bullet.x + bullet.width > this.x &&
                bullet.y < this.y + this.height &&
                bullet.y + bullet.height > this.y
            ) {
                bullets.splice(bulletIndex, 1);
                this.isAlive = false;
            }
        }
    });

    if (
        this.x < playerX + playerWidth &&
        this.x + this.width > playerX &&
        this.y < playerY + playerHeight &&
        this.y + this.height > playerY
    ) {
        gameOver();
    }
}


  draw() {
    if (this.isAlive) {
      ctx.drawImage(spaceShipImage, this.x, this.y, this.width, this.height);
    }
  }

  shootBullet() {
    const bullet = {
      x: this.x + this.width / 2,
      y: this.y + this.height,
      width: 5,
      height: 10,
      speed: bulletSpeed,
      color: "#00ff00" // Change bullet color for enemy bullets
    };
    bullets.push(bullet);
  }
}

function spawnSpaceShip() {
  const spaceShip = new SpaceShip();
  spaceShips.push(spaceShip);
}

function drawPlayer() {
  // Draw the cannon
  ctx.beginPath();
  ctx.moveTo(playerX, playerY);
  ctx.lineTo(playerX + playerWidth / 2, playerY - playerHeight);
  ctx.lineTo(playerX + playerWidth, playerY);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.closePath();
}

function drawBullets() {
  bullets.forEach(bullet => {
    ctx.beginPath();
    ctx.rect(bullet.x, bullet.y, bullet.width, bullet.height);
    ctx.fillStyle = bullet.color;
    ctx.fill();
    ctx.closePath();
  });
}

function moveBullets() {
  bullets = bullets.filter(bullet => bullet.y > 0);
  bullets.forEach(bullet => {
    bullet.y -= bullet.speed;
  });
}

function movePlayer() {
  if (rightPressed && playerX < canvas.width - playerWidth) {
    playerX += playerSpeed;
  } else if (leftPressed && playerX > 0) {
    playerX -= playerSpeed;
  }
}

function drawSpaceShips() {
  spaceShips.forEach((spaceShip, shipIndex) => {
    spaceShip.update();
    spaceShip.draw();
    if (!spaceShip.isAlive) {
      spaceShips.splice(shipIndex, 1);
    }
  });
}

function gameOver() {
  gameIsOver = true;
  alert("Game Over! You lose.");
  document.location.reload();
}

function draw() {
  if (!gameIsOver) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    moveBullets();
    movePlayer();
    drawPlayer();
    drawBullets();
    drawSpaceShips();
    requestAnimationFrame(draw);
  }
}

setInterval(spawnSpaceShip, spaceShipSpawnInterval);

draw();
