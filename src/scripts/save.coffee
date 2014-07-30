class Save

	constructor: ->
		@_idLevel = "fzfs-squares_level"
		@_idCurrent = "fzfs-squares_level-current"
	
	setLevel: ( idx ) ->
		currentLevel = @getLevel()
		return if idx < currentLevel
		localStorage.setItem @_idLevel, parseInt idx

	getLevel: -> parseInt localStorage.getItem @_idLevel

	setCurrentLevel: ( idx ) ->
		localStorage.setItem @_idCurrent, parseInt idx
		@setLevel idx

	getCurrentLevel: -> parseInt localStorage.getItem @_idCurrent

module.exports = new Save()