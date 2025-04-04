sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"sap/ui/core/IconPool",
	"./util/LibLoading",
	"sap/base/Log"
], function (
	Localization,
	UIComponent,
	Device,
	IconPool,
	LibLoading,
	Log
) {
	"use strict";

	return UIComponent.extend("sap.ui.demo.accessibilityGuide.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * In this function, the device models are set and the router is initialized.
		 * @public
		 * @override
		 */
		init: function () {

			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// specify the only supported language
			Localization.setLanguage("en");

			// register TNT icon font
			IconPool.registerFont({
				fontFamily: "SAP-icons-TNT",
				fontURI: sap.ui.require.toUrl("sap/tnt/themes/base/fonts/")
			});

			LibLoading._loadLibrary("sap.suite.ui.commons").then(function () {
				LibLoading.bCommonsLibAvailable = true;
			}).catch(function (sMessage){
				LibLoading.bCommonsLibAvailable = false;
				Log.error(sMessage);
			}).finally(function() {
				// create the views based on the url/hash
				this.getRouter().initialize();
			}.bind(this));
		},

		/**
		 * The component is destroyed by UI5 automatically.
		 * In this method, the ErrorHandler is destroyed.
		 * @public
		 * @override
		 */
		destroy: function () {
			// call the base component's destroy function
			UIComponent.prototype.destroy.apply(this, arguments);
		},

		/**
		 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
		 * design mode class should be set, which influences the size appearance of some controls.
		 * @public
		 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
		 */
		getContentDensityClass: function () {
			if (this._sContentDensityClass === undefined) {
				// check whether FLP has already set the content density class; do nothing in this case
				if (document.body.classList.contains("sapUiSizeCozy") || document.body.classList.contains("sapUiSizeCompact")) {
					this._sContentDensityClass = "";
				} else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		}
	});
});
