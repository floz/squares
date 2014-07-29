tpl = require "templates/square.jade"
consts = require "Consts"
Elt = require "Elt"

class Square extends Elt

	constructor: ( @type, dir ) ->
		tplCompiled = _.template tpl
		@dom = domify tplCompiled { type: type }
		super

		@setDirection dir, false

	activate: ( cb ) ->
		@dom.addEventListener "touchend", @_onTouch, false

	_onTouch: =>
		@emitter.emit "touch", @

	move: ( x = 0, y = 0 ) ->
		if x != 0 || y !=0
			console.log x, y
			@x += x
			@y += y
		else
			@x += @mov.x
			@y += @mov.y

		speed = .4
		TweenLite.to @dom, speed,
			css:
				x: @x * consts.size
				y: @y * consts.size
			ease: Expo.easeOut

		done ( speed - .1 ) * 1000

module.exports = Square