const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const spaceShipImage = new Image();
spaceShipImage.src = "invader.svg";

let playerX = canvas.width / 2;
const playerY = canvas.height - 30;
const playerWidth = 50;
const playerHeight = 20;
let playerSpeed = 5; 
let bulletSpeed = 5; 
let spaceShipSpeed = 2;
const spaceShipSpawnInterval = 2000;
let rightPressed = false;
let leftPressed = false;
let isShooting = false;
let bullets = [];
let spaceShips = [];
let gameIsOver = false;
let score = 0;

const scoreBox = document.getElementById("scoreBox");
const gameOverText = document.getElementById("gameOverText");
const invadersSpeedInput = document.getElementById("invadersSpeed");
const bulletSpeedInput = document.getElementById("bulletSpeed");

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

bulletSpeedInput.addEventListener("input", () => {
  bulletSpeed = parseInt(bulletSpeedInput.value);
});

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = true;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = true;
  } else if ((e.key === "Up" || e.key === "ArrowUp") && !isShooting) {
    if (gameIsOver) {
      restartGame();
      gameOverText.style.display = "none";
    } else {
      shootBullet();
      isShooting = true;
    }
  }
}



invadersSpeedInput.addEventListener("input", () => {
  spaceShipSpeed = parseInt(invadersSpeedInput.value);
  updateSpaceShipsSpeed();
});


function updateSpaceShipsSpeed() {
  spaceShips.forEach(spaceShip => {
    spaceShip.speed = spaceShipSpeed;
  });
}





function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = false;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = false;
  } else if (e.key === "Up" || e.key === "ArrowUp") {
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
    color: "#ff0000",
  };
  bullets.push(bullet);
}

class SpaceShip {
  constructor() {
    this.width = 30; 
    this.height = 30; 
    this.speed = spaceShipSpeed;
    this.x = Math.random() * (canvas.width - this.width); 
    this.y = -this.height; 
    this.direction = 1; 
    this.isAlive = true;
    this.shootTimer = 0;
    this.shootInterval = Math.random() * 5000 + 3000; 
    this.shootProbability = 0.02; 
  }

  update() {
    this.y += this.speed;
    if (this.y > canvas.height) {
      this.y = -this.height;
      this.x = Math.random() * (canvas.width - this.width); 
    }

    if (this.y % 100 === 0) { 
      this.direction *= -1;
    }
    
    this.x += this.direction * this.speed / 2; 

    this.shootTimer += 16;
    if (this.shootTimer >= this.shootInterval) {
      if (Math.random() < this.shootProbability) {
        this.shootBullet();
      }
      this.shootTimer = 0;
      this.shootInterval = Math.random() * 5000 + 3000;
    }
    
    // Check player position and shoot bullet if close
    if (Math.random() < this.shootProbability && Math.abs(playerX - this.x) < 50) {
      this.shootBullet();
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
      speed: -bulletSpeed,
      color: "orange",
    };
    bullets.push(bullet);
  }
  checkCollision() {
    bullets.forEach((bullet, bulletIndex) => {
     
      if (
        bullet.color === "orange" &&
        bullet.x < playerX + playerWidth &&
        bullet.x + bullet.width > playerX &&
        bullet.y < playerY + playerHeight &&
        bullet.y + bullet.height > playerY
      ) {
        const explosionParticles = explode(playerX + playerWidth / 2, playerY + playerHeight / 2, "#ff0000");
        particles.push(...explosionParticles);
        
  
        setTimeout(() => {
          gameOver(true);
        }, 200);

        bullets.splice(bulletIndex, 1); 
      }
  
      else if (
        bullet.color === "#ff0000" && 
        bullet.x < this.x + this.width &&
        bullet.x + bullet.width > this.x &&
        bullet.y < this.y + this.height &&
        bullet.y + bullet.height > this.y
      ) {
        this.isAlive = false;
        bullets.splice(bulletIndex, 1);
        score += 10; 
        updateScore(); 
        const explosionParticles = explode(this.x + this.width / 2, this.y + this.height / 2, "#ff0000");
        particles.push(...explosionParticles);
      }
    });
  
  
    if (
      playerX < this.x + this.width &&
      playerX + playerWidth > this.x &&
      playerY < this.y + this.height &&
      playerY + playerHeight > this.y
    ) {

      spaceShips = [];
  
      const explosionParticles = explode(playerX + playerWidth / 2, playerY + playerHeight / 2, "#ff0000");
      particles.push(...explosionParticles);
      

      setTimeout(() => {
        gameOver(true);
      }, 500);
      
    }
  }
  
  
  
}



const spawnCountInput = document.getElementById("spawnCount");
let spawnCount = parseInt(spawnCountInput.value); // Initialize spawn count

spawnCountInput.addEventListener("input", () => {
  spawnCount = parseInt(spawnCountInput.value); // Update spawn count when input value changes
});

function spawnSpaceShip() {
  if (spaceShips.length < spawnCount) {
    const spaceShip = new SpaceShip();
    spaceShips.push(spaceShip);
  }
}


function drawPlayer() {
  ctx.beginPath();
  ctx.moveTo(playerX, playerY);
  ctx.lineTo(playerX + playerWidth / 2, playerY - playerHeight);
  ctx.lineTo(playerX + playerWidth, playerY);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.closePath();
}

function drawBullets() {
  bullets.forEach((bullet) => {
    ctx.beginPath();
    ctx.rect(bullet.x, bullet.y, bullet.width, bullet.height);
    ctx.fillStyle = bullet.color;
    ctx.fill();
    ctx.closePath();
  });
}

function moveBullets() {
  bullets = bullets.filter((bullet) => bullet.y > 0);
  bullets.forEach((bullet) => {
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
    spaceShip.checkCollision();
    if (!spaceShip.isAlive) {
      spaceShips.splice(shipIndex, 1);
    }
  });
}

function updateScore() {
  scoreBox.textContent = `Score: ${score}`;
}

function restartGame() {

  screenOpacity = 1;

  score = 0;
  updateScore();
  bullets = [];
  spaceShips = [];
  gameIsOver = false;
  playerX = canvas.width / 2;
  setInterval(spawnSpaceShip, spaceShipSpawnInterval);
  draw();
}

function gameOver(isPlayerDead) {

  gameIsOver = true;
  if (isPlayerDead) {
  
    spaceShips = [];
    const explosionParticles = explode(playerX + playerWidth / 2, playerY + playerHeight / 2, "#ff0000");
    particles.push(...explosionParticles);
    gameOverText.style.display = "block"; 
  } else {
    gameOverText.style.display = "block";
  }
}

function draw() {
  if (!gameIsOver) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    moveBullets();
    movePlayer();
    drawPlayer();
    drawBullets();
    drawSpaceShips();
    drawParticles();
    requestAnimationFrame(draw);
  }
}

function explode(x, y, color) {
  const particles = [];
  for (let i = 0; i < 30; i++) {
    particles.push(new Particle(x, y, color));
  }
  return particles;
}

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.radius = 2;
    this.speedX = Math.random() * 4 - 2;
    this.speedY = Math.random() * 4 - 2;
    this.gravity = 0.1;
    this.alpha = 1;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.speedY += this.gravity;
    this.alpha -= 0.01;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.alpha;
    ctx.fill();
    ctx.closePath();
  }
}

function drawParticles() {
  particles.forEach((particle, index) => {
    particle.update();
    ctx.globalAlpha = particle.alpha;
    particle.draw();
    ctx.globalAlpha = 1;
    if (particle.alpha <= 0.01) { 
      particles.splice(index, 1);
    }
  });
}

const particles = [];

setInterval(spawnSpaceShip, spaceShipSpawnInterval);

updateScore();
draw();
