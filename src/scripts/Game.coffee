tpl = require "templates/game.jade"
Level = require "Level"
Screen = require "Screen"
MenuLevels = require "MenuLevels"
save = require "save"
data = require "data.json"

class Game extends Emitter

	constructor: ->
		@dom = domify tpl
		console.log @dom

		@_domGame = @dom.querySelector "#game"
		@_domScreens = @dom.querySelector "#screens"

		@_domGameContent = @dom.querySelector ".game-content"

		domMenu = @dom.querySelector ".game-menu"
		@_domMenuMenu = domMenu.querySelector ".game-menu-item--menu"
		@_domMenuLevels = domMenu.querySelector ".game-menu-item--levels"

		domControls = @dom.querySelector ".game-controls"
		@_domControlUndo = domControls.querySelector ".game-control--undo"
		@_domControlReset = domControls.querySelector ".game-control--reset"		

		@_menuLevels = new MenuLevels()

		@_started = false
		@_ended = false

		@_idx = parseInt save.getCurrentLevel()
		if not @_idx && @_idx != 0
			@_idx = -1

	start: ->
		if @_started
			@_idx -= 1

		@_activate()
		@_newScreen()
		@_started = true

	_activate: ->
		@_domMenuMenu.addEventListener "touchend", @_onMenuMenu, false
		@_domMenuLevels.addEventListener "touchend", @_onMenuLevels, false
		@_domControlUndo.addEventListener "touchend", @_onUndo, false
		@_domControlReset.addEventListener "touchend", @_onReset, false
		@_menuLevels.on "back", @_onMenuLevelsBack
		@_menuLevels.on "new", @_onSelectLevel

	_onMenuMenu: =>
		@emit "menu"

	_onMenuLevels: =>
		@_domGame.appendChild @_menuLevels.dom
		@_menuLevels.activate() 
		@_menuLevels.show @_idx

	_onMenuLevelsBack: =>
		if @_ended
			@_onMenuMenu()
			return
		@_menuLevels.deactivate()
		@_menuLevels.hide().then =>
			@_domGame.removeChild @_menuLevels.dom

	_onSelectLevel: ( idx ) =>
		@_menuLevels.deactivate()
		@_menuLevels.hide().then =>
			@_domGame.removeChild @_menuLevels.dom

			save.setCurrentLevel idx
			@_idx = idx
			@_nextScreen()

	_onUndo: =>
		@_level.undo()

	_onReset: =>
		@_level.reset()

	_nextLevel: ->
		@_idx++

		@_level = new Level @_idx
		@_level.on "complete", @_nextScreen
		@_level.create()
		@_domGameContent.appendChild @_level.dom
		@_level.show().then =>
			@_level.start()

		TweenLite.to @_domGame, .2,
			css:
				alpha: 1

	_onEnd: ->
		@_ended = true
		@_screen = new Screen 9999
		@_domScreens.appendChild @_screen.dom
		document.body.addEventListener "touchend", @_nextEnd, false
		@_screen.show()

	_nextEnd: =>
		document.body.removeEventListener "touchend", @_nextEnd, false

		@_started = false
		@_idx = -1
		save.setCurrentLevel @_idx
		@_onMenuMenu()

	_nextScreen: =>
		@_level.hide().then =>
			@_domGameContent.removeChild @_level.dom
			@_level.dispose()
			@_level = null

			@_newScreen()

	_newScreen: ->
		idx = @_idx + 1
		if idx >= data.levels.length
			@_onEnd()
			return

		@_screen = new Screen idx
		@_domScreens.appendChild @_screen.dom
		document.body.addEventListener "touchend", @_next, false
		@_screen.show()

	_next: =>
		document.body.removeEventListener "touchend", @_next, false
		@_screen.hide().then =>
			@_domScreens.removeChild @_screen.dom
			@_nextLevel()

	hide: ->
		@_deactivate()
		TweenLite.to @_domGame, .2,
			css:
				alpha: 0

		done .2 * 1000, =>
			@_dispose()

	_deactivate: ->
		@_domMenuMenu.removeEventListener "touchend", @_onMenuMenu, false
		@_domMenuLevels.removeEventListener "touchend", @_onMenuLevels, false
		@_domControlUndo.removeEventListener "touchend", @_onUndo, false
		@_domControlReset.removeEventListener "touchend", @_onReset, false
		@_menuLevels.off "back", @_onMenuLevelsBack
		@_menuLevels.off "new", @_onSelectLevel

	_dispose: ->
		if @_level
			@_domGameContent.removeChild( @_level.dom ) 
			@_level.dispose()
		if @_screen
			@_domScreens.removeChild @_screen.dom
			@_screen = null

module.exports = Game