tpl = require "templates/menu-levels.jade"
tplEntry = require "templates/menu-levels-entry.jade"
save = require "save"
data = require "data.json"

class MenuLevels extends Emitter

	constructor: ->
		@dom = domify tpl

		@_domLevelsCnt = @dom.querySelector ".levels-entries"

		@_tplEntryCompiled = _.template tplEntry
		@_createList()

		@_domLevels = @dom.querySelectorAll ".levels-entry"
		@_domBtBack = @dom.querySelector ".bt-back"

	_createList: ->
		fragment = document.createDocumentFragment()
		for level, i in data.levels
			dom = domify @_tplEntryCompiled { idx: i }
			fragment.appendChild dom
		@_domLevelsCnt.appendChild fragment

	activate: ->
		@_domBtBack.addEventListener "touchend", @_onBtBack, false
		for domLevel in @_domLevels
			domLevel.addEventListener "touchend", @_onBtLevel, false
		return

	_onBtBack: =>
		@emit "back"

	_onBtLevel: ( e )  =>
		domSpan = e.currentTarget.querySelector "span"
		idx = parseInt domSpan.innerHTML
		return if idx > save.getLevel() + 1
		if idx == save.getCurrentLevel() + 1
			@emit "back"
		else
			@emit "new", idx - 1

	show: ( idx ) ->
		idxSave = save.getLevel()
		for domLevel, i in @_domLevels
			domLevel.classList.remove "deactivate"
			if i == idx
				domLevel.classList.add "selected"
			else 
				domLevel.classList.remove "selected"
				console.log idxSave, idxSave + 1
				if i > idxSave + 1
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
		for domLevel in @_domLevels
			domLevel.removeEventListener "touchend", @_onBtLevel, false
		return

module.exports = MenuLevels