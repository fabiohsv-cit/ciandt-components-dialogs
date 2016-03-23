    angular.module('jedi.dialogs', []);

    angular.module('jedi.dialogs').constant('jedi.dialogs.DialogsConfig', {
        templateUrlAlert: "assets/libs/ng-jedi-dialogs/dialogs-alert.html",
        templateUrlConfirm: "assets/libs/ng-jedi-dialogs/dialogs-confirm.html",
        applyJdi18nToast: true,
        alertTitle: 'Attention!',
        confirmTitle: 'Attention!',
        alertOkLabel: 'Ok',
        confirmYesLabel: 'Yes',
        confirmNoLabel: 'No',
        uiImplementation: {
            bootstrap: {
                alert: '<div jd-modal jd-title="{{alertTitle}}">' +
                '    <ul class="alert-message">' +
                '        <li class="{{ item.type }}" ng-repeat="item in items" jd-i18n>{{ item.message }}</li>' +
                '    </ul>' +
                '    <div class="modal-footer">' +
                '        <button class="btn btn-primary" ng-click="ok()" jd-i18n>{{ alertOkLabel }}</button>' +
                '    </div>' +
                '</div>',
                confirm: '<div jd-modal jd-title="{{confirmTitle}}" jd-hide-close-btn>' +
                '    <p class="text-info alert-message" jd-i18n>{{message}}</p>' +
                '    <div class="modal-footer">' +
                '        <button class="btn btn-primary" ng-click="ok()" jd-i18n>{{ confirmYesLabel }}</button>' +
                '        <button class="btn btn-primary" jd-dismiss-modal jd-i18n>{{ confirmNoLabel }}</button>' +
                '    </div>' +
                '</div>'
            },
            materialize: {
                alert: '<div id="modal1" class="modal">' +
                '           <div class="modal-content">' +
                '               <h4 jd-i18n>{{alertTitle}}</h4>' +
                '               <p class="{{ item.type }}" ng-repeat="item in items" jd-i18n>{{ item.message }}</p>' +
                '           </div>' +
                '           <div class="modal-footer">' +
                '               <a ng-click="ok()" class=" modal-action modal-close waves-effect waves-green btn-flat" jd-i18n>{{ alertOkLabel }}</a>' +
                '           </div>' +
                '       </div>',
                confirm: '<div id="modal1" class="modal modal-fixed-footer">' +
                '           <div class="modal-content">' +
                '               <h4 jd-i18n>{{confirmTitle}}</h4>' +
                '               <p jd-i18n>{{ message }}</p>' +
                '           </div>' +
                '           <div class="modal-footer">' +
                '               <a ng-click="ok()" jd-i18n class=" modal-action modal-close waves-effect waves-green btn-flat">{{ confirmYesLabel }}</a>' +
                '               <a jd-dismiss-modal jd-i18n class="modal-action modal-close waves-effect waves-red btn-flat">{{ confirmNoLabel }}</a>' +
                '           </div>' +
                '       </div>'
            }
        }
    }).factory('$$materializeStackedMap', function () {
        return {
            createNew: function () {
                var stack = [];

                return {
                    add: function (key, value) {
                        stack.push({
                            key: key,
                            value: value
                        });
                    },
                    get: function (key) {
                        for (var i = 0; i < stack.length; i++) {
                            if (key == stack[i].key) {
                                return stack[i];
                            }
                        }
                    },
                    keys: function () {
                        var keys = [];
                        for (var i = 0; i < stack.length; i++) {
                            keys.push(stack[i].key);
                        }
                        return keys;
                    },
                    top: function () {
                        return stack[stack.length - 1];
                    },
                    remove: function (key) {
                        var idx = -1;
                        for (var i = 0; i < stack.length; i++) {
                            if (key == stack[i].key) {
                                idx = i;
                                break;
                            }
                        }
                        return stack.splice(idx, 1)[0];
                    },
                    removeTop: function () {
                        return stack.splice(stack.length - 1, 1)[0];
                    },
                    length: function () {
                        return stack.length;
                    }
                };
            }
        };
    }).factory('$materializeModalStack', ['$timeout', '$document', '$compile', '$rootScope', '$$materializeStackedMap',
        function ($timeout, $document, $compile, $rootScope, $$stackedMap) {

            var OPENED_MODAL_CLASS = 'modal-open';

            var openedWindows = $$stackedMap.createNew();
            var $modalStack = {};

            function removeModalWindow(modalInstance) {

                var body = $document.find('body').eq(0);
                var modalWindow = openedWindows.get(modalInstance).value;

                //clean up the stack
                openedWindows.remove(modalInstance);

                //remove window DOM element
                removeAfterAnimate(modalWindow.modalDomEl, modalWindow.modalScope, 300, function () {
                    modalWindow.modalScope.$destroy();
                    body.toggleClass(OPENED_MODAL_CLASS, openedWindows.length() > 0);
                });
            }

            function removeAfterAnimate(domEl, scope, emulateTime, done) {
                // Closing animation
                scope.animate = false;

                afterAnimating();

                function afterAnimating() {
                    if (afterAnimating.done) {
                        return;
                    }
                    afterAnimating.done = true;

                    domEl.closeModal();
                    if (done) {
                        done();
                    }
                }
            }

            $document.bind('keydown', function (evt) {
                var modal;

                if (evt.which === 27) {
                    modal = openedWindows.top();
                    if (modal && modal.value.keyboard) {
                        evt.preventDefault();
                        $rootScope.$apply(function () {
                            $modalStack.dismiss(modal.key, 'escape key press');
                        });
                    }
                }
            });

            $modalStack.open = function (modalInstance, modal) {

                openedWindows.add(modalInstance, {
                    deferred: modal.deferred,
                    modalScope: modal.scope,
                    backdrop: modal.backdrop,
                    keyboard: modal.keyboard
                });

                var body = $document.find('body').eq(0);

                var content = modal.content.trim();
                var angularDomEl = angular.element(content);

                var modalDomEl = $compile(angularDomEl)(modal.scope);
                openedWindows.top().value.modalDomEl = modalDomEl;
                body.append(modalDomEl);
                modalDomEl.openModal({
                    dismissable: modal.keyboard,
                    complete: function() {
                        modalDomEl.remove();
                        modalInstance.dismiss();
                    }
                });
                body.addClass(OPENED_MODAL_CLASS);
            };

            $modalStack.close = function (modalInstance, result) {
                var modalWindow = openedWindows.get(modalInstance);
                if (modalWindow) {
                    modalWindow.value.deferred.resolve(result);
                    removeModalWindow(modalInstance);
                }
            };

            $modalStack.dismiss = function (modalInstance, reason) {
                var modalWindow = openedWindows.get(modalInstance);
                if (modalWindow) {
                    modalWindow.value.deferred.reject(reason);
                    removeModalWindow(modalInstance);
                }
            };

            $modalStack.dismissAll = function (reason) {
                var topModal = this.getTop();
                while (topModal) {
                    this.dismiss(topModal.key, reason);
                    topModal = this.getTop();
                }
            };

            $modalStack.getTop = function () {
                return openedWindows.top();
            };

            return $modalStack;
        }])

        .provider('$materializeModal', function () {

            var $modalProvider = {
                options: {
                    backdrop: true, //can be also false or 'static'
                    keyboard: true
                },
                $get: ['$injector', '$rootScope', '$q', '$http', '$templateCache', '$controller', '$materializeModalStack',
                    function ($injector, $rootScope, $q, $http, $templateCache, $controller, $modalStack) {

                        var $modal = {};

                        function getTemplatePromise(options) {
                            return options.template ? $q.when(options.template) :
                                $http.get(angular.isFunction(options.templateUrl) ? (options.templateUrl)() : options.templateUrl,
                                    { cache: $templateCache }).then(function (result) {
                                        return result.data;
                                    });
                        }

                        function getResolvePromises(resolves) {
                            var promisesArr = [];
                            angular.forEach(resolves, function (value) {
                                if (angular.isFunction(value) || angular.isArray(value)) {
                                    promisesArr.push($q.when($injector.invoke(value)));
                                }
                            });
                            return promisesArr;
                        }

                        $modal.open = function (modalOptions) {

                            var modalResultDeferred = $q.defer();
                            var modalOpenedDeferred = $q.defer();

                            //prepare an instance of a modal to be injected into controllers and returned to a caller
                            var modalInstance = {
                                result: modalResultDeferred.promise,
                                opened: modalOpenedDeferred.promise,
                                close: function (result) {
                                    $modalStack.close(modalInstance, result);
                                },
                                dismiss: function (reason) {
                                    $modalStack.dismiss(modalInstance, reason);
                                }
                            };

                            //merge and clean up options
                            modalOptions = angular.extend({}, $modalProvider.options, modalOptions);
                            modalOptions.resolve = modalOptions.resolve || {};

                            //verify options
                            if (!modalOptions.template && !modalOptions.templateUrl) {
                                throw new Error('One of template or templateUrl options is required.');
                            }

                            var templateAndResolvePromise =
                                $q.all([getTemplatePromise(modalOptions)].concat(getResolvePromises(modalOptions.resolve)));


                            templateAndResolvePromise.then(function resolveSuccess(tplAndVars) {

                                var modalScope = (modalOptions.scope || $rootScope).$new();
                                modalScope.$close = modalInstance.close;
                                modalScope.$dismiss = modalInstance.dismiss;

                                var ctrlInstance, ctrlLocals = {};
                                var resolveIter = 1;

                                //controllers
                                if (modalOptions.controller) {
                                    ctrlLocals.$scope = modalScope;
                                    ctrlLocals.$modalInstance = modalInstance;
                                    angular.forEach(modalOptions.resolve, function (value, key) {
                                        ctrlLocals[key] = tplAndVars[resolveIter++];
                                    });

                                    ctrlInstance = $controller(modalOptions.controller, ctrlLocals);
                                    if (modalOptions.controllerAs) {
                                        modalScope[modalOptions.controllerAs] = ctrlInstance;
                                    }
                                }

                                $modalStack.open(modalInstance, {
                                    scope: modalScope,
                                    deferred: modalResultDeferred,
                                    content: tplAndVars[0],
                                    backdrop: modalOptions.backdrop,
                                    keyboard: modalOptions.keyboard,
                                    backdropClass: modalOptions.backdropClass,
                                    windowClass: modalOptions.windowClass,
                                    windowTemplateUrl: modalOptions.windowTemplateUrl,
                                    size: modalOptions.size
                                });

                            }, function resolveError(reason) {
                                modalResultDeferred.reject(reason);
                            });

                            templateAndResolvePromise.then(function () {
                                modalOpenedDeferred.resolve(true);
                            }, function () {
                                modalOpenedDeferred.reject(false);
                            });

                            return modalInstance;
                        };

                        return $modal;
                    }]
            };

            return $modalProvider;
        }).controller("jedi.dialogs.AlertCtrl", ["$scope", "$modalInstance", "jedi.dialogs.DialogsConfig", "items", function ($scope, $modalInstance, DialogsConfig, items) {
            $scope.items = items;
            $scope.alertTitle = DialogsConfig.alertTitle;
            $scope.alertOkLabel = DialogsConfig.alertOkLabel;
            $scope.ok = function () {
                $modalInstance.close();
            };
        }]).controller("jedi.dialogs.ConfirmCtrl", ["$scope", "$modalInstance", "jedi.dialogs.DialogsConfig", "message", function ($scope, $modalInstance, DialogsConfig, message, onOk, onCancel) {
            $scope.message = message;
            $scope.confirmTitle = DialogsConfig.confirmTitle;
            $scope.confirmYesLabel = DialogsConfig.confirmYesLabel;
            $scope.confirmNoLabel = DialogsConfig.confirmNoLabel;
            $scope.ok = function () {
                $modalInstance.close();
            };
        }]).factory('jedi.dialogs.AlertHelper', ['$injector', 'jedi.dialogs.DialogsConfig', function ($injector, DialogsConfig) {
            var modalHelper = $injector.get('jedi.dialogs.ModalHelper');
            var modalMessages = [];
            var modalMessagesInstance;
            var modalConfirmInstance;

            function showMessages(messages) {

                if (modalMessages.length == 0) {
                    modalMessagesInstance = modalHelper.open(DialogsConfig.templateUrlAlert, undefined, undefined, undefined, {
                        controller: "jedi.dialogs.AlertCtrl",
                        windowClass: 'alert-modal-window',
                        resolve: {
                            items: function () {
                                return modalMessages;
                            }
                        }
                    });
                    modalMessagesInstance.result.then(cleanMessages, cleanMessages);
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
                modalMessagesInstance = null;
            };

            return {
                confirm: function (message, onOk, onCancel) {
                    modalConfirmInstance = modalHelper.open(DialogsConfig.templateUrlConfirm, undefined, undefined, undefined, {
                        controller: "jedi.dialogs.ConfirmCtrl",
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
                    });
                    modalConfirmInstance.result.then(function () {
                        modalConfirmInstance = null;
                        if (onOk) {
                            onOk();
                        }
                    }, function () {
                        modalConfirmInstance = null;
                        if (onCancel) {
                            onCancel();
                        }
                    });
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
                    if (typeof message == 'string') {
                        this.addMessages(message, 'text-info');
                    } else {
                        showMessages(message);
                    }
                },
                addError: function (message) {
                    if (typeof message == 'string') {
                        this.addMessages(message, 'text-danger');
                    } else {
                        showMessages(message);
                    }
                },
                addWarn: function (message) {
                    if (typeof message == 'string') {
                        this.addMessages(message, 'text-dangerwarning');
                    } else {
                        showMessages(message);
                    }
                },
                close: function () {
                    if (modalMessagesInstance) {
                        modalMessagesInstance.close();
                    }
                    if (modalConfirmInstance) {
                        modalConfirmInstance.close();
                    }
                }
            };
        }]).factory('jedi.dialogs.Modal', ['$injector', function ($injector) {
            /**
             * Simple wrapper
             */
            function Modal(options) {
                var $modal = $injector.get('$materializeModal');

                this.instance = $modal.open(options);

                this.result = this.instance.result;
            }

            Modal.prototype.open = function () {
                return this.instance.open.apply(this.instance.open, arguments);
            };

            Modal.prototype.close = function () {
                return this.instance.close.apply(this.instance.close, arguments);
            };

            Modal.prototype.dismiss = function () {
                return this.instance.dismiss.apply(this.instance.dismiss, arguments);
            };

            return Modal;
        }]).factory('jedi.dialogs.ModalHelper', ['jedi.dialogs.Modal', '$injector', '$log', function (Modal, $injector, $log) {
            var instances = [];
            var DESTROY_EVT = 'destroy';

            return {
                open: function (templateUrl) {
                    var controller, resolve, onOk, onCancel, options;
                    var i = 0;

                    if (arguments.length > 1 && (typeof arguments[1] == 'string' || _.isArray(arguments[1]))) {
                        controller = arguments[1];
                        i++;
                    }

                    if (arguments.length > 1 + i && (typeof arguments[i + 1] == 'undefined' || typeof arguments[i + 1] == 'object')) {
                        resolve = arguments[i + 1];
                        i++;
                    }

                    if (arguments.length > 1 + i && (typeof arguments[i + 1] == 'undefined' || typeof arguments[i + 1] == 'function')) {
                        onOk = arguments[i + 1];
                        i++;
                    }

                    if (arguments.length > 1 + i && (typeof arguments[i + 1] == 'undefined' || typeof arguments[i + 1] == 'function')) {
                        onCancel = arguments[i + 1];
                        i++;
                    }

                    if (arguments.length > 1 + i) {
                        options = arguments[i + 1];
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
                        // cria controller tempor�rio para expor resolve no scopo
                        _argsCtrl.push(function ($scope) {
                            var _args = arguments;
                            var index = 1;
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
                        options = angular.extend(_options, options);
                    } else {
                        options = _options;
                    }

                    var instance = new Modal(options);
                    instances.push(instance);

                    instance.result.then(function () {
                        instances = _.filter(instances, function (item) {
                            return item !== instance;
                        });
                        if (onOk && !(arguments.length == 1 && arguments[0] === DESTROY_EVT)) {
                            onOk.apply(onOk, arguments);
                        }
                    }, function () {
                        instances = _.filter(instances, function (item) {
                            return item !== instance;
                        });
                        if (onCancel && !(arguments.length == 1 && arguments[0] === DESTROY_EVT)) {
                            onCancel.apply(onCancel, arguments);
                        }
                    });

                    return instance;
                },
                closeAll: function () {
                    angular.forEach(instances, function (instance) {
                        instance.dismiss(DESTROY_EVT);
                    });
                }
            };
        }]).run(['$templateCache', 'jedi.dialogs.DialogsConfig', 'jedi.layout.LayoutConfig', function ($templateCache, DialogsConfig, LayoutConfig) {
            if (DialogsConfig.applyJdi18nToast) {
                $templateCache.put('directives/toast/toast.html', "<div class=\"{{toastClass}} {{toastType}}\" ng-click=\"tapToast()\">\n  <div ng-switch on=\"allowHtml\">\n    <div ng-switch-default ng-if=\"title\" class=\"{{titleClass}}\" jd-i18n>{{title}}</div>\n    <div ng-switch-default class=\"{{messageClass}}\" jd-i18n>{{message}}</div>\n    <div ng-switch-when=\"true\" ng-if=\"title\" class=\"{{titleClass}}\" ng-bind-html=\"title\"></div>\n    <div ng-switch-when=\"true\" class=\"{{messageClass}}\" ng-bind-html=\"message\"></div>\n  </div>\n  <progress-bar ng-if=\"progressBar\"></progress-bar>\n</div>\n");
            }

            $templateCache.put('assets/libs/ng-jedi-dialogs/dialogs-alert.html', DialogsConfig.uiImplementation[LayoutConfig.defaultUiImpl].alert);
            $templateCache.put('assets/libs/ng-jedi-dialogs/dialogs-confirm.html', DialogsConfig.uiImplementation[LayoutConfig.defaultUiImpl].confirm);
        }]);