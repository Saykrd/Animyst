module.exports = function (grunt){
	grunt.initConfig({
		pkg :  grunt.file.readJSON("package.json"),

		browserify: {
			dist : {
				options: {
					transform: ['require-globify'],
				},

				files: {
					'bin/<%= pkg.name %>.js' : ['src/_base/index.js'],
					'debug/js/app.js' : ['src/_tests/index.js']
				}
			}
		},

		uglify : {
			options: {
				beautify: true,
				sourceMap : true,
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},

			files:{
				src: 'bin/<%= pkg.name %>.js',  // source files mask
	            dest: 'bin/<%= pkg.name %>.min.js',    // destination folder
	            expand: false,    // allow dynamic building
	            flatten: true,   // remove all unnecessary nesting
	            ext: '.min.js'   // replace .js to .min.js
			},

			tests:{
				src: 'debug/js/app.js',  // source files mask
	            dest: 'debug/js/app.min.js',    // destination folder
	            expand: false,    // allow dynamic building
	            flatten: true,   // remove all unnecessary nesting
	            ext: '.min.js'   // replace .js to .min.js
			}

		},

		copy: {
			main: {

				files : [
					{
						src: ["bin/<%= pkg.name %>.min.js", "bin/<%= pkg.name %>.min.js.map"],
						dest: "debug/js/",
						flatten: true,
						expand: true
					}
				]
				
			}
		},

		watch: {
			js : {
				files: ["src/**/*.js", "tests/**/*.js"],
				tasks: ["build"],
				options: {
					livereload: true
				}
			}
		}

		
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-browserify');

	grunt.registerTask('default', ['build', 'watch']);
	grunt.registerTask('build', [ 'browserify', 'uglify', 'copy']);
};