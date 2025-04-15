const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let circle = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 20,
    color: 'blue',
    speed: 7
};

let keys = {};
let mouse = { x: 0, y: 0 };
let bullets = [];
let shootInterval = 1000;
let shootIntervalId = setInterval(shootBullet, shootInterval);

const frequencySlider = document.getElementById('frequencySlider');
frequencySlider.addEventListener('input', (event) => {
    shootInterval = parseInt(event.target.value, 10);
    clearInterval(shootIntervalId);
    shootIntervalId = setInterval(shootBullet, shootInterval);
});

let squareCount = 5; // Initial number of squares

function generateSquares(count) {
    const newSquares = [];
    let attempts = 0; // Track the number of attempts
    const maxAttempts = count * 10; // Allow up to 10 attempts per square

    while (newSquares.length < count && attempts < maxAttempts) {
        const square = {
            x: Math.random() * (canvas.width - 40) + 10, // Ensure at least 10px from left and right edges
            y: Math.random() * (canvas.height - 40) + 10, // Ensure at least 10px from top and bottom edges
            size: 30,
            color: 'red',
            dx: (Math.random() - 0.5) * 4,
            dy: (Math.random() - 0.5) * 4,
            angle: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.1
        };

        // Ensure the square is not within 50px of the blue circle
        const distanceX = Math.abs(square.x + square.size / 2 - circle.x);
        const distanceY = Math.abs(square.y + square.size / 2 - circle.y);
        if (distanceX > circle.radius + 50 && distanceY > circle.radius + 50) {
            newSquares.push(square);
        }

        attempts++;
    }

    if (newSquares.length < count) {
        console.warn(`Only generated ${newSquares.length} squares out of ${count} after ${attempts} attempts.`);
    }

    return newSquares;
}

let squares = generateSquares(squareCount);

function drawCircle() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.shadowColor = '#00f'; // Neon blue glow
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
    ctx.fillStyle = circle.color;
    ctx.fill();
    ctx.closePath();
    ctx.restore();
}

function shootBullet() {
    const angle = Math.atan2(mouse.y - circle.y, mouse.x - circle.x);

    if (score > 100) {
        // Fire three bullets in parallel
        const offsets = [-20, 0, 20]; // Vertical offsets for parallel bullets
        offsets.forEach(offset => {
            bullets.push({
                x: circle.x,
                y: circle.y + offset,
                radius: 5,
                color: 'black',
                speed: 10,
                dx: Math.cos(angle) * 10,
                dy: Math.sin(angle) * 10
            });
        });
    } else {
        // Fire a single bullet
        bullets.push({
            x: circle.x,
            y: circle.y,
            radius: 5,
            color: 'black',
            speed: 10,
            dx: Math.cos(angle) * 10,
            dy: Math.sin(angle) * 10
        });
    }
}

function updateBullets() {
    bullets.forEach((bullet, index) => {
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;

        // Remove bullets that go off-screen
        if (
            bullet.x < 0 || bullet.x > canvas.width ||
            bullet.y < 0 || bullet.y > canvas.height
        ) {
            bullets.splice(index, 1);
        }
    });
}

function drawBullets() {
    bullets.forEach(bullet => {
        ctx.save();
        ctx.shadowColor = '#ff0'; // Neon yellow glow
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'yellow'; // Change bullet color to yellow
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    });
}

function drawSquares() {
    squares.forEach(square => {
        ctx.save();
        ctx.translate(square.x + square.size / 2, square.y + square.size / 2); // Move to square center
        ctx.rotate(square.angle); // Rotate the square
        ctx.shadowColor = '#f00'; // Neon red glow
        ctx.shadowBlur = 20;
        ctx.fillStyle = square.color;
        ctx.fillRect(-square.size / 2, -square.size / 2, square.size, square.size); // Draw rotated square
        ctx.restore();
    });
}

function updateSquares() {
    squares.forEach((square, index) => {
        square.x += square.dx;
        square.y += square.dy;
        square.angle += square.rotationSpeed; // Update rotation angle

        // Prevent squares from going off-screen by bouncing them back
        if (square.x < 0) {
            square.x = 0;
            square.dx *= -1;
        }
        if (square.x + square.size > canvas.width) {
            square.x = canvas.width - square.size;
            square.dx *= -1;
        }
        if (square.y < 0) {
            square.y = 0;
            square.dy *= -1;
        }
        if (square.y + square.size > canvas.height) {
            square.y = canvas.height - square.size;
            square.dy *= -1;
        }
    });
}

let score = 0;
let level = 0;
const scoreDisplay = document.getElementById('scoreDisplay');
const levelDisplay = document.getElementById('levelDisplay');

function updateScore() {
    score++;
    scoreDisplay.textContent = `Score: ${score}`;
}

function resetScore() {
    score = 0;
    scoreDisplay.textContent = `Score: ${score}`;
}

function updateLevel() {
    level++;
    levelDisplay.textContent = `Level: ${level}`;
}

function resetLevel() {
    level = 0;
    levelDisplay.textContent = `Level: ${level}`;
}

function animateSquareDisappearance(square, callback) {
    const startTime = performance.now();
    const duration = 500; // 0.5 seconds
    const initialSize = square.size;
    const expandedSize = square.size + 4; // Expand by 2px on all sides

    function animate(time) {
        const elapsed = time - startTime;
        const progress = elapsed / duration;

        if (progress < 0.5) {
            // Expand phase (first 50% of the duration)
            square.size = initialSize + (expandedSize - initialSize) * (progress / 0.5);
        } else if (progress < 1) {
            // Shrink phase (last 50% of the duration)
            square.size = expandedSize - (expandedSize - 1) * ((progress - 0.5) / 0.5);
        } else {
            // End of animation
            square.size = 1;
            callback(); // Call the callback to remove the square
            return;
        }

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}

const popSound = document.getElementById('popSound');

function playPopSound() {
    if (!popSound.paused) {
        popSound.currentTime = 0; // Reset sound to the beginning if it's already playing
    }
    popSound.play();
}

function checkCollisions() {
    // Check bullet collisions with squares
    bullets.forEach((bullet, bulletIndex) => {
        squares.forEach((square, squareIndex) => {
            if (
                bullet.x > square.x &&
                bullet.x < square.x + square.size &&
                bullet.y > square.y &&
                bullet.y < square.y + square.size
            ) {
                const squareToRemove = squares[squareIndex];
                bullets.splice(bulletIndex, 1);

                // Animate the square disappearance
                animateSquareDisappearance(squareToRemove, () => {
                    // Ensure the square is removed from the array
                    const squareIndexInArray = squares.indexOf(squareToRemove);
                    if (squareIndexInArray !== -1) {
                        squares.splice(squareIndexInArray, 1);
                    }
                    updateScore(); // Increment the score for each hit
                    playPopSound(); // Play the pop sound
                });
            }
        });
    });

    // Respawn squares with double the count if all are removed
    if (squares.length === 0) {
        squareCount *= 2; // Double the number of squares
        squares = generateSquares(squareCount);
        updateLevel(); // Increment the level
    }

    // Check circle collisions with squares
    squares.forEach(square => {
        if (
            circle.x + circle.radius > square.x &&
            circle.x - circle.radius < square.x + square.size &&
            circle.y + circle.radius > square.y &&
            circle.y - circle.radius < square.y + square.size
        ) {
            gameOver();
        }
    });
}

function gameOver() {
    cancelAnimationFrame(animationFrameId); // Stop the game loop
    alert('Game Over!'); // Show the Game Over alert
    resetScore(); // Reset the score
    resetLevel(); // Reset the level
    restartGame(); // Restart the game after the alert
}

function restartGame() {
    circle.x = canvas.width / 2;
    circle.y = canvas.height / 2;
    bullets = [];
    squareCount = 5; // Reset to initial number of squares
    squares = generateSquares(squareCount);
    updateCirclePosition();
}

let animationFrameId;
function updateCirclePosition() {
    if (keys['ArrowUp'] && circle.y - circle.radius > 0) circle.y -= circle.speed;
    if (keys['ArrowDown'] && circle.y + circle.radius < canvas.height) circle.y += circle.speed;
    if (keys['ArrowLeft'] && circle.x - circle.radius > 0) circle.x -= circle.speed;
    if (keys['ArrowRight'] && circle.x + circle.radius < canvas.width) circle.x += circle.speed;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCircle();
    updateBullets();
    drawBullets();
    updateSquares();
    drawSquares();
    checkCollisions();

    animationFrameId = requestAnimationFrame(updateCirclePosition);
}

window.addEventListener('keydown', (event) => {
    keys[event.key] = true;
});

window.addEventListener('keyup', (event) => {
    keys[event.key] = false;
});

canvas.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

updateCirclePosition();
