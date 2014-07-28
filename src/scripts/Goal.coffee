tpl = require "templates/goal.jade"
Elt = require "Elt"

class Goal extends Elt

	constructor: ( type ) ->
		tplCompiled = _.template tpl
		@dom = domify tplCompiled { type: type }

module.exports = Goal