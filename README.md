# ciandt-components-dialogs
Dialogs component written in angularjs.

### Install

* Install the dependency:

   ```shell
   bower install ciandt-components-dialogs --save
   ```
* Add dialogs.js and dialogs-ctrls.js to your code:

   ```html
   <script src='assets/libs/ciandt-components-dialogs/dialogs.js'></script>
   <script src='assets/libs/ciandt-components-dialogs/dialogs-ctrls.js'></script>
   ```
   - note that the base directory used was assets/libs, you should change bower_components to assets/libs or move from bower_components to assets/libs with grunt.
* Include module dependency:

   ```javascript
   angular.module('yourApp', ['ciandt.components.dialogs']);
   ```
======

### How To Use

1. **If necessary, to customize the default template, you should change template url in constant object ciandt.components.dialogs.DialogsConfig**

   ```javascript
   app.config(['ciandt.components.dialogs.DialogsConfig', function(DialogsConfig){
      DialogsConfig.templateUrlAlert = "app/common/components/dialogs/dialogs-alert.html";
      DialogsConfig.templateUrlConfirm = "app/common/components/dialogs/dialogs-confirm.html";
   }]);
   ```
   - default templates are stored in ciandt-components-dialogs/dialogs-alert.html and ciandt-components-dialogs/dialogs-confirm.html
2. **Confirmation dialog**

   ```javascript
   app.controller('yourController', ['ciandt.components.dialogs.AlertHelper', function(AlertHelper){
      .
      .
      AlertHelper.confirm('Your confirmation message', function(){
		// yes event
	  }, function(){
		// no event
	  });
      .
      .
   }]);
   ```
3. **Alert dialog**

   ```javascript
   app.controller('yourController', ['ciandt.components.dialogs.AlertHelper', function(AlertHelper){
      .
      .
      AlertHelper.addInfo('Your info message'); // bootstrap class text-info
	  AlertHelper.addError('Your error message'); // bootstrap class text-danger
	  AlertHelper.addWarn('Your warn message'); // bootstrap class text-dangerwarning
      .
      .
   }]);
   ```
4. **Custom modal dialog**

   ```javascript
   app.controller('yourController', ['ciandt.components.dialogs.ModalHelper', function(ModalHelper){
      .
      .
      ModalHelper.open('yourModal.html', 'yourControllerName', { param1: value1, param2: value2 }, function () {
         // success event closing
      }, function () {
         // fail event closing
      }, { size: 'lg' });// last param is the $modal.options
      .
      .
   }]);
   ```
   - the second param ('yourControllerName') can also be an array injection with the controller function.
   - the third param is an object that represents specified input parameters to open your modal.