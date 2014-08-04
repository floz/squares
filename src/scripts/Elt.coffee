consts = require "Consts"

class Elt

	constructor: ->
		@emitter = new Emitter()
		@domDesc = @dom.querySelector ".elt-desc"
		@mov = { x: 0, y: 0 }

	setDirection: ( value, animate = true ) ->
		@dirCurrent = value
		r = 0
		switch value
			when "l"  
				r = 180
				@mov.x = -1
				@mov.y = 0
			when "r"  
				r = 0
				@mov.x = 1
				@mov.y = 0
			when "t"  
				r = -90
				@mov.x = 0
				@mov.y = -1
			when "b"  
				r = 90
				@mov.x = 0
				@mov.y = 1

		data =
			css:
				shortRotation: r + 180
			ease: Back.easeOut

		if animate
			TweenLite.to @dom, .3, data
		else
			TweenLite.set @dom, data

	setPos: ( @x, @y ) ->
		@xOrigin = @x
		@yOrigin = @y
		TweenLite.set @dom,
			css:
				x: @x * consts.size
				y: @y * consts.size

	show: ->

	on: ( id, cb ) ->
		@emitter.on id, cb

	off: ( id, cb ) ->
		@emitter.off id, cb

module.exports = Elt