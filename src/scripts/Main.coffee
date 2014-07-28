_.templateSettings =
    interpolate: /\{\{(.+?)\}\}/g

Level = require "Level"

domGame = document.getElementById "game"

idx = -1
level = null

start = ->
	nextLevel()

nextLevel = ->
	idx++
	level = new Level idx
	level.create()
	domGame.appendChild level.dom
	level.start()

start()