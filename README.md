# start-project

```
npm install
gulp serve
```

* `gulp clean` — remove `dist` directory
* `gulp copy:static` — copy static files to `dist`
* `gulp copy:html` — copy `index.html` to `dist`
* `gulp build:html` — apply `useref` plugin and minify `index.html`
* `gulp build:cache-bust` — add hashes to external resources in `index.html`
* `gulp build:js` — apply `babel`, `uglify` and create sourcemaps for JavaScript sources
* `gulp build:scss` — apply `sass` and create sourcemaps for SCSS sources
* `gulp build:vendor-css` — apply `autoprefixer`, minify and create sourcemaps for external CSS sources
* `gulp build:css` — apply `autoprefixer`, minify and create sourcemaps for generated CSS files
* `gulp build` — build ready for debug project
* `gulp deploy` — build ready for production project
* `gulp serve` — build and start `browserSync`
