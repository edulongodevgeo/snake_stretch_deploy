const gameBoard = document.getElementById('gameBoard');
const scoreElement = document.getElementById('score');
const enemiesKilledElement = document.getElementById('enemiesKilled');
const gameOverElement = document.getElementById('gameOver');
const historyElement = document.getElementById('history');
const boardSize = { width: window.innerWidth, height: window.innerHeight };
const cellSize = 20;
let snake = [{ x: Math.floor(boardSize.width / 2), y: Math.floor(boardSize.height / 2) }];
let direction = { x: 0, y: 0 };
let food = getRandomFoodPosition();
let enemies = [];
let spawnMarkers = [];
let gameInterval;
let enemyInterval;
let points = 0;
let enemiesKilled = 0;

window.addEventListener('resize', () => {
  boardSize.width = window.innerWidth;
  boardSize.height = window.innerHeight;
  gameBoard.style.width = `${boardSize.width}px`;
  gameBoard.style.height = `${boardSize.height}px`;
});

document.addEventListener('keydown', changeDirection);
startGame();

function startGame() {
  gameOverElement.style.display = 'none';
  gameInterval = setInterval(update, 100);
  enemyInterval = setInterval(spawnEnemy, 3000);
}

function update() {
  moveSnake();
  moveEnemies();
  if (checkCollision()) return gameOver();
  if (checkFoodCollision()) {
    snake.push({ ...snake[snake.length - 1] });
    food = getRandomFoodPosition();
    points++;
    updateScore();
  }
  checkEnemyCollision();
  draw();
}

function moveSnake() {
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
  snake.unshift(head);
  snake.pop();
}

function changeDirection(event) {
  const key = event.keyCode;
  if (key === 37 && direction.x === 0) {
    direction = { x: -cellSize, y: 0 };
  } else if (key === 38 && direction.y === 0) {
    direction = { x: 0, y: -cellSize };
  } else if (key === 39 && direction.x === 0) {
    direction = { x: cellSize, y: 0 };
  } else if (key === 40 && direction.y === 0) {
    direction = { x: 0, y: cellSize };
  }
}

function moveEnemies() {
  enemies.forEach(enemy => {
    const dx = snake[0].x - enemy.x;
    const dy = snake[0].y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const moveX = (dx / distance) * (cellSize / 4);
    const moveY = (dy / distance) * (cellSize / 4);
    enemy.x += moveX;
    enemy.y += moveY;
  });
}

function checkCollision() {
  const head = snake[0];
  if (head.x < 0 || head.x >= boardSize.width || head.y < 0 || head.y >= boardSize.height) return true;
  if (snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)) return true;
  return false;
}

function checkFoodCollision() {
  const head = snake[0];
  return head.x === food.x && head.y === food.y;
}

function checkEnemyCollision() {
  enemies = enemies.filter(enemy => {
    const isHeadCollision = Math.abs(enemy.x - snake[0].x) < cellSize && Math.abs(enemy.y - snake[0].y) < cellSize;
    const isBodyCollision = snake.slice(1).some(segment => Math.abs(enemy.x - segment.x) < cellSize && Math.abs(enemy.y - segment.y) < cellSize);
    if (isBodyCollision) {
      enemiesKilled++;
      updateEnemiesKilled();
    }
    return !isBodyCollision;
  });

  if (enemies.some(enemy => Math.abs(enemy.x - snake[0].x) < cellSize && Math.abs(enemy.y - snake[0].y) < cellSize)) {
    gameOver();
  }
}

function spawnEnemy() {
  const x = Math.floor(Math.random() * (boardSize.width / cellSize)) * cellSize;
  const y = Math.floor(Math.random() * (boardSize.height / cellSize)) * cellSize;
  showSpawnMarker(x, y);
  setTimeout(() => {
    enemies.push({ x, y });
    spawnMarkers = spawnMarkers.filter(marker => marker.x !== x || marker.y !== y);
  }, 2000);
}

function showSpawnMarker(x, y) {
  spawnMarkers.push({ x, y });
}

function getRandomFoodPosition() {
  const x = Math.floor(Math.random() * (boardSize.width / cellSize)) * cellSize;
  const y = Math.floor(Math.random() * (boardSize.height / cellSize)) * cellSize;
  return { x, y };
}

function draw() {
  gameBoard.innerHTML = '';
  snake.forEach(segment => {
    const snakeElement = document.createElement('div');
    snakeElement.style.left = `${segment.x}px`;
    snakeElement.style.top = `${segment.y}px`;
    snakeElement.classList.add('snake');
    gameBoard.appendChild(snakeElement);
  });
  const foodElement = document.createElement('div');
  foodElement.style.left = `${food.x}px`;
  foodElement.style.top = `${food.y}px`;
  foodElement.classList.add('food');
  gameBoard.appendChild(foodElement);

  spawnMarkers.forEach(marker => {
    const markerElement = document.createElement('div');
    markerElement.style.left = `${marker.x}px`;
    markerElement.style.top = `${marker.y}px`;
    markerElement.classList.add('spawn-marker');
    markerElement.textContent = 'X';
    gameBoard.appendChild(markerElement);
  });

  enemies.forEach(enemy => {
    const enemyElement = document.createElement('div');
    enemyElement.style.left = `${enemy.x}px`;
    enemyElement.style.top = `${enemy.y}px`;
    enemyElement.classList.add('enemy');
    gameBoard.appendChild(enemyElement);
  });
}

function updateScore() {
  scoreElement.textContent = `Points: ${points}`;
}

function updateEnemiesKilled() {
  enemiesKilledElement.textContent = `Enemies Killed: ${enemiesKilled}`;
}

function gameOver() {
  clearInterval(gameInterval);
  clearInterval(enemyInterval);
  saveScore(points, enemiesKilled);
  showHistory();
  gameOverElement.style.display = 'block';
  // Reset the game state
  snake = [{ x: Math.floor(boardSize.width / 2), y: Math.floor(boardSize.height / 2) }];
  direction = { x: 0, y: 0 };
  food = getRandomFoodPosition();
  enemies = [];
  spawnMarkers = [];
  points = 0;
  enemiesKilled = 0;
  updateScore();
  updateEnemiesKilled();
}

function saveScore(points, enemiesKilled) {
  const scores = JSON.parse(localStorage.getItem('scores')) || [];
  scores.push({ points, enemiesKilled });
  scores.sort((a, b) => (b.points + b.enemiesKilled) - (a.points + a.enemiesKilled));
  if (scores.length > 5) {
    scores.length = 5;
  }
  localStorage.setItem('scores', JSON.stringify(scores));
}

function showHistory() {
  const scores = JSON.parse(localStorage.getItem('scores')) || [];
  historyElement.innerHTML = '<h2>Últimos Recordes</h2>';
  scores.forEach((score, index) => {
    historyElement.innerHTML += `<div>Recorde ${index + 1}: ${score.points} pontos, ${score.enemiesKilled} inimigos mortos (Total: ${score.points + score.enemiesKilled})</div>`;
  });
}

function restartGame() {
  gameOverElement.style.display = 'none';
  startGame();
}
