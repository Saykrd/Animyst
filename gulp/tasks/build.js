var CONFIG_PATH_VENDOR = "./src/_base/tsconfig.json";
var CONFIG_PATH_APP    = "./src/_project/tsconfig.json";

var DEBUG = true;
var EXTENSION = (DEBUG ? '.js' : '.min.js');

var gulp = require('gulp');
var merge = require('merge2');
var concat = require('gulp-concat');
var inject = require('gulp-inject');
var browserify = require('browserify');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var pkg = require('../../package.json');

var configVendor = require("../../src/_base/tsconfig.json");
var configApp    = require("../../src/_project/tsconfig.json");

var babel = require('gulp-babel');
var ts = require('gulp-typescript');

var vendorTS = ts.createProject(CONFIG_PATH_VENDOR);
var vendorLib = ts.createProject(CONFIG_PATH_VENDOR, {declaration: true, allowJs: false});
var appTS = ts.createProject(CONFIG_PATH_APP);




//========================================================
// === BASE TASKS ====

//Clears all files from the vendor output folder
gulp.task('clean_vendor', function(){ 
	return del(["./bin/*"]);
});

//Clears all files from the debug/js folder
gulp.task('clean_app', function(){
	return del(["./debug/js/*"]); 
});


//Places the vendor files into the debug folder
gulp.task('port_vendor', function(){
	return gulp.src(['./bin/animyst' + EXTENSION, './bin/animyst' + EXTENSION + '.map']).pipe(gulp.dest('./debug/js'));
})


//Moves all libraries to the debug/js folder
gulp.task('port_externals', function(){
	return gulp.src(['./src/_libs/**/*.js', './src/_libs/**/*.js.map']).pipe(gulp.dest('./debug/js/external'));
});

//Places the vendor lib into the _project folder
gulp.task('port_vendor_lib', function(){
	return gulp.src('./bin/animyst.d.ts').pipe(gulp.dest('./src/_project'));
});

gulp.task('inject_sources', function(){
	var target = gulp.src('./debug/index.html');
	var externals = gulp.src(['./debug/js/external/**/*.js'],{read: false});
	var main = gulp.src(['./debug/js/*.js'],{read: false});

	return target
		.pipe(inject(externals, {name: 'external', relative:true}))
		.pipe(inject(main, {relative:true}))
		.pipe(gulp.dest('./debug'));
})



gulp.task('compile_vendor', () => buildTS(vendorTS, {dest: configVendor.outPath, targetName: pkg.name, uglify : !DEBUG} ));
gulp.task('compile_vendor_lib', () => buildLib(vendorLib, {dest: configVendor.outPath, targetName: pkg.name, uglify : true} ));
gulp.task('compile_app', () => buildTS(appTS, {dest: configApp.outPath, targetName: configApp.targetName, uglify : true}));


//========================================================

// === BUILD TASKS ===


gulp.task('build_vendor', gulp.series('compile_vendor', 'compile_vendor_lib', 'port_vendor_lib'));
gulp.task('build_app', gulp.series('clean_app', 'compile_app', 'port_vendor', 'port_externals', 'inject_sources'));
gulp.task('build', gulp.series('build_vendor', 'build_app'));


//========================================================

// == BUILD METHODS ===

/**
 * Builds a given TypeScript project and outputs it to a folder
 * @param  {tsProject} project TypeScript project definition created with ts.createProject("./tsConfigPathHere.json")
 * @param  {object} options Output paramaters: -dest : project dest folder, -targetName : project file name, -useUglify :
 * Whether or not to run uglify on output, -srcRoot: root folder that houses your ts files
 * @return {[type]}         [description]
 */
function buildTS(project, options){//dest, targetName, useUglify, srcRoot){
	var result = project.src()
		   .pipe(sourcemaps.init())
		   .pipe(project());

	console.log(options.uglify);
	if(options.uglify){
		return result.js // JS Stream
		    //.pipe(uglify())
		    .pipe(rename({suffix : ".min"}))
		    .pipe(sourcemaps.write('.', {sourceRoot: options.srcRoot || "./src"}))
		    .pipe(gulp.dest(options.dest || "./"));
	} else {
		return result.js //JS Stream
				.pipe(sourcemaps.write('.', {sourceRoot: options.srcRoot || "./src"}))
				.pipe(gulp.dest(options.dest || "./"));
	}
		   
}

function buildLib(project, options){
	return project.src()
		   //.pipe(sourcemaps.init({loadMaps:true}))
		   .pipe(project()).dts
		   .pipe(rename(options.targetName + ".d.ts"))
		   .pipe(gulp.dest(options.dest || "./"))
}

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






