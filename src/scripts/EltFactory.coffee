Goal = require "Goal"
Square = require "Square"
Modifier = require "Modifier"

class EltFactory

	get: ( id ) ->
		idElt = id.substr 0, 1
		data1 = id.substr 1, 1
		data2 = id.substr 2, 1

		switch idElt
			when "s" then return new Square data1, data2
			when "g" then return new Goal data1
			when "m" then return new Modifier data1

module.exports = new EltFactory()