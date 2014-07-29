tpl = require "templates/level.jade"
data = require "data.json"
factory = require "EltFactory"

Square = require "Square"
Goal = require "Goal"
Modifier = require "Modifier"

class Level extends Emitter

	constructor: ( @id ) ->
		@dom = domify tpl
		@_elts = []
		@_squares = []
		@_goals = []
		@_modifiers = []

		@canTouch = true

	create: ->
		dataLevel = data.levels[ @id ]
		
		fragment = document.createDocumentFragment()

		y = 0
		for line in dataLevel
			x = 0
			for dataElt in line
				if dataElt
					elt = factory.get dataElt
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
			square.move().then =>
				@_updateModifiers()
				if @_isComplete()
					@_end()
				@canTouch = true

			@_updateOtherSquares square, square.mov

	_updateModifiers: ->
		for square in @_squares
			for modifier in @_modifiers
				if square.x == modifier.x && square.y == modifier.y
					square.setDirection modifier.dir

	_updateOtherSquares: ( square, mov ) ->
		for otherSquare in @_squares
			continue if otherSquare == square
			if otherSquare.x == square.x && otherSquare.y == square.y
				otherSquare.move mov.x, mov.y
				@_updateOtherSquares otherSquare, mov

	_isComplete: ->
		countValid = 0
		for square in @_squares
			for goal in @_goals
				if goal.type == square.type
					if goal.x == square.x && square.y == goal.y
						countValid += 1

		countValid == @_squares.length

	reset: ->
		for square in @_squares
			square.setPos square.xOrigin, square.yOrigin

	_end: ->
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

module.exports = Level