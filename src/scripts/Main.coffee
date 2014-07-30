_.templateSettings =
    interpolate: /\{\{(.+?)\}\}/g

##

Game = require "Game"
Menu = require "Menu"

##

save = require "save"
console.log save.getLevel()

game = new Game()
game.on "menu", ->
	game.hide().then ->
		document.body.removeChild game.dom
		
		document.body.appendChild menu.dom
		menu.activate()
		menu.show()

menu = new Menu()
document.body.appendChild menu.dom
menu.activate()
menu.on "play", ->
	menu.hide().then ->
		document.body.removeChild menu.dom
		menu.deactivate()

		startGame()

startGame = ->
	document.body.appendChild game.dom
	game.start()

