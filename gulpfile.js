const
    autoprefixer = require('gulp-autoprefixer'),
    babel = require('gulp-babel'),
    browserSync = require('browser-sync'),
    cachebust = require('gulp-cache-bust'),
    changed = require('gulp-changed'),
    concat = require('gulp-concat'),
    csso = require('gulp-csso'),
    del = require('del'),
    gulp = require('gulp'),
    gulpIf = require('gulp-if'),
    gutil = require('gulp-util'),
    htmlmin = require('gulp-htmlmin'),
    notify = require('gulp-notify'),
    runSequence = require('run-sequence'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    useref = require('gulp-useref');
const reload = browserSync.reload;

const config = {
    autoprefixer: ['last 2 versions', 'IE 9']
};

const base = {
    src: 'app',
    dist: 'dist',
};

const paths = {
    images: {
        src: base.src + '/images',
        dist: base.dist + '/images',
    },
    scripts: {
        src: base.src + '/scripts/**/*.js',
        dist: base.dist + '/scripts',
    },
    styles: {
        src: {
            scss: base.src + '/styles/scss/**/*.scss',
            css: base.src + '/styles/css/**/*.css',
            vendor: base.src + '/styles/vendor/**/*.css',
        },
        dist: {
            scss: base.src + '/styles/css',
            css: base.dist + '/styles',
            vendor: base.dist + '/styles/vendor',
        }
    },
};

gulp.task('clean', function () {
    return del.sync([
        base.dist + '/**',
        '!' + base.dist,
    ]);
});

gulp.task('copy:static', function () {
    const dist = paths.images.dist;
    return gulp
        .src(paths.images.src + '/**/*')
        .pipe(changed(dist))
        .pipe(gulp.dest(dist));
});

gulp.task('copy:html', function () {
    return gulp
        .src(base.src + '/index.html')
        .pipe(gulp.dest(base.dist));
});

gulp.task('build:html', ['copy:html'], function () {
    return gulp
        .src(base.dist + '/index.html')
        .pipe(useref())
        .pipe(gulpIf('*.js', uglify()))
        .pipe(gulpIf('*.html', htmlmin({
            collapseWhitespace: true
        })))
        .pipe(gulp.dest(base.dist));
});


gulp.task('build:cache-bust', function () {
    return gulp
        .src(base.dist + '/index.html')
        .pipe(cachebust())
        .pipe(gulp.dest(base.dist));
});

gulp.task('build:js', function () {
    const dist = paths.scripts.dist;
    return gulp
        .src(paths.scripts.src)
        .pipe(sourcemaps.init())
        .pipe(changed(dist))
        .pipe(
            babel({
                presets: ['env']
            })
            .on('error', notifyError('JavaScript Error'))
        )
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(dist));
});

gulp.task('build:scss', function () {
    const dist = paths.styles.dist.scss;
    return gulp
        .src(paths.styles.src.scss)
        .pipe(changed(dist))
        .pipe(sourcemaps.init())
        .pipe(
            sass({
                errLogToConsole: true,
                outputStyle: 'nested'
            })
            .on('error', notifyError('Sass Error'))
        )
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(dist));
});

gulp.task('build:vendor-css', function () {
    const dist = paths.styles.dist.vendor;
    return gulp
        .src(paths.styles.src.vendor)
        .pipe(changed(dist))
        .pipe(sourcemaps.init())
        .pipe(autoprefixer({
            browsers: config.autoprefixer,
            cascade: false
        }))
        .pipe(
            csso()
            .on('error', notifyError('Csso Error'))
        )
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(dist));
});

gulp.task('build:css', function () {
    const dist = paths.styles.dist.css;
    return gulp
        .src(paths.styles.src.css)
        .pipe(changed(dist))
        .pipe(sourcemaps.init())
        .pipe(autoprefixer({
            browsers: config.autoprefixer,
            cascade: false
        }))
        .pipe(
            csso()
            .on('error', notifyError('Csso Error'))
        )
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(dist));
});

gulp.task('build', function (cb) {
    runSequence('build:scss', 'copy:static', ['build:vendor-css', 'build:css', 'build:js'],  'copy:html', function () {
        gutil.log(gutil.colors.green('✔ ') + ' Build has been completed');
        cb();
    });
});

gulp.task('deploy', function (cb) {
    runSequence('clean', 'build', 'build:html', 'build:cache-bust', function () {
        gutil.log(gutil.colors.magenta('✔ ') + ' Deploy has been completed');
        cb();
    });
});

gulp.task('serve', ['build'], function () {
    browserSync.init({
        server: {
            baseDir: base.dist
        },
        ghostMode: {
            scroll: false
        },
        notify: false,
        open: false,
        port: 3001,
        files: [
            base.dist + '/**/*.css',
            base.dist + '/**/*.js',
            base.dist + '/**/*.html',
        ]
    });
    gulp.watch(paths.styles.src.scss, ['build:scss']);
    gulp.watch(paths.styles.src.css, ['build:css']);
    gulp.watch(paths.styles.src.vendor, ['build:vendor-css']);
    gulp.watch(paths.scripts.src, ['build:js']);
    gulp.watch(base.src + '/index.html', ['copy:html']);
});

gulp.task('default', ['build'], function() {});

function notifyError(title) {
    return notify.onError({
        title: title,
        subtitle: '<%= error.relativePath %>:<%= error.line %>',
        message: '<%= error.messageOriginal %>',
        open: 'file://<%= error.file %>',
        onLast: true,
    })
}
