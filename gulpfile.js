var gulp = require( "gulp" );
var debug = require( "gulp-debug" );
var changed = require( "gulp-changed" );
var cached = require( "gulp-cached" );
var stylus = require( "gulp-stylus" );
var jade = require( "gulp-jade" );
var browserify = require( "gulp-browserify" );
var gutil = require( "gulp-util" );
var rename = require( "gulp-rename" );
var browserSync = require( "browser-sync" );
var nib = require( "nib" );
var html = require( "html-browserify" );
var bpj = require( "browserify-plain-jade" );

var src = {
  styles: "src/styles/*.styl",
  scripts: "src/scripts/main.coffee",
  templates: "src/templates/*.jade",
  cssimg: "src/styles/img/**/*"
}

gulp.task( "browser-sync", function() {

  browserSync.init( [ "app/js/*.js", "app/css/*.css", "app/*.html" ], {
    server: {
      baseDir: "./app"
    }
  } );

} );

gulp.task( "styles", function() {
  gulp.src( src.styles )
      .pipe( stylus( { use: [ nib() ], url: { name: "url", paths: [ "app/img" ], limit: false } } ) ) // CHANGER SI BESOIN => remettre une limit < 10
        .on( "error", gutil.log )
        .on( "error", gutil.beep )
      .pipe( gulp.dest( "app/css/" ) );
        
} );

gulp.task( "templates", function() {
  gulp.src( src.templates )
      .pipe( jade( { pretty: true, basedir: "src/templates/" } ) )
        .on( "error", gutil.log )
        .on( "error", gutil.beep )
      .pipe( gulp.dest( "app/" ) );
} );


gulp.task( "scripts", function() {
  gulp.src( src.scripts, { read: false } )
      .pipe( browserify( { basedir: "src/scripts", paths: [ "src/scripts/", "src/scripts/templates" ], transform: [ html, bpj, "coffeeify" ], extensions: [ ".coffee" ] } ) )
        .on( "error", gutil.log )
        .on( "error", gutil.beep )
      .pipe( rename( "app.js" ) )
      .pipe( gulp.dest( "app/js" ) );

} );

gulp.task( "cssimg", function() {
  gulp.src( src.cssimg )
      .pipe( cached( src.cssimg ) )
      .pipe( changed( src.cssimg ) )
      .pipe( gulp.dest( "app/css/img" ) );
});

gulp.task( "watch", function() {

  gulp.watch( "src/styles/**/*.styl", [ "styles" ] );
  gulp.watch( "src/templates/**/*.jade", [ "templates", "scripts" ] );
  gulp.watch( "src/scripts/**/*.coffee", [ "scripts" ] );
  gulp.watch( "src/styles/img/**/*", [ "cssimg" ] );

} );

gulp.task( "default", [ "browser-sync", "styles", "cssimg","templates", "scripts", "watch" ] );
