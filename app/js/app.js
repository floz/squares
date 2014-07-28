(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Level, domGame, idx, level, nextLevel, start;

_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};

Level = require("Level");

domGame = document.getElementById("game");

idx = -1;

level = null;

start = function() {
  return nextLevel();
};

nextLevel = function() {
  idx++;
  level = new Level(idx);
  level.create();
  domGame.appendChild(level.dom);
  return level.start();
};

start();



},{"Level":6}],2:[function(require,module,exports){
module.exports.size = 50;



},{}],3:[function(require,module,exports){
var Elt, consts;

consts = require("Consts");

Elt = (function() {
  function Elt() {
    this.emitter = new Emitter();
  }

  Elt.prototype.setPos = function(x, y) {
    this.x = x;
    this.y = y;
    console.log("hey", this.x, this.y);
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
var EltFactory, Goal, Square;

Goal = require("Goal");

Square = require("Square");

EltFactory = (function() {
  function EltFactory() {}

  EltFactory.prototype.get = function(id) {
    var idDir, idElt, idType;
    idElt = id.substr(0, 1);
    idType = id.substr(1, 1);
    idDir = id.substr(2, 1);
    switch (idElt) {
      case "s":
        return new Square(idType, idDir);
      case "g":
        return new Goal(idType);
    }
  };

  return EltFactory;

})();

module.exports = new EltFactory();



},{"Goal":5,"Square":7}],5:[function(require,module,exports){
var Elt, Goal, tpl,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

tpl = require("templates/goal.jade");

Elt = require("Elt");

Goal = (function(_super) {
  __extends(Goal, _super);

  function Goal(type) {
    var tplCompiled;
    tplCompiled = _.template(tpl);
    this.dom = domify(tplCompiled({
      type: type
    }));
  }

  return Goal;

})(Elt);

module.exports = Goal;



},{"Elt":3,"templates/goal.jade":9}],6:[function(require,module,exports){
var Goal, Level, Square, data, factory, tpl,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

tpl = require("templates/level.jade");

data = require("data.json");

factory = require("EltFactory");

Square = require("Square");

Goal = require("Goal");

Level = (function() {
  function Level(id) {
    this.id = id;
    this._onTouch = __bind(this._onTouch, this);
    this.dom = domify(tpl);
    this._elts = [];
    this._squares = [];
    this._goals = [];
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
          fragment.appendChild(elt.dom);
          this._elts.push(elt);
        }
        x++;
      }
      y++;
    }
    return this.dom.appendChild(fragment);
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
      return square.move().then((function(_this) {
        return function() {
          return _this.canTouch = true;
        };
      })(this));
    }
  };

  Level.prototype.isComplete = function() {
    var square, _i, _len, _ref, _results;
    _ref = this._squares;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      square = _ref[_i];
      _results.push(console.log(square));
    }
    return _results;
  };

  return Level;

})();

module.exports = Level;



},{"EltFactory":4,"Goal":5,"Square":7,"data.json":8,"templates/level.jade":10}],7:[function(require,module,exports){
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
    this._onTouch = __bind(this._onTouch, this);
    var tplCompiled;
    Square.__super__.constructor.apply(this, arguments);
    tplCompiled = _.template(tpl);
    this.dom = domify(tplCompiled({
      type: type
    }));
    this.domDesc = this.dom.querySelector(".elt-desc");
    this.mov = {
      x: 0,
      y: 0
    };
    this.setDirection(dir, false);
  }

  Square.prototype.setDirection = function(value, animate) {
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
      return TweenLite.to(this.domDesc, .4, data);
    } else {
      return TweenLite.set(this.domDesc, data);
    }
  };

  Square.prototype.activate = function(cb) {
    return this.dom.addEventListener("touchend", this._onTouch, false);
  };

  Square.prototype._onTouch = function() {
    return this.emitter.emit("touch", this);
  };

  Square.prototype.move = function() {
    var speed;
    console.log(this.x, this.y);
    this.x += this.mov.x;
    this.y += this.mov.y;
    speed = .4;
    TweenLite.to(this.dom, speed, {
      css: {
        x: this.x * consts.size,
        y: this.y * consts.size
      },
      ease: Expo.easeOut
    });
    return done(.4 * 1000);
  };

  return Square;

})(Elt);

module.exports = Square;



},{"Consts":2,"Elt":3,"templates/square.jade":11}],8:[function(require,module,exports){
module.exports={
	"levels": [
		[ [ 0, 0, 0, 0, 0 ],
		  [ 0, 0, "sab", 0, 0 ],
		  [ 0, 0, 0, 0, 0 ],
		  [ 0, 0, "ga", 0, 0 ],
		  [ 0, 0, 0, 0, 0 ]
		],
		[ [ 0, 0, 0, 0, 0 ],
		  [ 0, 0, 0, 0, 0 ],
		  [ 0, 0, 0, 0, 0 ],
		  [ 0, 0, 0, 0, 0 ],
		  [ 0, 0, 0, 0, 0 ]
		]		
	] 
}
},{}],9:[function(require,module,exports){
module.exports = "<div class=\"elt goal goal--{{type}}\"><div class=\"elt-desc elt-desc--circle\"></div></div>" ;

},{}],10:[function(require,module,exports){
module.exports = "<div class=\"level\"></div>" ;

},{}],11:[function(require,module,exports){
module.exports = "<div class=\"elt square square--{{type}}\"><div class=\"elt-desc elt-desc--arrow\"></div></div>" ;

},{}]},{},[1])