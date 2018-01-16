'use strict';

// tools --------------------------------------------------
var gulp            = require('gulp'),
    rimraf          = require('rimraf'),
    rsync           = require('gulp-rsync'),
    gulpif          = require('gulp-if'),
    gutil           = require('gulp-util');

var path = {
    // node -----------------------------------------------
    node: {
        root:       'node-back/',
        dest_user:  'ars',
        dest_host:  '192.168.28.18',
        dest_dev:   '/docker_vol/node-data/dev/',
        dest_prod:  '/docker_vol/node-data/prod/',
    },
    // aster ----------------------------------------------
    aster: {
        root:       'asterisk/etc/',
        dest_user:  'ars',
        dest_host:  '192.168.28.18',
        dest_dev:   '/docker_vol/aster-etc/',
        dest_prod:  '/docker_vol/aster-etc/',
    },
};

// built flags --------------------------------------------
var buildFlag = {
  production: gutil.env.production ? true : false,
};

var rsyncConfGlob = {
    progress:       	true,
    incremental:    	true,
    relative:       	true,
    emptyDirectories: true,
    recursive:      	true,
    clean:          	false,
    exclude:        	['.DS_Store', 'README.md', 'node_modules']
};




//                                                          |
//                         tasks                            |
//                                                          |

gulp.task('node:deploy:prod', function() {
    var rsyncConf = {};
    for (var key in rsyncConfGlob) { rsyncConf[key] = rsyncConfGlob[key]; }
    rsyncConf.hostname      = path.node.dest_host;
    rsyncConf.username      = path.node.dest_user;
    rsyncConf.root          = path.node.root;
    rsyncConf.destination   = path.node.dest_prod;

    gulp.src([ path.node.root ])
        .pipe(rsync(rsyncConf));
});

gulp.task('aster:deploy:dev', function() {
    var rsyncConf = {};
    for (var key in rsyncConfGlob) { rsyncConf[key] = rsyncConfGlob[key]; }
    rsyncConf.hostname      = path.aster.dest_host;
    rsyncConf.username      = path.aster.dest_user;
    rsyncConf.root          = path.aster.root;
    rsyncConf.destination   = path.aster.dest_dev;

    console.log(path.aster.root)
    gulp.src([ path.aster.root ])
        .pipe(rsync(rsyncConf));
});


gulp.task('deploy', [
    //'node:deploy:dev',
    'aster:deploy:dev'
]);



// -------------------------------------------------------- | default
gulp.task('default', [
    'deploy'
]);
