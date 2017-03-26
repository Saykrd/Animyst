var TSCONFIG_PATH = "./src/_base/tsconfig.json";

var gulp = require('gulp');
var merge = require('merge2');
var browserify = require('browserify');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var pkg = require('../../package.json');
var tsconfig = require("../../src/_base/tsconfig.json");
var babel = require('gulp-babel');
var ts = require('gulp-typescript');

var vendorTS = ts.createProject(TSCONFIG_PATH);


//========================================================
// === MISC TASKS ====

//Clears all files from the vendor output folder
gulp.task('clean_vendor', function(){ 
	return del(["./bin/*"]);
});

//Clears all files from the debug/js folder
gulp.task('clean_app', function(){
	return del(["./debug/js/*"]); 
});


//Moves all libraries to the debug/js folder
gulp.task('port_externals', function(){
	gulp.src('./bin/*.*').pipe(gulp.dest('./debug/js'));
	return gulp.src('./src/_libs/_external/*.js').pipe(gulp.dest('./debug/js'));
});

//gulp.task('bundle_vendor', () => bundle('./src/_base/index.js', pkg.name + '.js', './bin/'));
//gulp.task('bundle_app', () => bundle('./src/_tests/index.js', 'app.js', './debug/js/'));

//========================================================

// === BUILD TASKS ===


gulp.task('build_vendor', () => buildTS(vendorTS, {dest: tsconfig.outPath, targetName: pkg.name, uglify : true} ));

//gulp.task('build_vendor', gulp.series('clean_vendor', 'bundle_vendor'));
//gulp.task('build_app', gulp.series('clean_app', 'bundle_app', 'port_externals'));
//gulp.task('build', gulp.series('build_vendor', 'build_app'));


//========================================================


// == BUILD METHODS ===

/**
 * Bundles all JS files and their dependencies together into one
 * @param  {string} src        Source JS file to start bundle (usually an index.js file)
 * @param  {string} targetName Desired name the end bundled JS file will have
 * @param  {string} dest       Destination folder for the bundled JS file
 * @return {[type]}            [description]
 */
function bundle(src, targetName, dest){
	return browserify({ entries : src, debug :true})
		   .bundle()
		   .on('error', function(e){
		   		console.log(e)
		   })
		   .pipe(source( targetName ))
		   .pipe(buffer())
		   .pipe(sourcemaps.init({loadMaps:true}))
		   .pipe(uglify())
		   	.on('error', function(e){console.log(e)})
		   .pipe(sourcemaps.write('.'))
		   .pipe(gulp.dest(dest));
}


/**
 * Builds a given TypeScript project and outputs it to a folder
 * @param  {tsProject} project TypeScript project definition created with ts.createProject("./tsConfigPathHere.json")
 * @param  {object} options Output paramaters: -dest : project dest folder, -targetName : project file name, -useUglify :
 * Whether or not to run uglify on output, -srcRoot: root folder that houses your ts files
 * @return {[type]}         [description]
 */
function buildTS(project, options){//dest, targetName, useUglify, srcRoot){
	var result = project.src()
		   .pipe(sourcemaps.init({loadMaps:true}))
		   .pipe(project());

	if(options.uglify){
		return merge([
			result.js // JS Stream
				.pipe(rename(options.targetName + ".min.js"))
			    .pipe(uglify())
			    .on('error', function(e){console.log(e)})
			    .pipe(sourcemaps.write('.', {sourceRoot: options.srcRoot || "./src"}))
			    .pipe(gulp.dest(options.dest || "./")),
			result.dts// TS Lib Stream
				.pipe(rename(options.targetName + ".d.ts"))
				.pipe(gulp.dest(options.dest || "./"))
			]);
	} else {
		return merge([
			result.js //JS Stream
				.pipe(rename(options.targetName + ".js"))
				.pipe(sourcemaps.write('.', {sourceRoot: options.srcRoot || "./src"}))
				.pipe(gulp.dest(options.dest || "./")),
			result.dts// TS Lib Stream
				.pipe(rename(options.targetName + ".d.ts"))
				.pipe(gulp.dest(options.dest || "./"))
			]);
	}
		   
}



