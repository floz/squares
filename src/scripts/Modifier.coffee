tpl = require "templates/modifier.jade"
Elt = require "Elt"

class Modifier extends Elt

	constructor: ( @dir ) ->
		@dom = domify tpl
		@domDesc = @dom.querySelector ".elt"
		super

		@setDirection @dir, false

module.exports = Modifier