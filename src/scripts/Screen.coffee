tpl = require "templates/screen.jade"
data = require "data.json"

class Screen

	constructor: ( idx ) -> 
		tplCompiled = _.template tpl
		if idx < data.screens.length
			text = data.screens[ idx ]
		else
			if idx == 9999
				text = data.end
			else
				text = "Level #{idx}"
		@dom = domify tplCompiled { text: text }

	show: ->
		TweenLite.set @dom,
			css:
				alpha: 0
		TweenLite.to @dom, .4,
			css:
				alpha: 1

	hide: ->
		speed = .4
		TweenLite.to @dom, speed,
			css:
				alpha: 0

		done ( speed - .1 )* 1000

module.exports = Screen