(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Game, Menu, game, menu, save, startGame;

_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};

Game = require("Game");

Menu = require("Menu");

save = require("save");

console.log(save.getLevel());

game = new Game();

game.on("menu", function() {
  return game.hide().then(function() {
    document.body.removeChild(game.dom);
    document.body.appendChild(menu.dom);
    menu.activate();
    return menu.show();
  });
});

menu = new Menu();

document.body.appendChild(menu.dom);

menu.activate();

menu.on("play", function() {
  return menu.hide().then(function() {
    document.body.removeChild(menu.dom);
    menu.deactivate();
    return startGame();
  });
});

startGame = function() {
  document.body.appendChild(game.dom);
  return game.start();
};



},{"Game":5,"Menu":8,"save":14}],2:[function(require,module,exports){
module.exports.size = 64;



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
        rotation: r + 180
      },
      ease: Back.easeOut
    };
    if (animate) {
      return TweenLite.to(this.dom, .25, data);
    } else {
      return TweenLite.set(this.dom, data);
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



},{"Goal":6,"Modifier":10,"Square":12}],5:[function(require,module,exports){
var Game, Level, MenuLevels, Screen, data, save, tpl,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

tpl = require("templates/game.jade");

Level = require("Level");

Screen = require("Screen");

MenuLevels = require("MenuLevels");

save = require("save");

data = require("data.json");

Game = (function(_super) {
  __extends(Game, _super);

  function Game() {
    this._next = __bind(this._next, this);
    this._nextScreen = __bind(this._nextScreen, this);
    this._nextEnd = __bind(this._nextEnd, this);
    this._onReset = __bind(this._onReset, this);
    this._onUndo = __bind(this._onUndo, this);
    this._onSelectLevel = __bind(this._onSelectLevel, this);
    this._onMenuLevelsBack = __bind(this._onMenuLevelsBack, this);
    this._onMenuLevels = __bind(this._onMenuLevels, this);
    this._onMenuMenu = __bind(this._onMenuMenu, this);
    var domControls, domMenu;
    this.dom = domify(tpl);
    console.log(this.dom);
    this._domGame = this.dom.querySelector("#game");
    this._domScreens = this.dom.querySelector("#screens");
    this._domGameContent = this.dom.querySelector(".game-content");
    domMenu = this.dom.querySelector(".game-menu");
    this._domMenuMenu = domMenu.querySelector(".game-menu-item--menu");
    this._domMenuLevels = domMenu.querySelector(".game-menu-item--levels");
    domControls = this.dom.querySelector(".game-controls");
    this._domControlUndo = domControls.querySelector(".game-control--undo");
    this._domControlReset = domControls.querySelector(".game-control--reset");
    this._menuLevels = new MenuLevels();
    this._started = false;
    this._ended = false;
    this._idx = parseInt(save.getCurrentLevel());
    if (!this._idx && this._idx !== 0) {
      this._idx = -1;
    }
  }

  Game.prototype.start = function() {
    if (this._started) {
      this._idx -= 1;
    }
    this._activate();
    this._newScreen();
    return this._started = true;
  };

  Game.prototype._activate = function() {
    this._domMenuMenu.addEventListener("touchend", this._onMenuMenu, false);
    this._domMenuLevels.addEventListener("touchend", this._onMenuLevels, false);
    this._domControlUndo.addEventListener("touchend", this._onUndo, false);
    this._domControlReset.addEventListener("touchend", this._onReset, false);
    this._menuLevels.on("back", this._onMenuLevelsBack);
    return this._menuLevels.on("new", this._onSelectLevel);
  };

  Game.prototype._onMenuMenu = function() {
    return this.emit("menu");
  };

  Game.prototype._onMenuLevels = function() {
    this._domGame.appendChild(this._menuLevels.dom);
    this._menuLevels.activate();
    return this._menuLevels.show(this._idx);
  };

  Game.prototype._onMenuLevelsBack = function() {
    if (this._ended) {
      this._onMenuMenu();
      return;
    }
    this._menuLevels.deactivate();
    return this._menuLevels.hide().then((function(_this) {
      return function() {
        return _this._domGame.removeChild(_this._menuLevels.dom);
      };
    })(this));
  };

  Game.prototype._onSelectLevel = function(idx) {
    this._menuLevels.deactivate();
    return this._menuLevels.hide().then((function(_this) {
      return function() {
        _this._domGame.removeChild(_this._menuLevels.dom);
        save.setCurrentLevel(idx);
        _this._idx = idx;
        return _this._nextScreen();
      };
    })(this));
  };

  Game.prototype._onUndo = function() {
    return this._level.undo();
  };

  Game.prototype._onReset = function() {
    return this._level.reset();
  };

  Game.prototype._nextLevel = function() {
    this._idx++;
    this._level = new Level(this._idx);
    this._level.on("complete", this._nextScreen);
    this._level.create();
    this._domGameContent.appendChild(this._level.dom);
    this._level.show().then((function(_this) {
      return function() {
        return _this._level.start();
      };
    })(this));
    return TweenLite.to(this._domGame, .2, {
      css: {
        alpha: 1
      }
    });
  };

  Game.prototype._onEnd = function() {
    this._ended = true;
    this._screen = new Screen(9999);
    this._domScreens.appendChild(this._screen.dom);
    document.body.addEventListener("touchend", this._nextEnd, false);
    return this._screen.show();
  };

  Game.prototype._nextEnd = function() {
    document.body.removeEventListener("touchend", this._nextEnd, false);
    this._started = false;
    this._idx = -1;
    save.setCurrentLevel(this._idx);
    return this._onMenuMenu();
  };

  Game.prototype._nextScreen = function() {
    return this._level.hide().then((function(_this) {
      return function() {
        _this._domGameContent.removeChild(_this._level.dom);
        _this._level.dispose();
        _this._level = null;
        return _this._newScreen();
      };
    })(this));
  };

  Game.prototype._newScreen = function() {
    var idx;
    idx = this._idx + 1;
    if (idx >= data.levels.length) {
      this._onEnd();
      return;
    }
    this._screen = new Screen(idx);
    this._domScreens.appendChild(this._screen.dom);
    document.body.addEventListener("touchend", this._next, false);
    return this._screen.show();
  };

  Game.prototype._next = function() {
    document.body.removeEventListener("touchend", this._next, false);
    return this._screen.hide().then((function(_this) {
      return function() {
        _this._domScreens.removeChild(_this._screen.dom);
        return _this._nextLevel();
      };
    })(this));
  };

  Game.prototype.hide = function() {
    this._deactivate();
    TweenLite.to(this._domGame, .2, {
      css: {
        alpha: 0
      }
    });
    return done(.2 * 1000, (function(_this) {
      return function() {
        return _this._dispose();
      };
    })(this));
  };

  Game.prototype._deactivate = function() {
    this._domMenuMenu.removeEventListener("touchend", this._onMenuMenu, false);
    this._domMenuLevels.removeEventListener("touchend", this._onMenuLevels, false);
    this._domControlUndo.removeEventListener("touchend", this._onUndo, false);
    this._domControlReset.removeEventListener("touchend", this._onReset, false);
    this._menuLevels.off("back", this._onMenuLevelsBack);
    return this._menuLevels.off("new", this._onSelectLevel);
  };

  Game.prototype._dispose = function() {
    if (this._level) {
      this._domGameContent.removeChild(this._level.dom);
      this._level.dispose();
    }
    if (this._screen) {
      this._domScreens.removeChild(this._screen.dom);
      return this._screen = null;
    }
  };

  return Game;

})(Emitter);

module.exports = Game;



},{"Level":7,"MenuLevels":9,"Screen":11,"data.json":13,"save":14,"templates/game.jade":15}],6:[function(require,module,exports){
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



},{"Elt":3,"templates/goal.jade":16}],7:[function(require,module,exports){
var Goal, Level, Modifier, Square, data, factory, save, tpl,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

tpl = require("templates/level.jade");

data = require("data.json");

factory = require("EltFactory");

save = require("save");

Square = require("Square");

Goal = require("Goal");

Modifier = require("Modifier");

Level = (function(_super) {
  __extends(Level, _super);

  function Level(idx) {
    this.idx = idx;
    this._onTouch = __bind(this._onTouch, this);
    this.dom = domify(tpl);
    this._elts = [];
    this._squares = [];
    this._goals = [];
    this._modifiers = [];
    this._history = [];
    this.canTouch = true;
  }

  Level.prototype.create = function() {
    var dataElt, dataLevel, elt, fragment, line, x, y, _i, _j, _len, _len1;
    dataLevel = data.levels[this.idx];
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
    TweenLite.to(this.dom, .2, {
      css: {
        alpha: 1
      }
    });
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
    var history;
    if (this.canTouch) {
      this.canTouch = false;
      history = [];
      history.push({
        target: square,
        x: square.x,
        y: square.y,
        dir: square.dir
      });
      square.move().then((function(_this) {
        return function() {
          _this._updateModifiers();
          if (_this._isComplete()) {
            _this._end();
          }
          return _this.canTouch = true;
        };
      })(this));
      this._history.push(history);
      return this._updateOtherSquares(square, square.mov, history);
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

  Level.prototype._updateOtherSquares = function(square, mov, history) {
    var otherSquare, _i, _len, _ref, _results;
    _ref = this._squares;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      otherSquare = _ref[_i];
      if (otherSquare === square) {
        continue;
      }
      if (otherSquare.x === square.x && otherSquare.y === square.y) {
        history.push({
          target: otherSquare,
          x: otherSquare.x,
          y: otherSquare.y,
          dir: otherSquare.dir
        });
        otherSquare.move(mov.x, mov.y);
        _results.push(this._updateOtherSquares(otherSquare, mov, history));
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

  Level.prototype.undo = function() {
    var go, prevAction, prevActions, _i, _len;
    if (!this.canTouch) {
      return;
    }
    prevActions = this._history.pop();
    if (!prevActions) {
      return;
    }
    this.canTouch = false;
    for (_i = 0, _len = prevActions.length; _i < _len; _i++) {
      prevAction = prevActions[_i];
      go = prevAction.target.go(prevAction.x, prevAction.y);
      prevAction.target.setDirection(prevAction.dir);
    }
    return go.then((function(_this) {
      return function() {
        return _this.canTouch = true;
      };
    })(this));
  };

  Level.prototype.reset = function() {
    var square, _i, _len, _ref, _results;
    _ref = this._squares;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      square = _ref[_i];
      square.setPos(square.xOrigin, square.yOrigin);
      _results.push(square.setDirection(square.dir, false));
    }
    return _results;
  };

  Level.prototype._end = function() {
    save.setCurrentLevel(this.idx);
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

  Level.prototype.dispose = function() {
    var square, _i, _len, _ref, _results;
    _ref = this._squares;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      square = _ref[_i];
      square.deactivate();
      _results.push(square.off("touch", this._onTouch));
    }
    return _results;
  };

  return Level;

})(Emitter);

module.exports = Level;



},{"EltFactory":4,"Goal":6,"Modifier":10,"Square":12,"data.json":13,"save":14,"templates/level.jade":17}],8:[function(require,module,exports){
var Menu, tpl,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

tpl = require("templates/menu.jade");

Menu = (function(_super) {
  __extends(Menu, _super);

  function Menu() {
    this._onBtPlay = __bind(this._onBtPlay, this);
    this.dom = domify(tpl);
    this.domBtPlay = this.dom.querySelector(".menu-action--play");
    this.domBtChallenge = this.dom.querySelector(".menu-action--challenge");
  }

  Menu.prototype.activate = function() {
    return this.domBtPlay.addEventListener("touchend", this._onBtPlay, false);
  };

  Menu.prototype._onBtPlay = function() {
    return this.emit("play");
  };

  Menu.prototype.show = function() {
    TweenLite.to(this.dom, .4, {
      css: {
        alpha: 1
      }
    });
    return done(.4 * 1000);
  };

  Menu.prototype.hide = function() {
    TweenLite.to(this.dom, .4, {
      css: {
        alpha: 0
      }
    });
    return done(.3 * 1000);
  };

  Menu.prototype.deactivate = function() {
    return this.domBtPlay.removeEventListener("touchend", this._onBtPlay, false);
  };

  return Menu;

})(Emitter);

module.exports = Menu;



},{"templates/menu.jade":19}],9:[function(require,module,exports){
var MenuLevels, save, tpl,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

tpl = require("templates/menu-levels.jade");

save = require("save");

MenuLevels = (function(_super) {
  __extends(MenuLevels, _super);

  function MenuLevels() {
    this._onBtLevel = __bind(this._onBtLevel, this);
    this._onBtBack = __bind(this._onBtBack, this);
    this.dom = domify(tpl);
    this._domLevels = this.dom.querySelectorAll(".levels-entry");
    this._domBtBack = this.dom.querySelector(".bt-back");
  }

  MenuLevels.prototype.activate = function() {
    var domLevel, _i, _len, _ref, _results;
    this._domBtBack.addEventListener("touchend", this._onBtBack, false);
    _ref = this._domLevels;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      domLevel = _ref[_i];
      _results.push(domLevel.addEventListener("touchend", this._onBtLevel, false));
    }
    return _results;
  };

  MenuLevels.prototype._onBtBack = function() {
    return this.emit("back");
  };

  MenuLevels.prototype._onBtLevel = function(e) {
    var domSpan, idx;
    domSpan = e.currentTarget.querySelector("span");
    idx = parseInt(domSpan.innerHTML);
    if (idx > save.getLevel() + 1) {
      return;
    }
    if (idx === save.getCurrentLevel() + 1) {
      return this.emit("back");
    } else {
      return this.emit("new", idx - 1);
    }
  };

  MenuLevels.prototype.show = function(idx) {
    var domLevel, i, idxSave, _i, _len, _ref;
    idxSave = save.getLevel();
    _ref = this._domLevels;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      domLevel = _ref[i];
      domLevel.classList.remove("deactivate");
      if (i === idx) {
        domLevel.classList.add("selected");
      } else {
        domLevel.classList.remove("selected");
        console.log(idxSave, idxSave + 1);
        if (i > idxSave + 1) {
          domLevel.classList.add("deactivate");
        }
      }
    }
    TweenLite.set(this.dom, {
      css: {
        alpha: 0
      }
    });
    return TweenLite.to(this.dom, .4, {
      css: {
        alpha: 1
      }
    });
  };

  MenuLevels.prototype.hide = function() {
    TweenLite.to(this.dom, .25, {
      css: {
        alpha: 0
      }
    });
    return done(.25 * 1000);
  };

  MenuLevels.prototype.deactivate = function() {
    var domLevel, _i, _len, _ref, _results;
    this._domBtBack.removeEventListener("touchend", this._onBtBack, false);
    _ref = this._domLevels;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      domLevel = _ref[_i];
      _results.push(domLevel.removeEventListener("touchend", this._onBtLevel, false));
    }
    return _results;
  };

  return MenuLevels;

})(Emitter);

module.exports = MenuLevels;



},{"save":14,"templates/menu-levels.jade":18}],10:[function(require,module,exports){
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



},{"Elt":3,"templates/modifier.jade":20}],11:[function(require,module,exports){
var Screen, data, tpl;

tpl = require("templates/screen.jade");

data = require("data.json");

Screen = (function() {
  function Screen(idx) {
    var text, tplCompiled;
    tplCompiled = _.template(tpl);
    if (idx < data.screens.length) {
      text = data.screens[idx];
    } else {
      if (idx === 9999) {
        text = data.end;
      } else {
        text = "Level " + idx;
      }
    }
    this.dom = domify(tplCompiled({
      text: text
    }));
  }

  Screen.prototype.show = function() {
    TweenLite.set(this.dom, {
      css: {
        alpha: 0
      }
    });
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
    return done((speed - .1) * 1000);
  };

  return Screen;

})();

module.exports = Screen;



},{"data.json":13,"templates/screen.jade":21}],12:[function(require,module,exports){
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
    this.dir = dir;
    this._onTouch = __bind(this._onTouch, this);
    tplCompiled = _.template(tpl);
    this.dom = domify(tplCompiled({
      type: type
    }));
    Square.__super__.constructor.apply(this, arguments);
    this.setDirection(this.dir, false);
  }

  Square.prototype.activate = function() {
    return this.dom.addEventListener("touchend", this._onTouch, false);
  };

  Square.prototype.deactivate = function() {
    return this.dom.removeEventListener("touchend", this._onTouch, false);
  };

  Square.prototype._onTouch = function() {
    return this.emitter.emit("touch", this);
  };

  Square.prototype.move = function(x, y) {
    if (x == null) {
      x = 0;
    }
    if (y == null) {
      y = 0;
    }
    if (x !== 0 || y !== 0) {
      this.x += x;
      this.y += y;
    } else {
      this.x += this.mov.x;
      this.y += this.mov.y;
    }
    return this.go(this.x, this.y);
  };

  Square.prototype.go = function(x, y) {
    var speed;
    this.x = x;
    this.y = y;
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



},{"Consts":2,"Elt":3,"templates/square.jade":22}],13:[function(require,module,exports){
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
		  [ 0, "sab", 0, "ga", 0 ],
		  [ 0, 0, 0, 0, 0 ],
		  [ 0, "mr", 0, "mt", 0 ],
		  [ 0, 0, 0, 0, 0 ],
		  [ 0, 0, 0, 0, 0 ]
		]
	],
	"screens": [
		"This is a game<br />about <strong>touch</strong>",
		"And about <strong>squares</strong><br />...",
		"Nothing<br />complicated<br />...",
		"And if<br />you are stuck...<br />Just <strong>undo</strong> your<br />last action<br /> or <strong>reset</strong> the level.",
		"You will discover new things the more you advance.",
		"You will soon be on your own.",
		"Wow...<br />That's getting<br /><strong>serious</strong><br />...",
		"So... I guess it's time... Good luck!"
	],
	"end": "<strong>Congratz!</strong><br />I never thought you would made it...<br /><br />you can<br />start again some<br /><strong>levels</strong>,<br />or try some<br />new <strong>challenges!</strong>"
}
},{}],14:[function(require,module,exports){
var Save;

Save = (function() {
  function Save() {
    this._idLevel = "fzfs-squares_level";
    this._idCurrent = "fzfs-squares_level-current";
  }

  Save.prototype.setLevel = function(idx) {
    var currentLevel;
    currentLevel = this.getLevel();
    if (idx < currentLevel) {
      return;
    }
    return localStorage.setItem(this._idLevel, parseInt(idx));
  };

  Save.prototype.getLevel = function() {
    return parseInt(localStorage.getItem(this._idLevel));
  };

  Save.prototype.setCurrentLevel = function(idx) {
    localStorage.setItem(this._idCurrent, parseInt(idx));
    return this.setLevel(idx);
  };

  Save.prototype.getCurrentLevel = function() {
    return parseInt(localStorage.getItem(this._idCurrent));
  };

  return Save;

})();

module.exports = new Save();



},{}],15:[function(require,module,exports){
module.exports = "<div class=\"game-holder\"><div id=\"game\"><div class=\"game-menu\"><div class=\"game-menu-item game-menu-item--menu\"></div><div class=\"game-menu-item game-menu-item--levels\"></div></div><div class=\"game-controls\"><div class=\"game-control game-control--undo\"></div><div class=\"game-control game-control--reset\"></div></div><div class=\"game-content\"></div></div><div id=\"screens\"></div></div>" ;

},{}],16:[function(require,module,exports){
module.exports = "<div class=\"elt goal goal--{{type}}\"><div class=\"elt-desc elt-desc--circle\"></div></div>" ;

},{}],17:[function(require,module,exports){
module.exports = "<div class=\"level\"></div>" ;

},{}],18:[function(require,module,exports){
module.exports = "<div id=\"levels\"><div class=\"bt-back\"></div><ul class=\"levels-entries\"><div class=\"levels-entry\"><span>0</span></div><div class=\"levels-entry\"><span>1</span></div><div class=\"levels-entry\"><span>2</span></div><div class=\"levels-entry\"><span>3</span></div><div class=\"levels-entry\"><span>4</span></div><div class=\"levels-entry\"><span>5</span></div><div class=\"levels-entry\"><span>6</span></div></ul></div>" ;

},{}],19:[function(require,module,exports){
module.exports = "<div id=\"menu\"><div class=\"menu-logo\"><div class=\"menu-logo-img\"></div></div><ul class=\"menu-actions\"><li class=\"menu-action menu-action--play\"></li><li class=\"menu-action menu-action--challenge\"></li></ul></div>" ;

},{}],20:[function(require,module,exports){
module.exports = "<div class=\"elt modifier\"><div class=\"elt-desc elt-desc--arrow\"></div></div>" ;

},{}],21:[function(require,module,exports){
module.exports = "<div class=\"screen\">{{ text }}</div>" ;

},{}],22:[function(require,module,exports){
module.exports = "<div class=\"elt square square--{{type}}\"></div>" ;

},{}]},{},[1])