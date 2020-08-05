'use strict';

const
    // source and build folders
    dir = {
        src         : 'src/',
        build       : 'public/'
    },

    // Gulp and plugins
    gulp          = require('gulp'),
    newer         = require('gulp-newer'),
    imagemin      = require('gulp-imagemin'),
    sass          = require('gulp-sass'),
    postcss       = require('gulp-postcss'),
    include       = require('gulp-include'),
    deporder      = require('gulp-deporder'),
    concat        = require('gulp-concat'),
    stripdebug    = require('gulp-strip-debug'),
    uglify        = require('gulp-uglify'),
    strip         = require('gulp-strip-css-comments');

;

// PHP settings
const files = {
    src           : dir.src + '**/*.+(php|html|txt)',
    build         : dir.build
};

// copy PHP files
gulp.task('files', function(){
    return gulp.src(files.src)
            .pipe(newer(files.build))
            .pipe(gulp.dest(files.build));
});

var css = {
    src         : dir.src + 'sass/main.scss',
    watch       : dir.src + 'sass/**/*',
    build       : dir.build + 'css/',
    sassOpts: {
        outputStyle     : 'nested',
        precision       : 3,
        errLogToConsole : true,
        includePaths: ['node_modules']
    },
    processors: [
        require('autoprefixer'),
        require('css-mqpacker'),
        require('cssnano')
    ]
};

gulp.task('css', function() {
    return gulp.src(css.src)
        .pipe(sass(css.sassOpts))
        .pipe(postcss(css.processors))
        .pipe(strip({
            preserve: false,
        }))
        .pipe(gulp.dest(css.build));
});

const js = {
    src         : dir.src + 'js/**/*',
    build       : dir.build + 'js/',
    filename    : 'app.js'
};

// JavaScript processing
gulp.task('js', function() {
    return gulp.src(js.src)
        .pipe(include({
            includePaths: [
              __dirname + '/node_modules',
              __dirname + '/src/js'
            ]
        }))
        .pipe(deporder())
        .pipe(concat(js.filename))
        .pipe(stripdebug())
        .pipe(uglify())
        .pipe(gulp.dest(js.build));
});


// image settings
const images = {
    src         : dir.src + 'img/**/*',
    build       : dir.build + 'img/'
};

// image processing
gulp.task('images', function(){
    return gulp.src(images.src)
            .pipe(newer(images.build))
            .pipe(imagemin())
            .pipe(gulp.dest(images.build));
});

// watch for file changes
gulp.task('watch', function() {

    // page changes
    gulp.watch(files.src, gulp.series('files'));

    // image changes
    gulp.watch(images.src, gulp.series('images'));

    // CSS changes
    gulp.watch(css.watch, gulp.series('css'));

    // JavaScript main changes
    gulp.watch(js.src, gulp.series('js'));

});

gulp.task('build', gulp.series('files', 'images', 'css', 'js'));
gulp.task('default', gulp.series('files', 'images', 'css', 'js', 'watch'));
