tpl = require "templates/level.jade"
data = require "data.json"
factory = require "EltFactory"

Square = require "Square"
Goal = require "Goal"

class Level

	constructor: ( @id ) ->
		@dom = domify tpl
		@_elts = []
		@_squares = []
		@_goals = []

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
					fragment.appendChild elt.dom
					@_elts.push elt
				x++
			y++

		@dom.appendChild fragment

	start: ->
		@_onTouchBind = _.bind @_onTouch
		for square in @_squares
			square.activate()
			square.on "touch", @_onTouch

	_onTouch: ( square ) =>
		if @canTouch
			@canTouch = false
			square.move().then =>
				@canTouch = true

	isComplete: ->
		for square in @_squares
			 console.log square

module.exports = Level