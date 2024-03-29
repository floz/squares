tpl = require "templates/level.jade"
data = require "data.json"
factory = require "EltFactory"
save = require "save"

Square = require "Square"
Goal = require "Goal"
Modifier = require "Modifier"

class Level extends Emitter

	constructor: ( @idx ) ->
		@dom = domify tpl
		
		@_elts = []
		@_squares = []
		@_goals = []
		@_modifiers = []

		@_history = []

		@canTouch = true

	create: ->
		dataLevel = data.levels[ @idx ]
		
		fragment = document.createDocumentFragment()

		y = 0
		for line in dataLevel
			x = 0
			for dataElt in line
				if dataElt
					elts = factory.get dataElt
					for elt in elts
						elt.setPos x, y
						@_squares.push elt if elt instanceof Square
						@_goals.push elt if elt instanceof Goal
						@_modifiers.push elt if elt instanceof Modifier
						fragment.appendChild elt.dom
						@_elts.push elt
				x++
			y++

		@dom.appendChild fragment

	show: ->
		TweenLite.to @dom, .2,
			css:
				alpha: 1

		speed = .4
		for elt in @_elts
			TweenLite.set elt.dom,
				css:
					scale: 0
					alpha: 0
			TweenLite.to elt.dom, speed,
				css:
					alpha: 1
					scale: 1
				ease: Back.easeOut

		done speed * 1000

	start: ->
		@_onTouchBind = _.bind @_onTouch
		for square in @_squares
			square.activate()
			square.on "touch", @_onTouch

	_onTouch: ( square ) =>
		if @canTouch
			@canTouch = false
			history = []
			history.push { target: square, x: square.x, y: square.y, dir: square.dirCurrent }
			square.move().then =>
				if @_isComplete()
					@_end()
				@canTouch = true

			@_history.push history				

			@_updateOtherSquares square, square.mov, history
			setTimeout @_updateModifiers, 50

	_updateModifiers: =>
		for square in @_squares
			for modifier in @_modifiers
				if square.x == modifier.x && square.y == modifier.y
					square.setDirection modifier.dir

	_updateOtherSquares: ( square, mov, history ) ->
		for otherSquare in @_squares
			continue if otherSquare == square
			if otherSquare.x == square.x && otherSquare.y == square.y
				history.push { target: otherSquare, x: otherSquare.x, y: otherSquare.y, dir: otherSquare.dirCurrent }
				otherSquare.move mov.x, mov.y
				@_updateOtherSquares otherSquare, mov, history

	_isComplete: ->
		countValid = 0
		for square in @_squares
			for goal in @_goals
				if goal.type == square.type
					if goal.x == square.x && square.y == goal.y
						countValid += 1

		countValid == @_squares.length

	undo: ->
		return if not @canTouch
		prevActions = @_history.pop()
		return if not prevActions
		@canTouch = false
		for prevAction in prevActions
			go = prevAction.target.go prevAction.x, prevAction.y
			prevAction.target.setDirection prevAction.dir

		go.then =>
			@canTouch = true

	reset: ->
		@_history = []
		for square in @_squares
			square.setPos square.xOrigin, square.yOrigin
			square.setDirection square.dir, false

	_end: ->
		save.setCurrentLevel @idx
		@emit "complete"

	hide: ->
		speed = .25
		for elt in @_elts
			TweenLite.to elt.dom, speed,
				css:
					alpha: 0
					scale: 0
				ease: Back.easeIn
		done speed * 1000

	dispose: ->
		for square in @_squares
			square.deactivate()
			square.off "touch", @_onTouch

module.exports = Level