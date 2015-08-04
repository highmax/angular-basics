var gulp = require("gulp");
var cp = require('child_process');
var util = require("gulp-util");
var sass = require("gulp-sass");
var cssmin = require("gulp-cssmin");
var prefix = require("gulp-autoprefixer");
var browserSync = require("browser-sync");
var jshint = require("gulp-jshint");

var messages = {
  build: '<span style="color: grey">Running:</span> $ build'
};

/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future builds)
 */
gulp.task('styles', function () {
  return gulp
    .src('src/_scss/**/*.scss')
    .pipe(sass())
    .on('error', handleError)
    .pipe(prefix(['last 3 versions', '> 1%'], { cascade: true }))
    .pipe(gulp.dest('src/css'))
    .pipe(gulp.dest('_site/css'))
    .pipe(browserSync.reload({stream: true}));
});

/**
 * Copy the js
 */
gulp.task('scripts', function () {
  return gulp
    .src('src/_scripts/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(gulp.dest('src/js'))
    .pipe(gulp.dest('_site/js'));
});

/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
  gulp.watch('src/_scss/**/*.scss', ['styles', 'jekyll-rebuild']);
  gulp.watch('src/_scripts/**/*.js', ['scripts', 'jekyll-rebuild']);
  gulp.watch(['src/*.html', 'src/_layouts/**/*', 'src/_includes/**/*', 'src/assets/**/*'], ['jekyll-rebuild']);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
  browserSync.reload();
});

/**
 * Build the Site
 */
gulp.task('jekyll-build', function (done) {
  browserSync.notify(messages.build);
  return cp.spawn('jekyll', ['build'], {stdio: 'inherit'})
    .on('close', done);
});

/**
 * Compile files from _scss into minified css
 */
gulp.task('sassmin', function () {
  gulp.src('src/_scss/main.scss')
    .pipe(prefix(['last 3 versions', '> 1%']))
    .pipe(cssmin())
    .pipe(gulp.dest('src/css'))
    .pipe(gulp.dest('_site/css'));
});

/*
* Browser Sync task
*/
gulp.task('browser-sync', ['styles', 'scripts', 'jekyll-build'], function () {
  browserSync({
    server: {
      baseDir: '_site'
    }
  });
});

// Handle Errors
function handleError(err){
  console.log(err.message.toString());
  this.emit('end');
}

// Tasks
// ---------------------------------------------------

// Default task, running just `gulp` will compile the less, * compile the site, launch BrowserSync & watch files.
gulp.task('default', ['browser-sync', 'watch']);

// Build task, same as build-prod, but without minification
gulp.task('build', ['styles', 'scripts', 'jekyll-build']);

// Build-prod task, with minified files
gulp.task('production', ['sassmin', 'jekyll-build']);