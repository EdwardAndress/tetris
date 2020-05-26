document.addEventListener('DOMContentLoaded', () => {


	
  const GRID_WIDTH 			= 10
  const GRID_HEIGHT			= 22
  const MINI_GRID_WIDTH = 4
	const SCORE_DISPLAY 	= document.querySelector('#score')
	const START_BUTTON 		=	document.querySelector('#start-button')


	let grid 							= createGrid({container_id: "#grid", height: GRID_HEIGHT, width: GRID_WIDTH})
	let miniGrid 					= createGrid({container_id: "#mini-grid", height: 4, width: MINI_GRID_WIDTH, preview: true})
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

	var mainGridSquares = Array.from(document.querySelectorAll('#grid div'))
	var miniGridSquares = Array.from(document.querySelectorAll('#mini-grid div'))

  function displayPreview() {
  	clearGrid(miniGridSquares)
  	nextTetramino().forEach( index => drawPart(index, miniGridSquares) )
	}

	function drawPart(index, squares) {
		squares[index].classList.add('tetramino-part')
	}
	
	function nextTetramino() {
		return tetrominoPreviews[nextRandomIndex]
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

  function drawTetramino() {
  	currentTetramino.forEach(index => {
  		drawPart(index + currentPosition, mainGridSquares)
  	})
  }

  function undrawTetramino() {
  	currentTetramino.forEach(index => {
  		undrawPart(index + currentPosition, mainGridSquares)
  	})
	}
	
	function undrawPart(index, squares) {
		squares[index].classList.remove('tetramino-part')
	}

  function moveDown() {
  	undrawTetramino()
  	incrementPosition()
  	drawTetramino()
  	if(collision()) { freeze() }
	}
	
	function incrementPosition() {
		currentPosition += GRID_WIDTH
	}

	function collision() {
		return nextSqaures().some(square => occupied(square))
	}

	function occupied(sqaure) {
		return sqaure.classList.contains('taken')
	}

	function nextSqaures() {
		return currentTetramino.map(index => mainGridSquares[currentPosition + index + GRID_WIDTH])
	}

	function freezePart(index) {
		mainGridSquares[currentPosition + index].classList.add('taken')
	}

  function freeze() {
		currentTetramino.forEach(index => freezePart(index))
		setNextTetramino()
		displayPreview()
		drawTetramino()
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
	
	function notAtLeftEdge(index) {
		return (currentPosition + index) % GRID_WIDTH != 0
	}

	function notAtRightEdge(index) {
		return (currentPosition + index) % GRID_WIDTH != GRID_WIDTH - 1
	}

	function spaceOnLeft() {
		return currentTetramino.every(index => notAtLeftEdge(index))
	}

	function spaceOnRight() {
		return currentTetramino.every(index => notAtRightEdge(index))
	}
	
  function moveLeft() {
		undrawTetramino()
  	if(spaceOnLeft()) currentPosition -=1
  	if(currentSquares().some(square => occupied(square))) {
  		currentPosition +=1
  	}
  	drawTetramino()
	}
	
	function currentSquares() {
		return currentTetramino.map(index => mainGridSquares[currentPosition + index])
	}

  function moveRight() {
  	undrawTetramino()
  	if(spaceOnRight()) currentPosition +=1
  	if(currentSquares().some(square => occupied(square))) {
  		currentPosition -=1
  	}
  	drawTetramino()
  }

  function rotate() {
  	undrawTetramino()
  	currentRotation = incrementRotation(currentRotation)
  	currentTetramino = theTetrominoes[currentRandomIndex][currentRotation]
  	drawTetramino()
	}
	
	function incrementRotation(rotation) {
  	if(rotation == 3) {
  		return 0
  	} else {
			return rotation += 1
		}
	}

	function udpateGrid(square) {
		grid.appendChild(square)
	}

  function addScore() {
  	// TODO: tidy this up!
  	const LAST_VISIBLE_SQUARE = ((GRID_WIDTH * GRID_HEIGHT) - GRID_WIDTH) - 1

  	for (i = 0; i < LAST_VISIBLE_SQUARE; i += GRID_WIDTH) {
  		
  		const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9]

  		if (row.every(index => occupied(mainGridSquares[index]))) {
  			incrementScore(10)
  			row.forEach(index => { clearSquare(mainGridSquares[index]) })
  			shiftRow(i)
  		}
  	}
	}

	function shiftRow(i) {
		mainGridSquares  = mainGridSquares.splice(i, GRID_WIDTH).concat(mainGridSquares)
		mainGridSquares.forEach(square => udpateGrid(square))
	}
	
	function incrementScore(points) {
		score += points
		SCORE_DISPLAY.innerHTML = score
	}

  function gameOver() {
  	if(currentTetramino.some(index => occupied(mainGridSquares[currentPosition + index]))) {
  		clearInterval(timerId)
  		clearGrid(mainGridSquares)
  		gameRunning = false
  	}
  }

  function clearGrid(gridSquares) {
  	// probably needs refactoring
  	gridSquares.slice(0,GRID_WIDTH * GRID_HEIGHT).forEach( square => clearSquare(square))
	}
	
	function clearSquare(square) {
		square.classList.remove(...square.classList)
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

function createGrid(properties) {
	// TODO tidy this up!
	container_id = properties['container_id']
	height 			 = properties['height']
	width 			 = properties['width']
	preview 		 = properties['preview']

	container = document.querySelector(container_id)
	container.style.height = preview ? `${height * 22}px` : `${(height - 1) * 22}px`
	container.style.width  = `${width * 22}px`
	total_sqaures    = height * width
	hidden_row_start = total_sqaures - width

	for (i = 1; i <= total_sqaures; i++) {
		let newDiv = document.createElement("div")

		if(i > hidden_row_start && !preview) { newDiv.classList.add('taken')}
		container.appendChild(newDiv)
	}

	return container
}
