'use strict';

define(['ciandt-components-dialogs-ctrls'], function () {

    angular.module('ciandt.components.dialogs', ['ciandt.components.dialogs.ctrls']);

    angular.module('ciandt.components.dialogs').constant('ciandt.components.dialogs.DialogsConfig', {
        templateUrlAlert: "assets/libs/ciandt-components-dialogs/dialogs-alert.html",
        templateUrlConfirm: "assets/libs/ciandt-components-dialogs/dialogs-confirm.html"
    }).factory('ciandt.components.dialogs.AlertHelper', ['$injector', 'ciandt.components.dialogs.DialogsConfig', function ($injector, DialogsConfig) {
        var $modal = $injector.get('$modal');
        var modalMessages = [];

        function showMessages(messages) {

            if (modalMessages.length == 0) {
                $modal.open({
                    templateUrl: DialogsConfig.templateUrlAlert,
                    controller: "ciandt.components.dialogs.AlertCtrl",
                    windowClass: 'alert-modal-window',
                    resolve: {
                        items: function () {
                            return modalMessages;
                        }
                    }
                }).result.then(cleanMessages, cleanMessages);
            };

            angular.forEach(messages, function (newItem, newItemIndex) {
                var exists = false;

                angular.forEach(modalMessages, function (modalItem, modalItemIndex) {
                    if (newItem.message == modalItem.message) {
                        exists = true
                        return;
                    };
                });

                if (!exists)
                    modalMessages.push(newItem);
            });
        };

        function cleanMessages() {
            modalMessages = [];
        };

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
            open: function (templateUrl) {
				var controller, resolve, onOk, onCancel, options;
				var i=0;
				
				if (arguments.length > 1 && (typeof arguments[1] == 'string' || _.isArray(arguments[1]))) {
					controller = arguments[1];
					i++;
				}
				
				if (arguments.length > 1+i && (typeof arguments[i+1] == 'undefined' || typeof arguments[i+1] == 'object')) {
					resolve = arguments[i+1];
					i++;
				}
				
				if (arguments.length > 1+i && typeof arguments[i+1] == 'function') {
					onOk = arguments[i+1];
					i++;
				}
				
				if (arguments.length > 1+i && typeof arguments[i+1] == 'function') {
					onCancel = arguments[i+1];
					i++;
				}
				
				if (arguments.length > 1+i) {
					options = arguments[i+1];
				}
				
				var _argsCtrl = ['$scope'];
                var _resolver = {};
                angular.forEach(resolve, function (value, key) {
                    _argsCtrl.push(key);
					if (typeof value !== 'function') {
                        _resolver[key] = function () {
                            return value;
                        };
                    } else {
                        _resolver[key] = value;
                    }
                });

				if (!controller && resolve) {
					// cria controller temporário para expor resolve no scopo
					_argsCtrl.push(function ($scope) {
						var _args = arguments;
						var index=1;
						angular.forEach(resolve, function (value, key) {
							$scope[key] = _args[index];
							index++;
						});
					});
					controller = _argsCtrl;
				}

                var controllerAs = controller && !_.isArray(controller) ? controller.split(/[. ]+/).pop() : undefined;
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