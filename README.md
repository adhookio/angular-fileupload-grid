angular-fileupload-grid
=======================

Inspired by AngularJS CRUD Grid (https://github.com/jonbgallant/AngularJS-WebApi-EF) and angular-file-upload (https://github.com/danialfarid/angular-file-upload) we've created an AngularJS drag & drop file upload grid.

Installation
-------------

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
 
```javascript
   $scope.columns = [
                  {"name":"Id","class":"col-lg-1","autoincrement": "true"},
                  {"name":"Name", "class": "col-lg-6"},
                  {"name":"Url", "class": "col-lg-2"},
                  {
                     "name":"FiletypeId", 
                     "class" : "col-lg-3",
                     "header":"Typ",
                     "lookup":
                     {
                        "table":"FileTypes",
                        "key":"Id",
                        "value":"Name",
                        "orderBy": {"field": "Name", "asc":"true"}
                     },
                  }
                 ];
```
 * use-file-upload: Flag, if the drag & drop functionality should be activated.
 * can-open-child-grid: Flag, if your master grid has a detail grid.
