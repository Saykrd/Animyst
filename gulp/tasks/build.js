var gulp = require('gulp');
var browserify = require('browserify');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps')
var del = require('del')
var pkg = require('../../package.json');
var babel = require('gulp-babel');


function packageSource(source, dest){
	return gulp.src(source)
		.pipe(sourcemaps.init())
		.pipe(babel())
		.pipe(uglify())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(dest))
}

gulp.task('clean', function(){
	return del([
		"./bin/*",
		"./debug/js/*"
	])
});

gulp.task('bundle_vendor', function(){
	return browserify('./src/_base/index.js')
		   .bundle()
		   .on('error', function(e){
		   		console.log(e)
		   })
		   .pipe(source( pkg.name + '.js'))
		   .pipe(gulp.dest('./bin'));
		   //.pipe(gulp.src('./bin/' + pkg.name + '.js'));
});

gulp.task('package_vendor', () => packageSource('./bin/animyst.js', './bin/min'));


gulp.task('sourcemaps', function(){
	return gulp.src('./bin/min/*.js')
		.pipe(sourcemaps.init())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('./bin/min/'));
})

gulp.task('bundle_app', function(){
	return browserify('./src/_tests/index.js')
		   .bundle()
		   .on('error', function(e){
		   		console.log(e)
		   })
		   .pipe(source('app.js'))
		   //.pipe(babel())
		   .pipe(gulp.dest('./debug/js/'))
})

gulp.task('package_app', () => packageSource('./debug/js/app.js', './debug/js/'));

gulp.task('port_externals', function(){
	gulp.src('./bin/min/*.*')
		.pipe(gulp.dest('./debug/js'))

	return gulp.src('./src/_libs/_external/*.js')
		.pipe(gulp.dest('./debug/js'))
})

gulp.task('build', gulp.series('clean', 'bundle_vendor', 'package_vendor', 'bundle_app', 'package_app', 'port_externals'));
