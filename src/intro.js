(function (factory) {
    if (typeof define === 'function') {
        define(["angular", 'ng-jedi-layout-impl'], factory);
    } else {
        if (typeof module !== "undefined" && typeof exports !== "undefined" && module.exports === exports){
            module.exports = 'jedi.dialogs';
        }
        return factory();
    }
}(function() {
	"use strict";
