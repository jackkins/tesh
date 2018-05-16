var gulp 		= require('gulp'), // сам сборщик
	sass 		= require('gulp-sass'), // препроцессор
	browserSync = require('browser-sync'), // браузер/сервер
	concat 		= require('gulp-concat'),// соеднинение файлов в 1
	uglify		= require('gulp-uglifyjs'), // минимизированиеjs
	cssnano		= require('gulp-cssnano'),// минимизир css
	rename 		= require('gulp-rename'),// переименование файла
	del 		= require('del'), // удаление файла
	imagemin    = require('gulp-imagemin'), // минимиз изобр
	pngquant	= require('imagemin-pngquant'), // 
	cache 		= require('gulp-cache'),//кеш
	autoprefixer= require('gulp-autoprefixer'); // добавление в css префиксов (-webkit- ..)

gulp.task('task-sass',function(){
	return gulp.src('app/sass/*.scss')
	.pipe(sass())
	.pipe(autoprefixer(['last 15 versions','> 1%','ie 8','ie 7'],{ cascade: true }))
	.pipe(gulp.dest('app/css'))
	.pipe(browserSync.reload({stream: true}))
})

gulp.task('scripts',function(){
	return gulp.src([
		'app/libs/jquery/dist/jquery.min.js',
		'app/libs/magnific-popup/dist/jquery.magnific-popup.min.js',
	])
	.pipe(concat("libs.min.js"))
	.pipe(uglify())
	.pipe(gulp.dest('app/js'))
})

gulp.task('css-libs',['task-sass'],function(){
	return gulp.src('app/css/libs.css')
	.pipe(cssnano())
	.pipe(rename({
		suffix:'.min'
	}))
	.pipe(gulp.dest('app/css'));
})

gulp.task('browser-sync',function(){
	browserSync({
		server: {
			baseDir: 'app'
		},
		notify: false
	});
})

gulp.task('clean-dist',function(){
	return del.sync('dist');
})

gulp.task('clear-cache',function(){
	return cache.clearAll();
})

gulp.task('img',function(){
	return gulp.src('app/img/**/*')
	.pipe(cache(imagemin({
		interlaced: true,
		progressive: true,
		svgoPlugins:[{ removeViewBox: false }],
		use: [pngquant()]
	})))
	.pipe(gulp.dest('dist/img'));
})

gulp.task('watch',['browser-sync','css-libs','scripts'],function(){
	gulp.watch('app/sass/*.scss',['task-sass']);
	gulp.watch('app/*.html',browserSync.reload);
	gulp.watch('app/js/**/*.js',browserSync.reload);
})

gulp.task('build',['clean-dist', 'css-libs', 'scripts','img'],function(){

	var buildCss = gulp.src([
			'app/css/main.css',
			'app/css/libs.min.css'
		])
		.pipe(gulp.dest('dist/css'));

	var buildFonts = gulp.src('app/fonts/**/*')
		.pipe(gulp.dest('dist/fonts'));

	var buildJs = gulp.src('app/js/**/*')
		.pipe(gulp.dest('dist/js'));

	var buildHtml = gulp.src('app/*.html')
		.pipe(gulp.dest('dist'));

})

