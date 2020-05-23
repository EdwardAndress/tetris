document.addEventListener('DOMContentLoaded', () => {

  const GRID_WIDTH 			= 10
  const MINI_GRID_WIDTH = 4
	const SCORE_DISPLAY 	= document.querySelector('#score')
	const START_BUTTON 		=	document.querySelector('#start-button')

	let grid 							= createGrid("#grid", 210)
	let miniGrid 					= createGrid("#mini-grid", 16)
	let theTetrominoes 		= buildTetraminoes(GRID_WIDTH)
	let tetrominoPreviews = buildTetraminoes(MINI_GRID_WIDTH, preview=true)

	let timerId
	let score = 0
	let gameRunning = false

  var currentPosition
  var currentRotation
  var currentRandomIndex
  var currentTetramino
  var nextRandomIndex = randomIndex(theTetrominoes)

	var squares 			  = Array.from(document.querySelectorAll('#grid div'))
	var miniGridSquares = Array.from(document.querySelectorAll('#mini-grid div'))

  function displayPreview() {
  	clearGrid(miniGridSquares)
  	tetrominoPreviews[nextRandomIndex].forEach( index => miniGridSquares[index].classList.add('tetramino') )
  }

  function randomIndex(array) {
  	return Math.floor(Math.random() * array.length)
  }

  function setNextTetramino() {
  	currentRotation 	 = 0
  	currentRandomIndex = nextRandomIndex 
		nextRandomIndex 	 = randomIndex(theTetrominoes)
		currentTetramino 	 = theTetrominoes[currentRandomIndex][currentRotation]  				
		currentPosition    = 4
  }

  function draw() {
  	currentTetramino.forEach(index => {
  		squares[currentPosition + index].classList.add('tetramino')
  	})
  }

  function undraw() {
  	currentTetramino.forEach(index => {
  		squares[currentPosition + index].classList.remove('tetramino')
  	})
  }

  function moveDown() {
  	undraw()
  	currentPosition += GRID_WIDTH
  	draw()
  	if(collisionDetected()) { freeze() }
  }

	function collisionDetected() {
		return nextSqaures().some(sqaure => sqaure.classList.contains('taken'))
	}

	function nextSqaures() {
		return currentTetramino.map(index => squares[currentPosition + index + GRID_WIDTH])
	}

  function freeze() {
		currentTetramino.forEach(index => squares[currentPosition + index].classList.add('taken'))
		setNextTetramino()
		displayPreview()
		draw()
		addScore()
		gameOver()
  }

  function control(event) {
  	if(event.keyCode === 37) {
  		moveLeft()
  	} else if(event.keyCode == 39) {
  		moveRight()
  	} else if(event.keyCode == 40 && gameRunning) {
  		moveDown()
  	} else if(event.keyCode == 38) {
  		rotate()
  	}
  }

  document.addEventListener('keydown', control)

  function moveLeft() {
  	undraw()
  	const atLeftEdge = currentTetramino.some(index => (currentPosition + index) % GRID_WIDTH === 0)
  	if(!atLeftEdge) currentPosition -=1
  	if(currentTetramino.some(index => squares[currentPosition + index].classList.contains('taken'))) {
  		currentPosition +=1
  	}
  	draw()
  }

  function moveRight() {
  	undraw()
  	const atRightEdge = currentTetramino.some(index => (currentPosition + index) % GRID_WIDTH === GRID_WIDTH - 1)
  	if(!atRightEdge) currentPosition +=1
  	if(currentTetramino.some(index => squares[currentPosition + index].classList.contains('taken'))) {
  		currentPosition -=1
  	}
  	draw()
  }

  function rotate() {
  	undraw()
  	currentRotation +=1
  	if(currentRotation == 4) {
  		currentRotation = 0
  	}
  	currentTetramino = theTetrominoes[currentRandomIndex][currentRotation]
  	draw()
  }

  function addScore() {
  	for (i = 0; i < 199; i += GRID_WIDTH) {
  		
  		const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9]

  		if (row.every(index => squares[index].classList.contains('taken'))) {
  			score += 10
  			SCORE_DISPLAY.innerHTML = score
  			row.forEach(index => { squares[index].classList.remove('taken') })
  			row.forEach(index => { squares[index].classList.remove('tetramino') })
  			removedSquares = squares.splice(i, GRID_WIDTH)
  			squares = removedSquares.concat(squares)
  			squares.forEach(square => grid.appendChild(square))
  		}
  	}
  }

  function gameOver() {
  	if(currentTetramino.some(index => squares[currentPosition + index].classList.contains('taken'))) {
  		clearInterval(timerId)
  		clearGrid(squares)
  		gameRunning = false
  	}
  }

  function clearGrid(gridSquares) {
  	gridSquares.slice(0,200).forEach( square => square.classList.remove(...square.classList))
  }

	START_BUTTON.addEventListener('click', startOrPause)

	function startOrPause() {
		if (gameRunning) {
			clearInterval(timerId)
			timerId = null
		} else {
			setNextTetramino()
			displayPreview()
	  	timerId     = setInterval(moveDown, 1000)
	  	gameRunning = true
		}
	}
})

function createGrid(selector, limit) {

	container = document.querySelector(selector)

	for (i = 0; i < limit; i++) {
		let newDiv = document.createElement("div")
		if(i > 199) { newDiv.classList.add('taken') }
		container.appendChild(newDiv)
	}

	return container
}
