var gulp = require('gulp');
var livereload = require('gulp-livereload');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps')
var del = require('del')
var pkg = require('../../package.json');

var projectFiles = ['src/_project/**/*.*', '!src/_project/animyst.d.ts'];
var vendorFiles = ['src/_base/**/*.*']

gulp.task('watch_vendor', function(){
	
	gulp.watch(vendorFiles, gulp.series('build'));
});

gulp.task('watch_app', function(){
	gulp.watch(projectFiles, gulp.series('build_app'));
})


gulp.task('watch', gulp.parallel('watch_vendor', 'watch_app'));