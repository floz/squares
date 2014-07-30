class Save

	constructor: ->
		@_idLevel = "fzfs-squares_level"
	
	setLevel: ( idx ) ->
		console.log "setLevel", idx
		currentLevel = @getLevel()
		return if idx < currentLevel
		localStorage.setItem @_idLevel, idx

	getLevel: ->
		localStorage.getItem @_idLevel



module.exports = new Save()