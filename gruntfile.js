module.exports = function (grunt){
	grunt.initConfig({
		pkg :  grunt.file.readJSON("package.json"),
		uglify : {
			options: {
				beautify: true,
				 banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},

			files:{
				src: 'src/**/*.js',  // source files mask
	            dest: 'bin/<%= pkg.name %>.min.js',    // destination folder
	            expand: false,    // allow dynamic building
	            flatten: true,   // remove all unnecessary nesting
	            ext: '.min.js'   // replace .js to .min.js
			},

			tests:{
				src: 'tests/**/*.js',  // source files mask
	            dest: 'debug/js/app.min.js',    // destination folder
	            expand: false,    // allow dynamic building
	            flatten: true,   // remove all unnecessary nesting
	            ext: '.min.js'   // replace .js to .min.js
			}

		},

		copy: {
			dist: {
				src: "bin/<%= pkg.name %>.min.js",
				dest: "debug/js/<%= pkg.name %>.min.js"
			}
		}

		
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-copy');
	// register at least this one task
	grunt.registerTask('default', [ 'uglify' ]);
	grunt.registerTask('build', [ 'uglify' , 'copy' ]);
}