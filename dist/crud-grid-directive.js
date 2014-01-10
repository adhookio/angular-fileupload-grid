app.directive('crudGrid', function () {
    return {
        restrict: 'A',
        replace: false,
        scope: true,
        templateUrl: '/app/scripts/Directives/Templates/crud-grid-directive-template.html',
        controller: ['$scope', '$element', '$attrs', '$upload', 'crudGridDataFactory', 'notificationFactory',
            function ($scope, $element, $attrs, $upload, crudGridDataFactory, notificationFactory) {
                $scope.objects = [];
                $scope.lookups = [];
                $scope.object = {};
                $scope.columns = angular.fromJson($attrs.columns);
                $scope.addMode = false;
                $scope.orderBy = { field: 'Name', asc: true };
                $scope.loading = true;
                $scope.filter = '';
                $scope.isUploading = false;
                $scope.uploadPercent = 0;
                console.log("directive loaded");

                var $docScope = angular.element(document).scope();

                $scope.setLookupData = function () {
                    for (var i = 0; i < $scope.columns.length; i++) {
                        var c = $scope.columns[i];
                        if (c.lookup && !$scope.hasLookupData(c.lookup.table)) {
                            crudGridDataFactory(c.lookup.table).query(function (data) {
                                $scope.setIndividualLookupData(c.lookup.table, data);
                            });
                        }
                    }
                };

                $scope.resetLookupData = function(table) {
                    $scope.setIndividualLookupData(table, {});
                    $scope.setLookupData();
                };

                $scope.getLookupData = function (table) {
                    return typeof table == 'undefined' ? null : $scope.lookups[table.toLowerCase()];
                };

                $scope.setIndividualLookupData = function (table, data) {
                    $scope.lookups[table.toLowerCase()] = data;
                };

                $scope.hasLookupData = function (table) {                    
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

                    return '';
                };

                $scope.toggleAddMode = function () {
                    console.log("Add Mode");
                    $scope.addMode = !$scope.addMode;
                    $scope.object = {};
                };

                $scope.toggleEditMode = function (object) {
                    object.editMode = !object.editMode;
                };

                var successCallback = function (e, cb) {
                    //notificationFactory.success();
                    $docScope.$broadcast('lookupDataChange', [$attrs.table]);
                    $scope.getData(cb);
                };

                var successPostCallback = function (e) {
                    successCallback(e, function () {
                        $scope.toggleAddMode();
                    });
                };

                $scope.$on('lookupDataChange', function (scope, table) {
                    $scope.resetLookupData(table[0]);
                });

                var errorCallback = function (e) {
                    notificationFactory.error(e.data.ExceptionMessage);
                };

                $scope.addObject = function () {
                    console.log('add object url: ' + $scope.object['Url']);
                    crudGridDataFactory($attrs.table).save($scope.object, successPostCallback, errorCallback);
                };

                $scope.deleteObject = function (object) {
                    crudGridDataFactory($attrs.table).delete({ id: object.Id }, successCallback, errorCallback);
                };

                $scope.updateObject = function (object) {
                    console.log(object.Name);
                    crudGridDataFactory($attrs.table).update({ id: object.Id }, object, successCallback, errorCallback);
                };

                $scope.getData = function (cb) {

                    crudGridDataFactory($attrs.table).query(function (data) {
                        $scope.objects = data;
                        if (cb) cb();
                    });
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

                $scope.onFileSelect = function ($files) {
                    console.log("File Upload");
                    $scope.isUploading = true;
                    //$files: an array of files selected, each file has name, size, and type.
                    for (var i = 0; i < $files.length; i++) {
                        var file = $files[i];
                        $scope.upload = $upload.upload({
                            url: 'upload', //upload.php script, node.js route, or servlet url
                            method: 'POST',
                            // headers: {'headerKey': 'headerValue'}, withCredential: true,
                            //data: { Name: $scope.object['Name']},
                            file: file,
                            // file: $files, //upload multiple files, this feature only works in HTML5 FromData browsers
                            /* set file formData name for 'Content-Desposition' header. Default: 'file' */
                            //fileFormDataName: myFile,
                            /* customize how data is added to formData. See #40#issuecomment-28612000 for example */
                            //formDataAppender: function(formData, key, val){} 
                        }).progress(function(evt) {
                            console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                            $scope.uploadPercent = parseInt(100.0 * evt.loaded / evt.total);
                        }).success(function (data, status, headers, config) {
                            $scope.isUploading = false;
                            // file is uploaded successfully
                  
                            $scope.object['Url'] = data;
                            $scope.addObject();
                            $scope.getData('');
                            $scope.toggleAddMode();
                            notificationFactory.success("File " + data + " was uploaded successfully.");
                            //console.log($scope.object['Upload']);
                        });
                        //.error(...)
                        //.then(success, error, progress); 
                    }
                };
            }]
    };
});