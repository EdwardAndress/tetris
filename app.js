document.addEventListener('DOMContentLoaded', () => {
	 
	// TODO: look at scope of vars

  const GRID_WIDTH 			= 10
	const GRID_HEIGHT			= 22
	const GRID_SIZE 			= GRID_HEIGHT * GRID_WIDTH
	const PREVIEW_WIDTH   = 4
	const PREVIEW_HEIGHT	= 4
	const SCORE_DISPLAY 	= document.querySelector('#score')
	const START_BUTTON 		=	document.querySelector('#start-button')


	// TODO: implement sensible defaults for createGrid
	let grid 							= createGrid({id: "#grid", height: GRID_HEIGHT, width: GRID_WIDTH})
	let preview 					= createGrid({id: "#preview", height: PREVIEW_HEIGHT, width: PREVIEW_WIDTH, preview: true})
	let theTetrominoes 		= buildTetraminoes(GRID_WIDTH)
	let tetrominoPreviews = buildTetraminoes(PREVIEW_WIDTH, preview=true)

	let timerId
	let score = 0
	let gameRunning = false

  var currentPosition
  var currentRotation
  var currentRandomIndex
  var currentTetramino
  var nextRandomIndex = randomIndex(theTetrominoes)

	var gridSquares = Array.from(document.querySelectorAll('#grid div'))
	var rows = _.chunk(gridSquares, GRID_WIDTH)
	var previewSquares = Array.from(document.querySelectorAll('#preview div'))

  function displayPreview() {
  	clearGrid(previewSquares)
  	nextTetramino().forEach( index => drawPart(index, previewSquares) )
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
  		drawPart(index + currentPosition, gridSquares)
  	})
  }

  function undrawTetramino() {
  	currentTetramino.forEach(index => {
  		undrawPart(index + currentPosition, gridSquares)
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

	function occupied(square) {
		return square.classList.contains('taken')
	}

	function visible(square) {
		return !square.classList.contains('hidden')
	}

	function nextSqaures() {
		return currentTetramino.map(index => gridSquares[currentPosition + index + GRID_WIDTH])
	}

	function freezePart(index) {
		gridSquares[currentPosition + index].classList.add('taken')
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
		return currentTetramino.map(index => gridSquares[currentPosition + index])
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
		// TODO: prevent rotation wrapping
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
  	for (i = 0; i < GRID_SIZE; i += GRID_WIDTH) {
  		const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9]

  		if (completeRow(row)) {
  			incrementScore(10)
  			clearRow(row)
  			shiftRow(i)
  		}
  	}
	}

	function clearRow(row) {
		row.forEach(index => { clearSquare(gridSquares[index]) })
	}

	function completeRow(row) {
		return row.every(index =>
			occupied(gridSquares[index]) &&
			visible(gridSquares[index])
		)
	}

	function shiftRow(i) {
		gridSquares  = gridSquares.splice(i, GRID_WIDTH).concat(gridSquares)
		gridSquares.forEach(square => udpateGrid(square))
	}
	
	function incrementScore(points) {
		score += points
		SCORE_DISPLAY.innerHTML = score
	}

  function gameOver() {
  	if(currentTetramino.some(index => occupied(gridSquares[currentPosition + index]))) {
  		clearInterval(timerId)
  		clearGrid(gridSquares)
  		gameRunning = false
  	}
  }

  function clearGrid(gridSquares) {
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
	// TODO: tidy this up!
	id 			= properties['id']
	height 	= properties['height']
	width   = properties['width']
	preview = properties['preview']

	container = document.querySelector(id)
	container.style.height = preview ? `${height * 22}px` : `${(height - 1) * 22}px`
	container.style.width  = `${width * 22}px`
	total_squares    = height * width
	hidden_row_start = total_squares - width

	for (i = 1; i <= total_squares; i++) {
		let newDiv = document.createElement("div")

		if(i > hidden_row_start && !preview) { newDiv.classList.add('taken', 'hidden')}
		container.appendChild(newDiv)
	}

	return container
}
