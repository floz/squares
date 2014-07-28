consts = require "Consts"

class Elt

	constructor: ->
		@emitter = new Emitter()

	setPos: ( @x, @y ) ->
		console.log "hey", @x, @y
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