var gulp = require('gulp');
var browserify = require('browserify');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer')
var sourcemaps = require('gulp-sourcemaps')
var del = require('del')
var pkg = require('../../package.json');
var babel = require('gulp-babel');

function bundle(src, targetName, dest){
	return browserify({ entries : src, debug :true})
		   .bundle()
		   .on('error', function(e){
		   		console.log(e)
		   })
		   .pipe(source( targetName ))
		   .pipe(buffer())
		   .pipe(sourcemaps.init({loadMaps:true}))
		   .pipe(babel())
		   .pipe(uglify())
		   	.on('error', function(e){console.log(e)})
		   .pipe(sourcemaps.write('.'))
		   .pipe(gulp.dest(dest));
		   //.pipe(gulp.src('./bin/' + pkg.name + '.js'));
}

gulp.task('clean_vendor', function(){
	return del([
		"./bin/*"
	])
});

gulp.task('bundle_vendor', () => bundle('./src/_base/index.js', pkg.name + '.js', './bin/'));


gulp.task('clean_app', function(){
	return del([
		"./debug/js/*"
	])
});

gulp.task('bundle_app', () => bundle('./src/_tests/index.js', 'app.js', './debug/js/'));

gulp.task('port_externals', function(){
	gulp.src('./bin/*.*')
		.pipe(gulp.dest('./debug/js'))

	return gulp.src('./src/_libs/_external/*.js')
		.pipe(gulp.dest('./debug/js'))
})

gulp.task('build_vendor', gulp.series('clean_vendor', 'bundle_vendor'));
gulp.task('build_app', gulp.series('clean_app', 'bundle_app', 'port_externals'));
gulp.task('build', gulp.series('build_vendor', 'build_app'));