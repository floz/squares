(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Level, Screen, domControls, domGame, domScreens, idx, level, next, nextLevel, nextScreen, screen, start;

_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};

Level = require("Level");

Screen = require("Screen");

domGame = document.getElementById("game");

domScreens = document.getElementById("screens");

level = null;

screen = null;

domControls = document.getElementById("controls");

domControls.addEventListener("touchend", function() {
  return level.reset();
}, false);

idx = -1;

start = function() {
  return nextLevel();
};

nextLevel = function() {
  idx++;
  level = new Level(idx);
  level.on("complete", nextScreen);
  level.create();
  domGame.appendChild(level.dom);
  return level.show().then(function() {
    return level.start();
  });
};

nextScreen = function() {
  return level.hide().then(function() {
    domGame.removeChild(level.dom);
    screen = new Screen(idx);
    domScreens.appendChild(screen.dom);
    return document.body.addEventListener("touchend", next, false);
  });
};

next = function() {
  document.body.removeEventListener("touchend", next, false);
  return screen.hide().then(function() {
    domScreens.removeChild(screen.dom);
    return nextLevel();
  });
};

start();



},{"Level":6,"Screen":8}],2:[function(require,module,exports){
module.exports.size = 50;



},{}],3:[function(require,module,exports){
var Elt, consts;

consts = require("Consts");

Elt = (function() {
  function Elt() {
    this.emitter = new Emitter();
    this.domDesc = this.dom.querySelector(".elt-desc");
    this.mov = {
      x: 0,
      y: 0
    };
  }

  Elt.prototype.setDirection = function(value, animate) {
    var data, r;
    if (animate == null) {
      animate = true;
    }
    r = 0;
    switch (value) {
      case "l":
        r = 180;
        this.mov.x = -1;
        this.mov.y = 0;
        break;
      case "r":
        r = 0;
        this.mov.x = 1;
        this.mov.y = 0;
        break;
      case "t":
        r = -90;
        this.mov.x = 0;
        this.mov.y = -1;
        break;
      case "b":
        r = 90;
        this.mov.x = 0;
        this.mov.y = 1;
    }
    data = {
      css: {
        rotation: r
      },
      ease: Back.easeOut
    };
    if (animate) {
      return TweenLite.to(this.domDesc, .25, data);
    } else {
      return TweenLite.set(this.domDesc, data);
    }
  };

  Elt.prototype.setPos = function(x, y) {
    this.x = x;
    this.y = y;
    this.xOrigin = this.x;
    this.yOrigin = this.y;
    return TweenLite.set(this.dom, {
      css: {
        x: this.x * consts.size,
        y: this.y * consts.size
      }
    });
  };

  Elt.prototype.show = function() {};

  Elt.prototype.on = function(id, cb) {
    return this.emitter.on(id, cb);
  };

  Elt.prototype.off = function(id, cb) {
    return this.emitter.off(id, cb);
  };

  return Elt;

})();

module.exports = Elt;



},{"Consts":2}],4:[function(require,module,exports){
var EltFactory, Goal, Modifier, Square;

Goal = require("Goal");

Square = require("Square");

Modifier = require("Modifier");

EltFactory = (function() {
  function EltFactory() {}

  EltFactory.prototype.get = function(id) {
    var data1, data2, idElt;
    idElt = id.substr(0, 1);
    data1 = id.substr(1, 1);
    data2 = id.substr(2, 1);
    switch (idElt) {
      case "s":
        return new Square(data1, data2);
      case "g":
        return new Goal(data1);
      case "m":
        return new Modifier(data1);
    }
  };

  return EltFactory;

})();

module.exports = new EltFactory();



},{"Goal":5,"Modifier":7,"Square":9}],5:[function(require,module,exports){
var Elt, Goal, tpl,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

tpl = require("templates/goal.jade");

Elt = require("Elt");

Goal = (function(_super) {
  __extends(Goal, _super);

  function Goal(type) {
    var tplCompiled;
    this.type = type;
    tplCompiled = _.template(tpl);
    this.dom = domify(tplCompiled({
      type: type
    }));
  }

  return Goal;

})(Elt);

module.exports = Goal;



},{"Elt":3,"templates/goal.jade":11}],6:[function(require,module,exports){
var Goal, Level, Modifier, Square, data, factory, tpl,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

tpl = require("templates/level.jade");

data = require("data.json");

factory = require("EltFactory");

Square = require("Square");

Goal = require("Goal");

Modifier = require("Modifier");

Level = (function(_super) {
  __extends(Level, _super);

  function Level(id) {
    this.id = id;
    this._onTouch = __bind(this._onTouch, this);
    this.dom = domify(tpl);
    this._elts = [];
    this._squares = [];
    this._goals = [];
    this._modifiers = [];
    this.canTouch = true;
  }

  Level.prototype.create = function() {
    var dataElt, dataLevel, elt, fragment, line, x, y, _i, _j, _len, _len1;
    dataLevel = data.levels[this.id];
    fragment = document.createDocumentFragment();
    y = 0;
    for (_i = 0, _len = dataLevel.length; _i < _len; _i++) {
      line = dataLevel[_i];
      x = 0;
      for (_j = 0, _len1 = line.length; _j < _len1; _j++) {
        dataElt = line[_j];
        if (dataElt) {
          elt = factory.get(dataElt);
          elt.setPos(x, y);
          if (elt instanceof Square) {
            this._squares.push(elt);
          }
          if (elt instanceof Goal) {
            this._goals.push(elt);
          }
          if (elt instanceof Modifier) {
            this._modifiers.push(elt);
          }
          fragment.appendChild(elt.dom);
          this._elts.push(elt);
        }
        x++;
      }
      y++;
    }
    return this.dom.appendChild(fragment);
  };

  Level.prototype.show = function() {
    var elt, speed, _i, _len, _ref;
    speed = .4;
    _ref = this._elts;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      elt = _ref[_i];
      TweenLite.set(elt.dom, {
        css: {
          scale: 0,
          alpha: 0
        }
      });
      TweenLite.to(elt.dom, speed, {
        css: {
          alpha: 1,
          scale: 1
        },
        ease: Back.easeOut
      });
    }
    return done(speed * 1000);
  };

  Level.prototype.start = function() {
    var square, _i, _len, _ref, _results;
    this._onTouchBind = _.bind(this._onTouch);
    _ref = this._squares;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      square = _ref[_i];
      square.activate();
      _results.push(square.on("touch", this._onTouch));
    }
    return _results;
  };

  Level.prototype._onTouch = function(square) {
    if (this.canTouch) {
      this.canTouch = false;
      square.move().then((function(_this) {
        return function() {
          _this._updateModifiers();
          if (_this._isComplete()) {
            _this._end();
          }
          return _this.canTouch = true;
        };
      })(this));
      return this._updateOtherSquares(square, square.mov);
    }
  };

  Level.prototype._updateModifiers = function() {
    var modifier, square, _i, _len, _ref, _results;
    _ref = this._squares;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      square = _ref[_i];
      _results.push((function() {
        var _j, _len1, _ref1, _results1;
        _ref1 = this._modifiers;
        _results1 = [];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          modifier = _ref1[_j];
          if (square.x === modifier.x && square.y === modifier.y) {
            _results1.push(square.setDirection(modifier.dir));
          } else {
            _results1.push(void 0);
          }
        }
        return _results1;
      }).call(this));
    }
    return _results;
  };

  Level.prototype._updateOtherSquares = function(square, mov) {
    var otherSquare, _i, _len, _ref, _results;
    _ref = this._squares;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      otherSquare = _ref[_i];
      if (otherSquare === square) {
        continue;
      }
      if (otherSquare.x === square.x && otherSquare.y === square.y) {
        otherSquare.move(mov.x, mov.y);
        _results.push(this._updateOtherSquares(otherSquare, mov));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Level.prototype._isComplete = function() {
    var countValid, goal, square, _i, _j, _len, _len1, _ref, _ref1;
    countValid = 0;
    _ref = this._squares;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      square = _ref[_i];
      _ref1 = this._goals;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        goal = _ref1[_j];
        if (goal.type === square.type) {
          if (goal.x === square.x && square.y === goal.y) {
            countValid += 1;
          }
        }
      }
    }
    return countValid === this._squares.length;
  };

  Level.prototype.reset = function() {
    var square, _i, _len, _ref, _results;
    _ref = this._squares;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      square = _ref[_i];
      _results.push(square.setPos(square.xOrigin, square.yOrigin));
    }
    return _results;
  };

  Level.prototype._end = function() {
    return this.emit("complete");
  };

  Level.prototype.hide = function() {
    var elt, speed, _i, _len, _ref;
    speed = .25;
    _ref = this._elts;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      elt = _ref[_i];
      TweenLite.to(elt.dom, speed, {
        css: {
          alpha: 0,
          scale: 0
        },
        ease: Back.easeIn
      });
    }
    return done(speed * 1000);
  };

  return Level;

})(Emitter);

module.exports = Level;



},{"EltFactory":4,"Goal":5,"Modifier":7,"Square":9,"data.json":10,"templates/level.jade":12}],7:[function(require,module,exports){
var Elt, Modifier, tpl,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

tpl = require("templates/modifier.jade");

Elt = require("Elt");

Modifier = (function(_super) {
  __extends(Modifier, _super);

  function Modifier(dir) {
    this.dir = dir;
    this.dom = domify(tpl);
    this.domDesc = this.dom.querySelector(".elt");
    Modifier.__super__.constructor.apply(this, arguments);
    this.setDirection(this.dir, false);
  }

  return Modifier;

})(Elt);

module.exports = Modifier;



},{"Elt":3,"templates/modifier.jade":13}],8:[function(require,module,exports){
var Screen, data, tpl;

tpl = require("templates/screen.jade");

data = require("data.json");

Screen = (function() {
  function Screen(idx) {
    var tplCompiled;
    tplCompiled = _.template(tpl);
    this.dom = domify(tplCompiled({
      text: data.screens[idx]
    }));
  }

  Screen.prototype.show = function() {
    return TweenLite.to(this.dom, .4, {
      css: {
        alpha: 1
      }
    });
  };

  Screen.prototype.hide = function() {
    var speed;
    speed = .4;
    TweenLite.to(this.dom, speed, {
      css: {
        alpha: 0
      }
    });
    return done(speed * 1000);
  };

  return Screen;

})();

module.exports = Screen;



},{"data.json":10,"templates/screen.jade":14}],9:[function(require,module,exports){
var Elt, Square, consts, tpl,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

tpl = require("templates/square.jade");

consts = require("Consts");

Elt = require("Elt");

Square = (function(_super) {
  __extends(Square, _super);

  function Square(type, dir) {
    var tplCompiled;
    this.type = type;
    this._onTouch = __bind(this._onTouch, this);
    tplCompiled = _.template(tpl);
    this.dom = domify(tplCompiled({
      type: type
    }));
    Square.__super__.constructor.apply(this, arguments);
    this.setDirection(dir, false);
  }

  Square.prototype.activate = function(cb) {
    return this.dom.addEventListener("touchend", this._onTouch, false);
  };

  Square.prototype._onTouch = function() {
    return this.emitter.emit("touch", this);
  };

  Square.prototype.move = function(x, y) {
    var speed;
    if (x == null) {
      x = 0;
    }
    if (y == null) {
      y = 0;
    }
    if (x !== 0 || y !== 0) {
      console.log(x, y);
      this.x += x;
      this.y += y;
    } else {
      this.x += this.mov.x;
      this.y += this.mov.y;
    }
    speed = .4;
    TweenLite.to(this.dom, speed, {
      css: {
        x: this.x * consts.size,
        y: this.y * consts.size
      },
      ease: Expo.easeOut
    });
    return done((speed - .1) * 1000);
  };

  return Square;

})(Elt);

module.exports = Square;



},{"Consts":2,"Elt":3,"templates/square.jade":15}],10:[function(require,module,exports){
module.exports={
	"levels": [
		[ [ 0, 0, 0, 0, 0 ],
		  [ 0, 0, "sab", 0, 0 ],
		  [ 0, 0, 0, 0, 0 ],
		  [ 0, 0, "ga", 0, 0 ],
		  [ 0, 0, 0, 0, 0 ]
		  [ 0, 0, 0, 0, 0 ],
		],
		[ [ 0, 0, 0, 0, 0 ],
		  [ 0, 0, "sab", 0, 0 ],
		  [ 0, 0, "ga", 0, 0 ],
		  [ 0, 0, "gb", 0, 0 ],
		  [ 0, 0, "sbt", 0, 0 ],
		  [ 0, 0, 0, 0, 0 ]
		],
		[ [ 0, 0, 0, 0, 0 ],
		  [ 0, "sar", "gb", "ga", 0 ],
		  [ 0, 0, "gc", 0, "scl" ],
		  [ 0, 0, "sbt", 0, 0 ],
		  [ 0, 0, 0, 0, 0 ],
		  [ 0, 0, 0, 0, 0 ]
		],	
		[ [ 0, 0, "sab", 0, 0 ],
		  [ 0, 0, 0, 0, 0 ],
		  [ 0, 0, 0, 0, "sbl" ],
		  [ 0, "gb", 0, 0, 0 ],
		  [ 0, 0, 0, 0, 0 ],
		  [ 0, 0, "ga", 0, 0 ]
		],	
		[ [ 0, "sbb", 0, 0, 0 ],
		  [ "sar", "gb", "scb", 0, 0 ],
		  [ 0, 0, "gc", 0, 0 ],
		  [ 0, 0, 0, "ga", 0 ],
		  [ 0, 0, 0, 0, 0 ],
		  [ 0, 0, 0, 0, 0 ]
		],	
		[ [ "ga", 0, 0, "scb", 0 ],
		  [ 0, "gb", 0, 0, "sbl" ],
		  [ 0, 0, "sat", 0, 0 ],
		  [ 0, 0, "gc", 0, 0 ],
		  [ 0, 0, 0, 0, 0 ],
		  [ 0, 0, 0, 0, 0 ]
		],
		[ [ 0, 0, 0, 0, 0 ],
		  [ 0, 0, 0, 0, 0 ],
		  [ 0, "sab", 0, "ga", 0 ],
		  [ 0, 0, 0, 0, 0 ],
		  [ 0, "mr", 0, "mt", 0 ],
		  [ 0, 0, 0, 0, 0 ]
		]
	],
	"screens": [
		"Touch me!",
		"This is a game about Squares.",
		"Nothing less, nothing more.",
		"Have fun.",
		"Phrase de merde",
		"Phrase de merde2",
		"Phrase de merde3"
	]
}
},{}],11:[function(require,module,exports){
module.exports = "<div class=\"elt goal goal--{{type}}\"><div class=\"elt-desc elt-desc--circle\"></div></div>" ;

},{}],12:[function(require,module,exports){
module.exports = "<div class=\"level\"></div>" ;

},{}],13:[function(require,module,exports){
module.exports = "<div class=\"elt modifier\"><div class=\"elt-desc elt-desc--arrow\"></div></div>" ;

},{}],14:[function(require,module,exports){
module.exports = "<div class=\"screen\">{{ text }}</div>" ;

},{}],15:[function(require,module,exports){
module.exports = "<div class=\"elt square square--{{type}}\"><div class=\"elt-desc elt-desc--arrow\"></div></div>" ;

},{}]},{},[1])