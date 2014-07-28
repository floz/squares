tpl = require "templates/square.jade"
consts = require "Consts"
Elt = require "Elt"

class Square extends Elt

	constructor: ( type, dir ) ->
		super
		tplCompiled = _.template tpl
		@dom = domify tplCompiled { type: type }
		@domDesc = @dom.querySelector ".elt-desc"

		@mov = { x: 0, y: 0 }

		@setDirection dir, false

	setDirection: ( value, animate = true ) ->
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
				rotation: r
			ease: Back.easeOut

		if animate
			TweenLite.to @domDesc, .4, data
		else
			TweenLite.set @domDesc, data

	activate: ( cb ) ->
		@dom.addEventListener "touchend", @_onTouch, false

	_onTouch: =>
		@emitter.emit "touch", @

	move: ->
		console.log @x, @y
		@x += @mov.x
		@y += @mov.y

		speed = .4
		TweenLite.to @dom, speed,
			css:
				x: @x * consts.size
				y: @y * consts.size
			ease: Expo.easeOut
		done .4 * 1000

module.exports = Square