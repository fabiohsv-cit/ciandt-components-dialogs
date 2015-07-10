"use strict";

define(['angular'], function(){
    angular.module('ciandt.components.dialogs.ctrls', []).controller("ciandt.components.dialogs.AlertCtrl", ["$scope", "$modalInstance", "items", function ($scope, $modalInstance, items) {
        $scope.items = items;
        $scope.ok = function () {
            $modalInstance.close();
        };
    }]).controller("ciandt.components.dialogs.ConfirmCtrl", ["$scope", "$modalInstance", "message", function ($scope, $modalInstance, message, onOk, onCancel) {
        $scope.message = message;
        $scope.ok = function () {
            $modalInstance.close();
        };
    }]);
});