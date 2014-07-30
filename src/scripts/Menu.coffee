tpl = require "templates/menu.jade"

class Menu extends Emitter

	constructor: ->
		@dom = domify tpl

		@domBtPlay = @dom.querySelector ".menu-action--play"
		@domBtChallenge = @dom.querySelector ".menu-action--challenge"

	activate: ->
		@domBtPlay.addEventListener "touchend", @_onBtPlay, false

	_onBtPlay: =>
		@emit "play"

	show: ->
		TweenLite.to @dom, .4,
			css:
				alpha: 1

		done .4 * 1000

	hide: ->
		TweenLite.to @dom, .4,
			css:
				alpha: 0

		done .3 * 1000

	deactivate: ->
		@domBtPlay.removeEventListener "touchend", @_onBtPlay, false

module.exports = Menu