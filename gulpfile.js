var gulp = require('gulp');
var clangFormat = require('clang-format');
var gulpFormat = require('gulp-clang-format');
var merge = require('merge2');
var stylish = require('gulp-tslint-stylish');
var tsc = require('gulp-typescript');
var tslint = require('gulp-tslint');

var config = {
    SRC_GLOB: 'src/**/*.ts',
    TESTS_GLOB: 'tests/**/*.ts'
}

gulp.task('check-format', function () {
    return gulp.src([config.SRC_GLOB, config.TESTS_GLOB])
        .pipe(gulpFormat.checkFormat('file', clangFormat));
});

gulp.task('lint', function () {
    return gulp.src([config.SRC_GLOB, config.TESTS_GLOB])
        .pipe(tslint())
        .pipe(tslint.report(stylish, {
            emitError: false,
            sort: true,
            bell: true,
        }));
});

gulp.task('watch', function () {
    gulp.watch(config.SRC_GLOB, ['typescript-compile-src']);
    gulp.watch(config.TESTS_GLOB, ['typescript-compile-tests']);
});

gulp.task('typescript-compile-src', function () {
    var results = gulp.src(config.SRC_GLOB)
        .pipe(tsc({
            module: 'commonjs',
            target: 'ES5',
            declarationFiles: true,
            outDir: 'dist'
        }));
    return merge([
        results.dts.pipe(gulp.dest('dist')),
        results.pipe(gulp.dest('dist'))
    ]);
});

gulp.task('typescript-compile-tests', function () {
    return gulp.src(config.TESTS_GLOB)
        .pipe(tsc({
            module: 'commonjs',
            target: 'ES5',
        }))
        .pipe(gulp.dest('tests'));
});

gulp.task('compile', ['typescript-compile-src', 'typescript-compile-tests']);

gulp.task('default', ['check-format', 'lint', 'compile']);