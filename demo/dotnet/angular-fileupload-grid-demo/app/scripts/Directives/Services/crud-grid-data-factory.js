app.factory('crudGridDataFactory', ['$http', '$resource', function ($http, $resource) {
    return function (type) {
        return $resource('/' + type + '/:id', { id: '@id' }, { 'update': { method: 'PUT' } }, { 'query': { method: 'GET', isArray: false } });
    };
}]);