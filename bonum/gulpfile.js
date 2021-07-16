const { src, dest, watch, series, parallel } = require('gulp'),
    browserSync = require('browser-sync').create(),
    del = require('gulp-clean'),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'),
    rigger = require('gulp-rigger'),
    concat = require('gulp-concat'),
    sass = require('gulp-sass')(require('sass')),
    purge = require('gulp-css-purge'),
    minifyCss = require('gulp-clean-css'),
    autoprefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    babel = require('gulp-babel'),
    jsValidate = require('gulp-jsvalidate');

function clean() {
    return src('app/build/**/*', { read: false })
        .pipe(del());
}

function clearCache() {
    return cache.clearAll();
}

function html() {
    return src('app/src/*.html')
        .pipe(rigger())
        .pipe(dest('app/build'))
        .pipe(browserSync.stream());
}

function fonts() {
    return src('app/src/assets/fonts/**/*.{eot,svg,ttf,woff,woff2}')
        .pipe(dest('app/build/assets/fonts/'));
}

function css() {
    return src('app/src/scss/style.scss')
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(sass().on('error', sass.logError))
        .pipe(purge())
        .pipe(concat('main.css'))
        .pipe(minifyCss())
        .pipe(dest('app/build/css'))
        .pipe(browserSync.stream());
}

function javascript() {
    return src('app/src/js/**/*.js')
        .pipe(jsValidate())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(dest('app/build/js'))
        .pipe(browserSync.stream());
}

function images() {
    return src('app/src/assets/img/**/*')
        .pipe(cache(imagemin([
            imagemin.svgo({
                plugins: [{
                    removeViewBox: true
                }]
            })
        ], {
            verbose: true
        })))
        .pipe(dest('app/build/assets/img'));
}

exports.default = function() {
    browserSync.init({
        server: { baseDir: "app/build" }
    });
    watch(['app/src/html/*.html', 'app/src/scss/**/*.scss', 'app/src/js/**/*.js'], series(
            clean,
            // clearCache,
            images,
            fonts,
            parallel(html, css, javascript)))
        .on('change', browserSync.reload);
};