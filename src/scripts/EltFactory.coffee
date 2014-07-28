Goal = require "Goal"
Square = require "Square"

class EltFactory

	get: ( id ) ->
		idElt = id.substr 0, 1
		idType = id.substr 1, 1
		idDir = id.substr 2, 1

		switch idElt
			when "s" then return new Square idType, idDir
			when "g" then return new Goal idType

module.exports = new EltFactory()