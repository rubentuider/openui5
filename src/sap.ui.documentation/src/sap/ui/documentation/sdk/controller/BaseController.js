/*!
 * ${copyright}
 */

/*global history */
sap.ui.define([
		"sap/ui/documentation/library",
		"sap/ui/core/Core",
		"sap/ui/core/Fragment",
		"sap/ui/core/mvc/Controller",
		"sap/ui/core/routing/History",
		"sap/ui/model/resource/ResourceModel",
		"sap/ui/Device",
		"sap/m/library",
		"sap/ui/documentation/sdk/controller/util/APIInfo",
		"sap/base/strings/formatMessage",
		"sap/ui/documentation/WebPageTitleUtil"
	], function (library, Core, Fragment, Controller, History, ResourceModel, Device, mobileLibrary, APIInfo,
				 formatMessage, WebPageTitleUtil) {
		"use strict";

		// shortcut for sap.m.SplitAppMode
		var SplitAppMode = mobileLibrary.SplitAppMode;

		var URLHelper = mobileLibrary.URLHelper;

		var _oWebPageTitleUtil = new WebPageTitleUtil();

		var _oPageTitle = [];

		var BaseController = Controller.extend("sap.ui.documentation.sdk.controller.BaseController", {

			// Prerequisites
			_oCore: Core,

			formatMessage: formatMessage,

			appendPageTitle: function (sTitle) {
				if (sTitle === null) {
					_oPageTitle = [];
				} else {
					if (_oPageTitle.indexOf(sTitle) >= 0) {
						return this;
					}
					_oPageTitle.length === 2 ? _oPageTitle[0] = sTitle : _oPageTitle.unshift(sTitle);
				}
				_oWebPageTitleUtil.setTitle(_oPageTitle.join(" - "));

				return this;
			},
			onInit: function() {

				var oMessageBundle = new ResourceModel({
					bundleName: "sap.ui.documentation.messagebundle"
				});

				this._oConfigUtil = this.getOwnerComponent().getConfigUtil();

				this.setModel(oMessageBundle, "i18n");
				// Load <code>versionInfo</code> to ensure the <code>versionData</code> model is loaded.
				if (Device.system.phone || Device.system.tablet) {
					this.getOwnerComponent().loadVersionInfo(); // for Desktop is always loaded in <code>Component.js</code>
				}
				this._aRouterCachedEventDetails = [];

			},

			hideMasterSide : function() {
				var splitApp = this.getSplitApp();
				splitApp.setMode(SplitAppMode.HideMode);
			},

			showMasterSide : function() {
				var splitApp = this.getSplitApp();
				splitApp.setMode(SplitAppMode.ShowHideMode);
			},

			getSplitApp: function() {
				return this.getView().getParent().getParent();
			},

			/**
			 * Convenience method for accessing the router in every controller of the application.
			 * @public
			 * @returns {sap.ui.core.routing.Router} the router for this component
			 */
			getRouter : function () {
				return this.getOwnerComponent().getRouter();
			},

			/**
			 * Convenience method for getting the view model by name in every controller of the application.
			 * @public
			 * @param {string} sName the model name
			 * @returns {sap.ui.model.Model} the model instance
			 */
			getModel : function (sName) {
				return this.getView().getModel(sName);
			},

			/**
			 * Convenience method for setting the view model in every controller of the application.
			 * @public
			 * @param {sap.ui.model.Model} oModel the model instance
			 * @param {string} sName the model name
			 * @returns {sap.ui.mvc.View} the view instance
			 */
			setModel : function (oModel, sName) {
				return this.getView().setModel(oModel, sName);
			},

			/**
			 * Convenience method for getting the application configuration located in manifest.json.
			 * @public
			 * @returns {object} the configuration of the component
			 */
			getConfig : function () {
				return this.getOwnerComponent().getConfig() || {};
			},

			/**
			 * Event handler  for navigating back.
			 * It checks if there is a history entry. If yes, history.go(-1) will happen.
			 * If not, it will replace the current entry of the browser history with the master route.
			 * @public
			 */
			onNavBack : function(event) {
				var sPreviousHash = History.getInstance().getPreviousHash();

				if (sPreviousHash !== undefined) {
					// The history contains a previous entry
					if (sPreviousHash.indexOf("search/") === 0) {
						this.getRouter().navTo("search", {searchParam: sPreviousHash.split("/")[1]}, false);
					} else {
						history.go(-1);
					}
				} else {
					var sCurrentHash = window.location.hash;

					if (sCurrentHash.indexOf("#/topic/") == 0) {
						this.getRouter().navTo("topic", {}, true);
					} else if (sCurrentHash.indexOf("#/api/") == 0) {
						this.getRouter().navTo("api", {}, true);
					}
				}
			},

			searchResultsButtonVisibilitySwitch : function(oButton) {
				var sPreviousHash = History.getInstance().getPreviousHash();
				if (sPreviousHash && sPreviousHash.indexOf("search/") === 0) {
					oButton.setVisible(true);
				} else {
					oButton.setVisible(false);
				}
			},

			/**
			 * Getter for the application root view
			 * @return {sap.ui.core.mvc.View} Application root view
			 */
			getRootView: function () {
				var oComponent = this.getOwnerComponent();
				return oComponent.byId(oComponent.getManifestEntry("/sap.ui5/rootView").id);
			},

			/**
			 * Opens a legal disclaimer for Links Popover.
			 * @param {sap.ui.base.Event} oEvent the <code>Image</code> press event
			 * @public
			 */
			onDisclaimerLinkPress: function (oEvent) {
				var oSource = oEvent.getSource ? oEvent.getSource() : oEvent.target;

				if (!this.oDisclaimerPopover) {
					Fragment.load({
						name: "sap.ui.documentation.sdk.view.LegalDisclaimerPopover"
					}).then(function (oPopover) {
						// connect dialog to the root view of this component (models, lifecycle)
						this.getView().addDependent(oPopover);

						this.oDisclaimerPopover = oPopover;
						oPopover.openBy(oSource);
					}.bind(this));

					return; // We continue execution in the promise
				} else if (this.oDisclaimerPopover.isOpen()) {
					 this.oDisclaimerPopover.close();
				}

				this.oDisclaimerPopover.openBy(oSource);
			},

			/**
			 * Retrieves the actual component for the control.
			 * @param {string} sControlName
			 * @return {string} the actual component
			 */
			_getControlComponent: function (sControlName, oControlsData) {
				var oLibComponentModel = oControlsData.libComponentInfos,
					oLibInfo = library._getLibraryInfoSingleton();
				return oLibInfo._getActualComponent(oLibComponentModel, sControlName);
			},

			/**
			 * Switches the maximum height of the phone image for optimal display in landscape mode
			 * @param {sap.ui.base.Event} oEvent Device orientation change event
			 * @private
			 */
			_onOrientationChange: function(oEvent) {
				var oImage = this.byId("phoneImage");

				if (Device.system.phone && oImage) {
					oImage.toggleStyleClass("phoneHeaderImageLandscape", oEvent.landscape);
				}
			},

			/**
			 * Registers an event listener on device orientation change
			 * @private
			 */
			_registerOrientationChange: function () {
				Device.orientation.attachHandler(this._onOrientationChange, this);
			},

			/**
			 * Deregisters the event listener for device orientation change
			 * @private
			 */
			_deregisterOrientationChange: function () {
				Device.orientation.detachHandler(this._onOrientationChange, this);
			},

			/**
			 * Handles landing image load event and makes landing image headline visible
			 * when the image has loaded.
			 */
			handleLandingImageLoad: function () {
				this.getView().byId("landingImageHeadline").setVisible(true);
			},
			/**
			 * Handles the click on an item of the Footer Master (the footer placed
			 * at the bottom of any MasterPage (left side of the SplitApp)).
			 * @param {object} oEvent the Event object from which we are going to get the correct item key.
			 */
			handleFooterMasterItemPress: function(oEvent) {
				var sTargetText = oEvent.getParameter("item").getKey();
				if (sTargetText === FOOTER_MENU_OPTIONS.COOKIE_PREFERENCES) {
					this.onEditCookiePreferencesRequest();
					return;
				}
				if (sTargetText === FOOTER_MENU_OPTIONS.PRIVACY) {
					this.navToPrivacyStatement();
					return;
				}
				var sTarget = BaseController.LEGAL_LINKS[sTargetText];
				URLHelper.redirect(sTarget, true);
			},
			/**
			 * Checks if a control has API Reference
			 * @param {string} sControlName
			 * @return {Promise} A promise that resolves to {boolean}
			 */
            getAPIReferenceCheckPromise: function (sControlName) {
				return APIInfo.getIndexJsonPromise().then(function (aData) {
					function findSymbol (a) {
						return a.some(function (o) {
							var bFound = o.name === sControlName;
							if (!bFound && o.nodes) {
								return findSymbol(o.nodes);
							}
							return bFound;
						});
					}
					return findSymbol(aData);
				});
			},

			onRouteNotFound: function (oEvent) {
				var sNotFoundTitle = this.getModel("i18n").getProperty("NOT_FOUND_TITLE");

				if (this._isRouteBypassedEvent(oEvent)) {
					this._cacheRouteEventDetails(oEvent);
				}

				this.getRouter().myNavToWithoutHash("sap.ui.documentation.sdk.view.NotFound", "XML", false);
				setTimeout(this.appendPageTitle.bind(this, sNotFoundTitle));
				return;
			},

			onEditCookiePreferencesRequest: function () {
				var oConsentManager = this.getOwnerComponent().getCookiesConsentManager(),
					oTracker;

				oConsentManager.showPreferencesDialog(this.getView());
				if (!oConsentManager.supportsWaitForPreferencesSubmission()) {
					return;
				}
				oTracker = this.getOwnerComponent().getUsageTracker();

				oConsentManager.waitForPreferencesSubmission().then(function () {
					oConsentManager.checkUserAcceptsUsageTracking(function(bAcceptsUsageTracking) {
						if (bAcceptsUsageTracking) {
							this._getVersionName().then(oTracker.start.bind(oTracker));
						} else {
							oTracker.stop();
						}
					}.bind(this));
					oConsentManager.checkUserAcceptsToPersistDisplaySettings(function(bAccepts) {
						if (!bAccepts) {
							this._oConfigUtil.unsetCookie(this._oConfigUtil.COOKIE_NAMES.CONFIGURATION_APPEARANCE);
						}
					}.bind(this));
				}.bind(this));
			},

			navToPrivacyStatement: function () {
				this.getRouter().navTo("PrivacyStatement");
			},

			_getVersionName: function () {
				var oComponent = this.getOwnerComponent();
				return oComponent.loadVersionInfo().then(function() {
					return oComponent.getModel("versionData").getProperty("/versionName");
				});
			},

			_isRouteBypassedEvent: function (oEvent) {
				return typeof oEvent?.getId === "function" && oEvent.getId() === "bypassed";
			},

			_cacheRouteEventDetails: function(oEvent) {
				var oEventDetails = Object.assign({eventId: oEvent.getId()}, oEvent.getParameters());
				this._aRouterCachedEventDetails.push(oEventDetails);
			}
		});

		/**
		 * STATIC MEMBERS
		 */
		const FOOTER_MENU_OPTIONS = {
			COOKIE_PREFERENCES: "cookie_preferences",
			LEGAL: "legal",
			PRIVACY: "privacy",
			TERMS_OF_USE: "terms_of_use",
			LICENSE: "license"
		};

		BaseController.LEGAL_LINKS = {
			[FOOTER_MENU_OPTIONS.LEGAL]: "https://www.sap.com/corporate/en/legal/impressum.html",
			[FOOTER_MENU_OPTIONS.PRIVACY]: "https://www.sap.com/corporate/en/legal/privacy.html",
			[FOOTER_MENU_OPTIONS.TERMS_OF_USE]: "https://www.sap.com/corporate/en/legal/terms-of-use.html",
			[FOOTER_MENU_OPTIONS.LICENSE]: "LICENSE.txt"
		};

		return BaseController;
	}
);
