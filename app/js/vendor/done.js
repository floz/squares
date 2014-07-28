done = function( delay, callback ) {
  if( callback ) {
    setTimeout( function() {
      callback.call( null );
    }, delay );
  }
  return {
    then: function( callback ) {
      setTimeout( function() {
        callback.call( null );
      }, delay);
    }
  };
};
