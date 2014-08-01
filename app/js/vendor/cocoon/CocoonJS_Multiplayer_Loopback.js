(function()
{
    // The CocoonJS must exist before creating the extension.
    if (!window.CocoonJS) throw("The CocoonJS object must exist and be valid before creating any extension object.");
    if (!window.CocoonJS.Multiplayer) throw("The CocoonJS.Multiplayer object must exist and be valid before creating a Multiplayer Loopback extension object.");


    var loopbackServices = [];
    var indexCounter = 0;
    var matchServices = [];
    var matchCounter = 0;

    /**
     * This service provides a loopback implementation of the {@link CocoonJS.Multiplayer.MultiplayerService}
     * @constructor
     */
    CocoonJS.Multiplayer.LoopbackService = function() {

        CocoonJS.Multiplayer.LoopbackService.superclass.constructor.call(this, "dummy","dummy");
        loopbackServices.push(this);
        this.playerID = "" + indexCounter;
        indexCounter++;

    }

    CocoonJS.Multiplayer.LoopbackService.prototype =  {

        findMatch : function(request, callback)  {

            this.findMatchCallback = callback;

            //checks if the service is already added to the match list
            var exists = false;
            for (var i = 0; i< matchServices.length; ++i) {
                if (matchServices[i] === this) {
                    exists = true; break;
                }
            }
            if (!exists)
                matchServices.push(this);

            //Create the match is all required players are ready
            //TODO: check more conditions (playerGroup, playerAttributes) to complete a match
            if (matchServices.length >= request.minPlayers) {
                var playerIDs = [];
                //create playerIDs array
                for (var i = 0; i< matchServices.length; ++i) {
                    playerIDs.push(matchServices[i].getPlayerID());
                }

                //notify the found match to each manager
                for (var i = 0; i< matchServices.length; ++i) {
                    var match = new LoopbackMatch(matchServices[i]);
                    match.playerIDs = playerIDs.slice();
                    matchServices[i].currentMatch = match;
                    matchServices[i].findMatchCallback(match, null);
                }
                //clear pending list
                matchServices = [];
            }


        },
        findAutoMatch : function(matchRequest, callback) {
            this.findMatch(matchRequest,callback);
        },
        cancelAutoMatch : function() {

        },

        addPlayersToMatch : function(matchRequest, match, callback) {
            callback({message:"Not implemmented"});
        },
        getPlayerID : function() {
            return this.playerID;
        },

        getMatch : function() {
            return this.currentMatch;
        }
    }

    CocoonJS.extend(CocoonJS.Multiplayer.LoopbackService, CocoonJS.Multiplayer.MultiplayerService);

    var LoopbackMatch = function(service) {
        matchCounter++;
        LoopbackMatch.superclass.constructor.call(this, "","",matchCounter);
        this.started = false;
        this.disconnected = false;
        this.pendingData = [];
        this.service = service;
    }

    LoopbackMatch.prototype = {

        start : function() {
            var me = this;
            setTimeout(function() {
                me.started = true;
                for (var i = 0; i < me.pendingData.length; ++i) {
                    me.onMatchDataReceived.notifyEventListeners(me.matchID,me.pendingData[i].data, me.pendingData[i].player);
                }

            },0);

        },
        sendDataToAllPlayers : function(data, sendMode) {
            this.sendData(data, this.playerIDs, sendMode);
        },

        sendData : function(data, playerIDs,  sendMode) {
            var me = this;
            setTimeout(function() {
                for (var i = 0; i< loopbackServices.length; ++i) {
                    var destService = null;
                    for (var j = 0; j < playerIDs.length; ++j) {
                        if (playerIDs[j] === loopbackServices[i].getPlayerID()) {
                            destService = loopbackServices[i];
                        }
                    }
                    if (destService) {
                        destService.getMatch().notifyDataReceived(data,me.service.getPlayerID());
                    }
                }
            },0);
        },

        disconnect : function() {
            this.disconnected = true;
            for (var i = 0; i < this.playerIDs.length; ++i) {
                var p = this.playerIDs[i];
                for (var j = 0; j < loopbackServices.length; ++j) {
                    if (loopbackServices[j].getPlayerID() === p) {
                        var match = loopbackServices[i].getMatch();
                        if (!match.disconnected) {
                            match.onMatchStateChanged.notifyEventListeners(match, this.service.getPlayerID(), CocoonJS.Multiplayer.ConnectionState.DISCONNECTED);
                        }
                    }
                }
            }
        },

        requestPlayersInfo : function(callback) {
            var me = this;
            setTimeout(function() {
               var playersInfo = [];
                for (var i = 0; i < me.playerIDs.length; ++i) {
                    playersInfo[i] = {userID: me.playerIDs[i], userName: "Player" + me.playerIDs[i]};
                };
                callback(playersInfo);
            },1);
        },

        getExpectedPlayerCount : function() {
            return 0;
        },
        getPlayerIDs : function() {
            return this.playerIDs;
        },
        getLocalPlayerID: function() {
            return this.service.playerID;
        },
        notifyDataReceived: function(data, fromPlayer) {
            if (!this.started) {
                this.pendingData.push({data:data, player:fromPlayer});
            }
            else {
                this.onMatchDataReceived.notifyEventListeners(this.matchID,data,fromPlayer);
            }
        }

    };

    CocoonJS.extend(LoopbackMatch, CocoonJS.Multiplayer.Match);

})();