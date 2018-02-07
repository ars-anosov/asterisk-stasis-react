'use strict';

// tools --------------------------------------------------
var gulp            = require('gulp'),
    rimraf          = require('rimraf'),
    gulpif          = require('gulp-if'),
    gutil           = require('gulp-util');

// web-front ----------------------------------------------
var watch           = require('gulp-watch'),
    browserSync     = require("browser-sync"),
    reload          = browserSync.reload,
    prefixer        = require('gulp-autoprefixer'),
    uglify          = require('gulp-uglify'),
    sass            = require('gulp-sass'),
    sourcemaps      = require('gulp-sourcemaps'),
    rigger          = require('gulp-rigger'),
    cssmin          = require('gulp-clean-css'),
    browserify      = require('browserify'),
    babelify        = require('babelify'),
    source          = require('vinyl-source-stream'),
    buffer          = require('vinyl-buffer');

// built flags --------------------------------------------
var buildFlag = {
  production: gutil.env.production ? true : false,
  sourcemap:  gutil.env.sourcemap ? true : false
};

var path = {
    // html -----------------------------------------------
    src: {
      html:       'src/*.*',
      js:         'src/js/',
      jsx:        ['index.jsx', 'redux.jsx'],
      scss:       'src/style/*.*css',
      img:        'src/img/**/*.*',
      fonts:      'src/fonts/**/*.*'
    },
    build: {
      html:       'build/',
      js:         'build/js/',
      css:        'build/css/',
      img:        'build/img/',
      fonts:      'build/fonts/'
    },
    watch: {
      html:       ['src/*.html', 'src/templates/*.html'],
      jsx:        ['src/js/*.js*', 'src/js/components/*.js*', 'src/js/containers/*.js*', 'src/js/reducers/*.js*', 'src/js/store/*.js*', 'src/js/actions/*.js*', 'src/js/constants/*.js*', 'src/js/enhancers/*.js*'],
      scss:       ['src/style/**/*.*css'],
      img:        ['src/img/**/*.*'],
      fonts:      ['src/fonts/**/*.*']
    },
    clean:          './build/*',
};

var webserverConfig = {
    server: {
        baseDir:    "./build"
    },
    //proxy: "http://localhost/sputnik/",
    //serveStatic: [{
    //    route: '/sputnik',
    //    dir: './build'
    //}],
    tunnel:         false,
    host:           'localhost',
    port:           8005,
    logPrefix:      "Frontend_Devil",
    open:           false
};




if (buildFlag.production) { process.env.NODE_ENV = 'production'; }




//                                                          |
//                         tasks                            |
//                                                          |

// -------------------------------------------------------- | webserver
gulp.task('webserver', function () {
  browserSync( webserverConfig );
});

// -------------------------------------------------------- | clean
gulp.task('clean', function (cb) {
    rimraf( path.clean, cb );
});

// -------------------------------------------------------- | build
gulp.task('html:build', function () {
  gulp.src(path.src.html) 
    .pipe( rigger() )
    .pipe( gulp.dest(path.build.html) )
    .pipe( reload({stream: true}) );
});

gulp.task('jsx:build', function () {
  // .js files (vanila js) if exists
  gulp.src(path.src.js+'*.js') 
    .pipe( rigger() ) 
    .pipe( gulpif( buildFlag.sourcemap, sourcemaps.init({loadMaps: true}) ) ) 
    .pipe( uglify() ) 
    .pipe( gulpif( buildFlag.sourcemap, sourcemaps.write('./maps') ) ) 
    .pipe( gulp.dest(path.build.js) );

  // .jsx (ES6 and JSX)
  path.src.jsx.map ( (row, i) => {
    browserify({
      entries: path.src.js+row,
      extensions: ['.js', '.jsx'],                                            // какие файлы будет обрабатывать browserify
      //noParse: [require.resolve('template for future use')],
      debug: false                                                            // debug заставляет browserify строить sourcemaps. На входе файл "path.src.jsx"
    })
      .transform('babelify', {presets: ['env', 'stage-0', 'react']})           // babel + presets
      .bundle()                                                               // эта херня выдает "text stream"
      .pipe( source( row.replace(/\.jsx/i, '\.js') ) )                        // конвертируем в "vinyl stream". Теперь большинство gulp-плагинов подцепятся к stream.
      
      .pipe( gulpif( buildFlag.production, buffer() ) )                       // Плагину uglify нужен "buffered vinyl file object". Конвертируем.
      .pipe( gulpif( buildFlag.sourcemap, sourcemaps.init({loadMaps: true}) ) )
      .pipe( gulpif( buildFlag.production, uglify() ) )
      .pipe( gulpif( buildFlag.sourcemap, sourcemaps.write('./maps') ) )

      .pipe( gulp.dest(path.build.js) )
      .pipe( reload({stream: true}) )
  })

});

gulp.task('scss:build', function () {
  gulp.src(path.src.scss)
    .pipe( gulpif( buildFlag.sourcemap, sourcemaps.init({loadMaps: true}) ) )
    .pipe( sass({sourceMap: true, errLogToConsole: true}) )
    .pipe( rigger() )
    .pipe( prefixer() )
    .pipe( cssmin() )
    .pipe( gulpif( buildFlag.sourcemap, sourcemaps.write('./maps') ) )
    .pipe( gulp.dest(path.build.css) )
    .pipe( reload({stream: true}) );
});

gulp.task('image:build', function () {
  gulp.src(path.src.img) 
    .pipe( gulp.dest(path.build.img) )
    .pipe( reload({stream: true}) );
});

gulp.task('fonts:build', function() {
  gulp.src(path.src.fonts)
    .pipe(gulp.dest(path.build.fonts))
    .pipe( reload({stream: true}) );
});

gulp.task('build', [
  'html:build',
  'jsx:build',
  'scss:build',
  'fonts:build',
  'image:build'
]);




// -------------------------------------------------------- | watch
gulp.task('watch', function(){
  watch(path.watch.html, function(event, cb) {
    gulp.start('html:build');
  });
  watch(path.watch.scss, function(event, cb) {
    gulp.start('scss:build');
  });
  watch(path.watch.jsx, function(event, cb) {
    gulp.start('jsx:build');
  });
  watch(path.watch.img, function(event, cb) {
    gulp.start('image:build');
  });
  watch(path.watch.fonts, function(event, cb) {
    gulp.start('fonts:build');
  });
});




// -------------------------------------------------------- | default
gulp.task('default', [
  'build',
  'webserver',
  'watch'
]);
