var gulp        = require('gulp');
var rollup      = require('rollup').rollup;
var babel       = require('rollup-plugin-babel');
var uglify      = require('gulp-uglify');
var rename      = require('gulp-rename');
var strip       = require('gulp-strip-comments');
var prettify    = require('gulp-js-prettify');

gulp.task('rollupjs', function () {
    var loose = true;
    var babelPlugins = [
        require('babel-plugin-transform-strict-mode'),
        [require('babel-plugin-transform-es2015-template-literals'), { loose }],
        require('babel-plugin-transform-es2015-literals'),
        require('babel-plugin-transform-es2015-function-name'),
        [require('babel-plugin-transform-es2015-arrow-functions')],
        require('babel-plugin-transform-es2015-block-scoped-functions'),
        [require('babel-plugin-transform-es2015-classes'), { loose }],
        require('babel-plugin-transform-es2015-object-super'),
        require('babel-plugin-transform-es2015-shorthand-properties'),
        require('babel-plugin-transform-es2015-duplicate-keys'),
        [require('babel-plugin-transform-es2015-computed-properties'), { loose }],
        [require('babel-plugin-transform-es2015-for-of'), { loose }],
        require('babel-plugin-transform-es2015-sticky-regex'),
        require('babel-plugin-transform-es2015-unicode-regex'),
        require('babel-plugin-check-es2015-constants'),
        [require('babel-plugin-transform-es2015-spread'), { loose }],
        require('babel-plugin-transform-es2015-parameters'),
        [require('babel-plugin-transform-es2015-destructuring'), { loose }],
        require('babel-plugin-transform-es2015-block-scoping')
        //require('babel-plugin-transform-es2015-typeof-symbol')
    ];

    function getModuleName(file){
        if (file=='bundle.js'){
            return 'app';
        }
        return file.replace('.js','').replace(/(\w)/,function(v){
            return v.toUpperCase();
        });
    }

    function convert(file,distFile){
      return rollup({
            entry: 'src/'+file,
            plugins: [
                babel({ plugins:babelPlugins  })
            ]
        }).then(function (bundle) {
            bundle.write({
                format: 'umd', //'amd', 'cjs', 'es6', 'iife', 'umd'
                dest: 'dist/'+(distFile||file),
                moduleName:getModuleName(file)
            });
        });
    }

   return convert('bundle.js','action.js');
        // .then(convert('engine.js'))
        // .then(convert('listener.js'))
        // .then(convert('observer.js'))
        // .then(convert('template.js'));
});

var prettifyOptions={
    collapseWhitespace: true,
    indent_size:2,
    preserve_newlines:true,
    max_preserve_newlines:1
};
gulp.task('prettify', function () {
  return gulp.src('dist/action.js')
    .pipe(strip())
    .pipe(prettify(prettifyOptions))
    .pipe(gulp.dest('dist'));
});

gulp.task('minifyjs', function() {
  return gulp.src('dist/action.js')
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))  
    .pipe(gulp.dest('dist'))
});

gulp.task('default',function(){
    gulp.start('rollupjs','prettify','minifyjs');
});