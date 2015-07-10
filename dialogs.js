'use strict';

define(['ciandt-components-dialogs-ctrls'], function () {

    angular.module('ciandt.components.dialogs', ['ciandt.components.dialogs.ctrls']);

    angular.module('ciandt.components.dialogs').constant('ciandt.components.dialogs.DialogsConfig', {
        templateUrlAlert: "app/common/components/dialogs/dialogs-alert.html",
        templateUrlConfirm: "app/common/components/dialogs/dialogs-confirm.html"
    }).factory('ciandt.components.dialogs.AlertHelper', ['$injector', 'ciandt.components.dialogs.DialogsConfig', function ($injector, DialogsConfig) {
        var $modal = $injector.get('$modal');

        function showMessages(messages) {
            $modal.open({
                templateUrl: DialogsConfig.templateUrlAlert,
                controller: "ciandt.components.dialogs.AlertCtrl",
                windowClass: 'alert-modal-window',
                resolve: {
                    items: function () {
                        return messages;
                    }
                }
            });
        }

        return {
            confirm: function (message, onOk, onCancel) {
                $modal.open({
                    templateUrl: DialogsConfig.templateUrlConfirm,
                    controller: "ciandt.components.dialogs.ConfirmCtrl",
                    backdrop: 'static',
                    keyboard: false,
                    windowClass: 'alert-modal-window',
                    resolve: {
                        'message': function () {
                            return message;
                        },
                        'onOk': function () {
                            return onOk;
                        },
                        'onCancel': function () {
                            return onCancel;
                        }
                    }
                }).result.then(onOk, onCancel);
            },
            addMessages: function (messages, type) {
                var _messages = [];
                if (angular.isArray(messages)) {
                    angular.forEach(messages, function (value) {
                        _messages.push({ 'message': value, 'type': type });
                    });
                } else {
                    _messages.push({ 'message': messages, 'type': type });
                }
                showMessages(_messages);
            },
            addInfo: function (message) {
                this.addMessages(message, 'text-info');
            },
            addError: function (message) {
                this.addMessages(message, 'text-danger');
            },
            addWarn: function (message) {
                this.addMessages(message, 'text-dangerwarning');
            }
        };
    }]).factory('ciandt.components.dialogs.ModalHelper', ['$injector', function ($injector) {
        var $modal = $injector.get('$modal');

        return {
            open: function (templateUrl, controller, resolve, onOk, onCancel, options) {
                var _resolver = {};
                angular.forEach(resolve, function (value, key) {
                    if (typeof value !== 'function') {
                        _resolver[key] = function () {
                            return value;
                        };
                    } else {
                        _resolver[key] = value;
                    }
                });

                var controllerAs = !_.isArray(controller) ? controller.split(/[. ]+/).pop() : undefined;
                if (controllerAs) {
                    controllerAs = controllerAs.charAt(0).toLowerCase() + controllerAs.slice(1);
                }

                var _options = {
                    'templateUrl': templateUrl,
                    'controller': controller,
                    'controllerAs': controllerAs,
                    'backdrop': 'static',
                    'resolve': _resolver
                };

                if (options) {
                    options = angular.extend(options, _options);
                } else {
                    options = _options;
                }

                var instance = $modal.open(options);

                instance.result.then(onOk, onCancel);

                return instance;
            }
        };
    }]);

});