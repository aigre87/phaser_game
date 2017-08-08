var gulp        = require('gulp'),
    watch       = require('gulp-watch'),
    browserSync = require("browser-sync").create();

gulp.task('createServer', [], function(){
  browserSync.init({
      server: "./",
      tunnel: true,
      ghostMode: false,
      port: 65526, // измените
  });
});

gulp.task('watch', function(){
    gulp.watch("js/*.js").on('change', browserSync.stream);
    gulp.watch("*.html").on('change', browserSync.reload);
});

gulp.task('default', ['createServer', 'watch']);