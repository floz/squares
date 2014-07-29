_.templateSettings =
    interpolate: /\{\{(.+?)\}\}/g

##

Level = require "Level"
Screen = require "Screen"

##

domGame = document.getElementById "game"
domScreens = document.getElementById "screens"

level = null
screen = null

idx = -1

start = ->
	nextLevel()

nextLevel = ->
	idx++
	level = new Level idx
	level.on "complete", nextScreen
	level.create()
	domGame.appendChild level.dom
	level.show().then ->
		level.start()

nextScreen = ->
	level.hide().then ->
		domGame.removeChild level.dom

		screen = new Screen idx
		domScreens.appendChild screen.dom
		document.body.addEventListener "touchend", next, false

next = ->
	document.body.removeEventListener "touchend", next, false
	screen.hide().then ->
		domScreens.removeChild screen.dom
		nextLevel()


start()