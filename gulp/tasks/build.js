var gulp = require('gulp');
var browserify = require('browserify');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps')
var del = require('del')
var pkg = require('../../package.json');

gulp.task('clean', function(){
	return del([
		"./bin/*",
		"./debug/js/*.js"
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

gulp.task('uglify', function(){
	return gulp.src('./bin/animyst.js')
		.pipe(sourcemaps.init())
		.pipe(uglify())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('./bin/min'))
		

	//gulp.src('./bin/animyst.js')
	//	.pipe(sourcemaps.init())
});

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
		   .pipe(gulp.dest('./debug/js/'))
})

gulp.task('port_externals', function(){
	gulp.src('./bin/min/*.*')
		.pipe(gulp.dest('./debug/js'))

	return gulp.src('./src/_libs/_external/*.js')
		.pipe(gulp.dest('./debug/js'))
})

gulp.task('build', gulp.series('clean', 'bundle_vendor', 'uglify', 'bundle_app', 'port_externals'));
