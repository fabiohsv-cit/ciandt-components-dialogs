"use strict";

(function (factory) {
    if (typeof define === 'function') {
        define(["angular"], factory);
    } else {
        if (typeof module !== "undefined" && typeof exports !== "undefined" && module.exports === exports){
            module.exports = 'jedi.dialogs.ctrls';
        }
        return factory();
    }
}(function() {

    angular.module('jedi.dialogs.ctrls', []).controller("jedi.dialogs.AlertCtrl", ["$scope", "$modalInstance", "items", function ($scope, $modalInstance, items) {
        $scope.items = items;
        $scope.ok = function () {
            $modalInstance.close();
        };
    }]).controller("jedi.dialogs.ConfirmCtrl", ["$scope", "$modalInstance", "message", function ($scope, $modalInstance, message, onOk, onCancel) {
        $scope.message = message;
        $scope.ok = function () {
            $modalInstance.close();
        };
    }]);

}));