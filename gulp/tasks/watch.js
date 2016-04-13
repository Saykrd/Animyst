var gulp = require('gulp');
var browserify = require('browserify');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps')
var del = require('del')
var pkg = require('../../package.json');

gulp.task('watch_vendor', function(){
	return gulp.watch('src/_base/**/*.*', gulp.series('build_vendor', 'build_app'));
});

gulp.task('watch_app', function(){
	return gulp.watch('src/_tests/**/*.*', gulp.parallel('build_app'))
})

gulp.task('watch', gulp.parallel('watch_vendor', 'watch_app'));