tpl = require "templates/menu-levels.jade"
save = require "save"

class MenuLevels extends Emitter

	constructor: ->
		@dom = domify tpl

		@_domLevels = @dom.querySelectorAll ".levels-entry"
		@_domBtBack = @dom.querySelector ".bt-back"

	activate: ->
		@_domBtBack.addEventListener "touchend", @_onBtBack, false

	_onBtBack: =>
		@emit "back"

	show: ( idx ) ->
		idxSave = save.getLevel()
		for domLevel, i in @_domLevels
			domLevel.classList.remove "deactivate"
			if i == idx
				domLevel.classList.add "selected"
			else 
				domLevel.classList.remove "selected"
				if i > idxSave
					domLevel.classList.add "deactivate"

		TweenLite.set @dom,
			css:
				alpha: 0
		TweenLite.to @dom, .4,
			css:
				alpha: 1

	hide: ->
		TweenLite.to @dom, .25,
			css:
				alpha: 0

		done .25 * 1000

	deactivate: ->
		@_domBtBack.removeEventListener "touchend", @_onBtBack, false

module.exports = MenuLevels