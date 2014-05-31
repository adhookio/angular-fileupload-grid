(function() {

    var angularFileUploadGrid = angular.module('angularFileUploadGrid', ['ngResource', 'angularFileUpload', 'ui.bootstrap']);

   angularFileUploadGrid.provider("CrudGridConfiguration", function() {
            this.configurationProvider = {};

            this.$get = function() {
                var configurationProvider = this.configurationProvider;

                return {
                    configuration: function() {
                        return configurationProvider;
                    }
                };
            };

            this.setConfiguration = function(configuration) {
                this.configurationProvider = configuration;
            };
        });

    angularFileUploadGrid.directive('crudGrid', function () {
        return {
            restrict: 'A',
            replace: false,
            scope: {
                "table" : "@",
                "columns" : "@",
                "actions" : "@",
                "useFileUpload" : "@",
                "canOpenChildGrid" : "@",
                "childCols" : "@"
            },
            templateUrl: 'components/angular-fileupload-grid/dist/Templates/crud-grid-directive-template.html',
            controller: ['$scope', '$element', '$attrs', '$upload', 'crudGridDataFactory', '$modal', 'CrudGridConfiguration',
                function ($scope, $element, $attrs, $upload, crudGridDataFactory, $modal, CrudGridConfiguration) {
                    $scope.objects = [];
                    $scope.lookups = [];
                    $scope.object = {};
                    $scope.columns = "";
                    $scope.actions = "";
                    $scope.addMode = false;
                    $scope.orderBy = { field: 'Name', asc: true };
                    $scope.loading = false;
                    $scope.filter = '';
                    $scope.isUploading = false;
                    $scope.uploadPercent = 0;
                    $scope.dataUrl = "";
                    $scope.useFileUpload = false;
                    $scope.canOpenChildGrid = false;     
                    $scope.tippColumns = "";     

                    $attrs.$observe('table', function (newValue) {
                        $scope.dataUrl = newValue;
                        $scope.getData('');
                        console.log("Table has a new Value " + newValue);
                    });

                    $attrs.$observe('columns', function(newValue) {
                        if(newValue !== undefined && newValue != "")
                        {
                            $scope.columns = angular.fromJson($attrs.columns);
                            $scope.setLookupData();
                        }
                    });

                    $attrs.$observe('actions', function(newValue) {
                        if(newValue !== undefined && newValue != "")
                        {
                            $scope.actions = angular.fromJson($attrs.actions);
                        }
                    });

                    $attrs.$observe('useFileUpload', function(newValue) {
                        $scope.useFileUpload = angular.fromJson($attrs.useFileUpload);
                    });

                    $attrs.$observe('canOpenChildGrid', function(newValue) {
                        $scope.canOpenChildGrid = angular.fromJson($attrs.canOpenChildGrid);
                    });

                    $attrs.$observe('childCols', function(newValue) {
                        console.log("new value childCols " + newValue);
                        $scope.tippColumns = newValue;
                    });

                    $scope.setLookupData = function () {
                        for (var i = 0; i < $scope.columns.length; i++) {
                            (function(i){
                            var c = $scope.columns[i];
                            if (c.lookup && !$scope.hasLookupData(c.lookup.table)) {
                                console.log("get lookup data " + c.lookup.table);
                                crudGridDataFactory(c.lookup.table).query(function (data, responseHeader, type) {
                                    console.log("query success " + $scope.columns[i].lookup.table);
                                    console.log(data);
                                    console.log(responseHeader);
                                    console.log(type);

                                    if(c.lookup)
                                    {
                                        $scope.setIndividualLookupData($scope.columns[i].lookup.table, data);
                                    }
                                }, function(result){
                                    console.log("query failed " + c.lookup.table);
                                });
                            }

                            })(i);

                     
                        }
                    };

                    $scope.resetLookupData = function (table) {
                        $scope.setIndividualLookupData(table, {});
                        $scope.setLookupData();
                    };

                    $scope.getLookupData = function (table) {
                        console.log("getLookupData " + table);
                        console.log($scope.lookups[table.toLowerCase()]);

                        return typeof table == 'undefined' ? null : $scope.lookups[table.toLowerCase()];
                    };

                    $scope.setIndividualLookupData = function (table, data) {
                        $scope.lookups[table.toLowerCase()] = data;
                    };

                    $scope.hasLookupData = function (table) {
                        console.log("hasLookupData " + table);
                        return !$.isEmptyObject($scope.getLookupData(table));
                    };

                    $scope.getLookupValue = function (lookup, key) {
                        var data = $scope.getLookupData(lookup.table);

                        if (typeof data != 'undefined') {
                            for (var i = 0; i < data.length; i++) {
                                if (data[i][lookup.key] === key)
                                    return data[i][lookup.value];
                            }
                        }

                        console.log(data);

                        return '';
                    };

                    $scope.toggleAddMode = function () {
                        $scope.addMode = !$scope.addMode;
                        $scope.object = {};
                    };

                    $scope.toggleEditMode = function (object) {
                        object.editMode = !object.editMode;
                    };

                    var successCallback = function (e, cb) {
                        if($scope.dataUrl)
                        {
                            $scope.$broadcast('lookupDataChange', [$scope.dataUrl]);
                            $scope.getData(cb);
                        }
                    };

                    var successPostCallback = function (e) {
                        successCallback(e, function () {
                            $scope.toggleAddMode();
                        });
                    };

                    $scope.$on('lookupDataChange', function (scope, table) {
                        console.log('lookupdata change');
                        console.log(table);
                        $scope.resetLookupData(table[0]);
                    });

                    var errorCallback = function (e) {
                        notificationFactory.error(e.data.ExceptionMessage);
                    };

                    $scope.addObject = function () {
                        if($scope.dataUrl)
                        {
                            crudGridDataFactory($scope.dataUrl).save($scope.object, successPostCallback, errorCallback);
                        }
                    };

                    $scope.deleteObject = function (object) {
                        if($scope.dataUrl)
                        {
                            $scope.openDeleteDialog(object);
                        }
                    };

                    $scope.openUploadDialog = function(object) {
                          ModalInstanceCtrl.$inject = ['$scope', '$modalInstance', 'url', 'tippColumns'];

                          var modalInstance = $modal.open({
                            templateUrl: 'components/angular-fileupload-grid/dist/Templates/upload-dialog.html',
                            controller: ModalInstanceCtrl,
                            resolve: {
                              url: function () {
                                return $scope.dataUrl + "/" + object.Id + "/files";
                              },
                              tippColumns: function() {
                                console.log("tippColumns");
                                var columns = $scope.tippColumns;
                                return columns;
                              }
                            }
                          });
                    };

                     var DeleteModalInstanceCtrl = function($scope, $modalInstance, id, url) {
                        $scope.Id = id;
                        $scope.Url = url;
                        console.log(url);

                        $scope.delete = function() {
                            crudGridDataFactory(url).delete({ id: $scope.Id }, successCallback, errorCallback);
                            $modalInstance.close();
                        };

                        $scope.cancel = function() {
                            $modalInstance.close();
                        };
                    };

                    $scope.openDeleteDialog = function(object) {
                          console.log(object);
                          console.log($scope.dataUrl);

                          DeleteModalInstanceCtrl.$inject = ['$scope', '$modalInstance', 'id', 'url'];

                          var modalInstance = $modal.open({
                            templateUrl: 'components/angular-fileupload-grid/dist/Templates/delete-dialog.html',
                            controller: DeleteModalInstanceCtrl,
                            resolve: {
                              id : function() {
                                return object.Id;
                              },
                              url : function() {
                                return $scope.dataUrl;
                              }
                            }
                          });
                    };

                    var ModalInstanceCtrl = function ($scope, $modalInstance, url, tippColumns) {
                        $scope.uploadUrl = url;
                        $scope.uploadColumns = tippColumns;
                    };

                    $scope.updateObject = function (object) {
                        if($scope.dataUrl)
                        {
                            crudGridDataFactory($scope.dataUrl).update({ id: object.Id }, object, successCallback, errorCallback);
                        }
                    };

                    $scope.getData = function (cb) {
                        $scope.setLookupData();
                        if($scope.dataUrl)
                        {
                            crudGridDataFactory($scope.dataUrl).query(function (data) {
                                $scope.objects = data;
                                if (cb) cb();
                            });
                        }
                    };

                    $scope.setOrderBy = function (field) {
                        var asc = $scope.orderBy.field === field ? !$scope.orderBy.asc : true;
                        $scope.orderBy = { field: field, asc: asc };
                    };

                    $scope.getData(
                        function () {
                            $scope.setLookupData();
                            $scope.loading = false;
                        });

                    $scope.clickCommand = function(command, object) {
                        console.log("RUN_COMMAND [ " + command + " ] on object [ " + object.Id + " ]");
                        $scope.$emit("RUN_COMMAND", command, object);
                    };

                    $scope.onFileSelect = function ($files) {
                        if($scope.useFileUpload)
                        {
                            $scope.isUploading = true;
                            //$files: an array of files selected, each file has name, size, and type.
                            for (var i = 0; i < $files.length; i++) {
                                var file = $files[i];
                                console.log(file);
                                toastr.info('Uploading ' + file.name + '...');
                                $scope.upload = $upload.upload({
                                    url: CrudGridConfiguration.configuration().urlPrefix + $scope.dataUrl, //upload.php script, node.js route, or servlet url
                                    method: 'POST',
                                    // headers: {'headerKey': 'headerValue'}, withCredential: true,
                                    //data: { Name: $scope.object['Name']},
                                    file: file,
                                    // file: $files, //upload multiple files, this feature only works in HTML5 FromData browsers
                                    /* set file formData name for 'Content-Desposition' header. Default: 'file' */
                                    //fileFormDataName: myFile,
                                    /* customize how data is added to formData. See #40#issuecomment-28612000 for example */
                                    //formDataAppender: function(formData, key, val){} 
                                }).progress(function (evt) {
                                    console.log(evt);
                                    console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                                    $scope.uploadPercent = parseInt(100.0 * evt.loaded / evt.total);
                                    toastr.info($scope.uploadPercent + "%");
                                }).success(function (data, status, headers, config) {
                                    $scope.isUploading = false;
                                    $scope.object['Url'] = data;
                                    $scope.getData();
                                    toastr.success("File " + data + " was uploaded successfully.");
                                });
                                //.error(...)
                                //.then(success, error, progress); 
                            }
                        }
                    };
                }]
        };
    });



    angularFileUploadGrid.directive('modelChangeBlur', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, elm, attr, ngModelCtrl) {
                if (attr.type === 'radio' || attr.type === 'checkbox') return;

                elm.unbind('input').unbind('keydown').unbind('change');
                elm.bind('blur', function () {
                    scope.$apply(function () {
                        ngModelCtrl.$setViewValue(elm.val());
                    });
                });
            }
        };
    });

    angularFileUploadGrid.factory('crudGridDataFactory', ['$http', '$resource', 'CrudGridConfiguration', function ($http, $resource, CrudGridConfiguration) {
        return function (type) {
            console.log("loading " + type);
            console.log("loading " + CrudGridConfiguration.configuration().urlPrefix + type);
            return $resource(CrudGridConfiguration.configuration().urlPrefix + type + '/:id', { id: '@id' }, { 'update': { method: 'PUT' } }, { 'query': { method: 'GET', isArray: true } }, type);
        };
    }]);
})();