var gulp = require("gulp");
var coffee = require('gulp-coffee');
var gutil = require('gulp-util');

// Compilation
gulp.task('coffee', function() {
	return gulp.src('./src/**/*.coffee')
		.pipe(coffee({ bare: true }).on('error', gutil.log))
		.pipe(gulp.dest('./lib/'));
});

gulp.task('copy', function() {
	return gulp.src(['./src/**/*.js', './src/**/*.d.ts'])
		.pipe(gulp.dest('./lib/'));
});

gulp.task('default', gulp.series(['coffee', 'copy']));