(function (modules) {
	// 缓存加载模块
	var installedModules = {};

	// webpack require 函数
	function __webpack_require__(moduleId) {
		// 检查模块是否已被加载
		if (installedModules[moduleId]) {
			return installedModules[moduleId].exports;
		}
		// 创建一个新模块，并记录模块到缓存
		var module = (installedModules[moduleId] = {
			i: moduleId,
			l: false,
			exports: {}
		});

		// 执行模块代码
		modules[moduleId].call(
			module.exports,
			module,
			module.exports,
			__webpack_require__
		);

		// Flag the module as loaded
		module.l = true;

		// Return the exports of the module
		return module.exports;
	}

	// 所有模块
	__webpack_require__.m = modules;

	// 缓存模块
	__webpack_require__.c = installedModules;

	// define getter function for harmony exports
	__webpack_require__.d = function (exports, name, getter) {
		if (!__webpack_require__.o(exports, name)) {
			Object.defineProperty(exports, name, {
				enumerable: true,
				get: getter
			});
		}
	};

	// 模块定义 __esModule 属性
	__webpack_require__.r = function (exports) {
		if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
			Object.defineProperty(exports, Symbol.toStringTag, {
				value: "Module"
			});
		}
		Object.defineProperty(exports, "__esModule", { value: true });
	};

	// create a fake namespace object
	// mode & 1: value is a module id, require it
	// mode & 2: merge all properties of value into the ns
	// mode & 4: return value when already ns object
	// mode & 8|1: behave like require
	__webpack_require__.t = function (value, mode) {
		if (mode & 1) value = __webpack_require__(value);
		if (mode & 8) return value;
		if (mode & 4 && typeof value === "object" && value && value.__esModule)
			return value;
		var ns = Object.create(null);
		__webpack_require__.r(ns);
		Object.defineProperty(ns, "default", {
			enumerable: true,
			value: value
		});
		if (mode & 2 && typeof value != "string")
			for (var key in value)
				__webpack_require__.d(
					ns,
					key,
					function (key) {
						return value[key];
					}.bind(null, key)
				);
		return ns;
	};

	// getDefaultExport function for compatibility with non-harmony modules
	__webpack_require__.n = function (module) {
		var getter =
			module && module.__esModule
				? function getDefault() {
						return module["default"];
				  }
				: function getModuleExports() {
						return module;
				  };
		__webpack_require__.d(getter, "a", getter);
		return getter;
	};

	// Object.prototype.hasOwnProperty.call
	__webpack_require__.o = function (object, property) {
		return Object.prototype.hasOwnProperty.call(object, property);
	};

	// __webpack_public_path__
	__webpack_require__.p = "";

	// Load entry module and return exports
	return __webpack_require__((__webpack_require__.s = "./src/main.js"));
})({
	"./src/m1.js": function (module, __webpack_exports__, __webpack_require__) {
		"use strict";
		__webpack_require__.r(__webpack_exports__);
		__webpack_require__.d(__webpack_exports__, "default", function () {
			return fn;
		});
		function fn() {
			console.dir("m1");
		}
	},
	"./src/main.js": function (module, __webpack_exports__, __webpack_require__) {
		"use strict";
		__webpack_require__.r(__webpack_exports__);
		var _m1__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/m1.js");

		Object(_m1__WEBPACK_IMPORTED_MODULE_0__["default"])();
		console.dir("liut");
	}
});
//# sourceMappingURL=main.358a24ac.js.map
