var gulp = require('gulp');
var browserify = require('browserify');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps')
var del = require('del')
var pkg = require('../../package.json');

gulp.task('watch', function(){
	return gulp.watch('src/**/*.*', gulp.parallel('build'));
});