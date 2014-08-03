Goal = require "Goal"
Square = require "Square"
Modifier = require "Modifier"

class EltFactory

	get: ( id ) ->
		elts = []

		ids = id.split "-"
		for id in ids
			idElt = id.substr 0, 1
			data1 = id.substr 1, 1
			data2 = id.substr 2, 1

			switch idElt
				when "s" then elts.push new Square data1, data2
				when "g" then elts.push new Goal data1
				when "m" then elts.push new Modifier data1

		elts

module.exports = new EltFactory()