angular-fileupload-grid
=======================

Inspired by AngularJS CRUD Grid (https://github.com/jonbgallant/AngularJS-WebApi-EF) and angular-file-upload (https://github.com/danialfarid/angular-file-upload) we've created an AngularJS drag & drop file upload grid.

```
bower install https://github.com/woozles/angular-fileupload-grid.git
```


Usage
-------------

```html
 <div class="col-lg-12" 
      crud-grid
      table="{{url}}" 
      columns="{{columns}}" 
      use-file-upload="true" 
      can-open-child-grid="false" 
  />

 ```
 
**Parameters**


 * class: The style of your div.
 * crud-grid: This enables your div as crud-grid.
 * table: Url for the rest operations (e.g. api/persons)
 * columns: Columns which you want to show
 * use-file-upload: Flag, if the drag & drop functionality should be activated.
 * can-open-child-grid: Flag, if your master grid has a detail grid.
