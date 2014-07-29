tpl = require "templates/screen.jade"
data = require "data.json"

class Screen

	constructor: ( idx ) ->
		tplCompiled = _.template tpl
		@dom = domify tplCompiled { text: data.screens[ idx ] }

	show: ->
		TweenLite.to @dom, .4,
			css:
				alpha: 1

	hide: ->
		speed = .4
		TweenLite.to @dom, speed,
			css:
				alpha: 0

		done speed * 1000

module.exports = Screen