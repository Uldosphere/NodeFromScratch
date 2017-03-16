//********//
//Requires 
//********//
//JS
var gulp         = require( 'gulp');
var browserSync  = require( 'browser-sync');      // Synchro dans le navigateur à la sauvegarde
var htmlreplace  = require( 'gulp-html-replace'); // Concaténation des block repérés par <!--build/endbuild-->
var concat       = require( 'gulp-concat');    
var minify       = require( 'gulp-minify');       // Minifiage JS
var uglify       = require( 'gulp-uglify');       // Uglification JS
var jsObfuscator = require( 'gulp-javascript-obfuscator'); //Obfuscation JS (désactvée de base)
var minifyCSS    = require( 'gulp-minify-css');   // Minification CSS
var autoprefixer = require( 'gulp-autoprefixer'); // Support des vendor prefix CSS
var imagemin     = require( 'gulp-imagemin');     // Optimisation des images
var cache        = require( 'gulp-cache');        // Mise en cache des images
var gulpIf       = require( 'gulp-if');           // If interne à Gulp
var addsrc       = require( 'gulp-add-src');      // Ajout de sources au pipe
var del          = require( 'del');               // Lib de suppression
var runSequence  = require( 'run-sequence');      // Lib de séquencage (pas du génome)
//Sass
var sass         = require( 'gulp-sass');         // Gestion des SCSS
//Typescript/Babel 
var gtypescript  = require( 'gulp-typescript');   // Gestion du TypeScript
var gbabel       = require( 'gulp-babel');        // Transpilage ES6
//JSLint ESLint
var jslint       = require( 'gulp-jslint-simple');// JSLint
var eslint       = require( 'gulp-eslint');       // ESLint
//Sourcemaps
var sourcemaps   = require( 'gulp-sourcemaps');   // Gestion du sourcemapping

//*************//
// Tâches Gulp //
//*************//

// Raccourcis (plusieurs tâches enchainées)
gulp.task('local', function() {
  runSequence(
    'typescript', 
    'sass',
    ['browserSync', 'watch']
  )
})

gulp.task('dev', function() {
  runSequence( 
    'typescript', 
    'eslint',
    'sass'
  );
  return gulp.src( ['src/**/*'])
    .pipe( gulp.dest( 'dev/'))
})

gulp.task('build', function() {
  runSequence('cleandist', //Les tasks en [] sont parallélisées, les tasks à la suite sont sérialisées
              'typescript',
              'eslint',
              ['sass', 'imagemin'],
              ['buildJS', 'buildCSS'],
              ['buildHTML', 'libs', 'fonts']
  );
  return gulp.src( ['src/**/*.php'])
    .pipe( gulp.dest( 'dist/'))
});

gulp.task( 'cleandist', function() { // Suppression complète de dist/
  //On supprime dist 
  del( 'dist');
  return cache.clearAll();
});

gulp.task( 'cleandev', function() { // Suppression complète de dist/
  //On supprime dist 
  del( 'dev');
  return cache.clearAll();
});

gulp.task( 'cleanless', function() { //On supprime dist sauf les images (long à reconstruire)
  del( ['dist/**/*', '!dist/images', '!dist/images/**/*'])
});


//On DEV en local
//***************
gulp.task('sass', function() { //SASSification
  return gulp.src( 'src/css/**/*.scss') 
    .pipe( sass()) 
    .pipe( gulp.dest('src/css')) 
    .pipe( browserSync.reload({
      stream: true
    }))
});

gulp.task('typescript', function() { //On transpile les TS de la Dev
  return gulp.src( 'src/js/**/*.ts') 
    .pipe( gtypescript({ //Tous les TS sont transpilés et mis dans un fichier de sortie typescripts.js
            noImplicitAny: true,
            out: 'typescripts.js'
        }))
    .pipe( gulp.dest('src/js')) 
    .pipe( browserSync.reload({
      stream: true
    }))
});

gulp.task( 'eslint', function() { //On fait tourner ESLint sur les *.js
  return gulp.src( ['src/js/**/*.js'])
    .pipe(eslint( { configFile: 'eslintrc.json'}))
    .pipe( eslint.format())
    .pipe( eslint.failAfterError());
});

gulp.task('watch', ['browserSync', 'sass', 'typescript'], function() { //Surveillance 
  // Tâche de watching pour passer à sass et/ou typescript des changement de scss ou ts
  gulp.watch( 'src/css/**/*.scss', ['sass']);
  gulp.watch( 'src/js/**/*.ts', ['typescript']);
  // Tâche de watching pour reloader la page sur changements de js ou html
  gulp.watch( 'src/*.html', browserSync.reload);
  gulp.watch( 'src/js/*.js', browserSync.reload);
});

gulp.task( 'browserSync', function() { //Reload du fûreteur dynamique
  browserSync({
    server : {
      baseDir: 'src'
    },
  })
});

//On BUILD la Prod
//****************
gulp.task( 'buildJS', function() { //Concaténation et minification/uglification des JS
  return gulp.src( ['src/js/**/*.js','!src/js/**/*.min.js','!src/js/**/*-min.js'])
    .pipe( sourcemaps.init())
    .pipe( concat('concat_js.min.js'))
    .pipe( uglify())
    .pipe( minify( { ext:{min:'.js'}}))
    //Décommenter pour obfuscation
    //.pipe( jsObfuscator()) 
    .pipe( sourcemaps.write('../../maps'))
    .pipe( gulp.dest( 'dist/js'))
});

gulp.task( 'buildCSS', function() { //Minification et ajout des vendor prefix CSS
  return gulp.src( 'src/css/**/*.css')
    .pipe( sourcemaps.init())
    .pipe( concat('concat_css.min.css'))
    .pipe( minifyCSS( autoprefixer({
            browsers: ['last 3 versions'],
            cascade: false
        })))
    .pipe( sourcemaps.write('../../maps'))
    .pipe( gulp.dest( 'dist/css'))
});

gulp.task( 'buildHTML', function() { 
  return gulp.src( ['src/*.html', 'src/*.htm'])
    .pipe( htmlreplace({
          'replacecss': 'css/concat_css.min.css',
          'replacejs' : 'js/concat_js.min.js'
      }))
    .pipe( gulp.dest( 'dist/'))
});

gulp.task( 'imagemin', function() { // Minification et mise en cache des images passées par imagemin
  return gulp.src( 'src/images/**/*.+(png|jpg|gif|svg)')
    .pipe( cache(imagemin({
        interlaced : true
      })))
    .pipe( gulp.dest( 'dist/images'))
});

gulp.task( 'fonts', function() { // Copie des fonts
  return gulp.src( 'src/fonts/**/*')
    .pipe( gulp.dest( 'dist/fonts'))
});

gulp.task( 'libs', function() { // Copie des lib avec minifiage
 
  gulp.src( ['src/libs/**/*.js', '!src/libs/**/*.min.js']) //On ne minifie que les lib qui ne proposent pas déjà qqch de minifié
    .pipe( minify({ 
        ext:{
            src:'.js',
            min:'.min.js'
        }
    }))
    .pipe( addsrc( 'src/libs/**/*.min.js')) // Les libs minifiées sont copiées telles
    .pipe( gulp.dest( 'dist/libs'))
});
