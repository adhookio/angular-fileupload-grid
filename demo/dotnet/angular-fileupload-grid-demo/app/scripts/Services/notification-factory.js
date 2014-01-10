app.factory('notificationFactory', function () {
    return {
        success: function (text) {
            toastr.success(text);
        },
        error: function (text) {
            toastr.error(text, "Error");
        }
    };
});