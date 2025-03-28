/* global QUnit */

sap.ui.define([
	"sap/ui/fl/Layer",
	"sap/ui/fl/write/_internal/appVariant/AppVariantInlineChangeFactory",
	"sap/ui/fl/descriptorRelated/api/DescriptorChangeFactory",
	"sap/ui/rta/command/CommandFactory",
	"sap/m/Button",
	"sap/ui/base/ManagedObject",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	Layer,
	AppVariantInlineChangeFactory,
	DescriptorChangeFactory,
	CommandFactory,
	Button,
	ManagedObject,
	sinon,
	RtaQunitUtils
) {
	"use strict";

	QUnit.module("Given the parameters required to create an manifest change...", {
		before() {
			this.oMockedAppComponent = RtaQunitUtils.createAndStubAppComponent(sinon);
		},
		after() {
			this.oMockedAppComponent._restoreGetAppComponentStub();
			this.oMockedAppComponent.destroy();
		},
		beforeEach() {
			this.sReference = "appReference";
			this.mFlexSettings = {
				layer: Layer.CUSTOMER
			};
			this.sChangeType = "dummyChangeType";

			this.mParameters = {
				dataSource: {
					source1: {
						uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/"
					}
				}
			};

			this.mTexts = {
				"customer.newid_sap.ovp.cards.customer.fancy_card.settings.category": {
					type: "XTIT",
					maxLength: 20,
					comment: "example",
					value: {
						"": "Category example default text",
						en: "Category example text in en",
						de: "Kategorie Beispieltext in de"
					}
				}
			};

			this.oButton = new Button("myButton");
		},
		afterEach() {
			this.oButton.destroy();
		}
	}, function() {
		QUnit.test("when calling command factory for a generic manifest change type ...", function(assert) {
			const done = assert.async();
			const fnAssertSpy = sinon.spy(ManagedObject.prototype, "applySettings");

			const oMockManifestInlineChange = {
				mockName: "mocked"
			};

			const oMockManifestChange = {
				store() {
					assert.ok(true, "the manifest change was submitted");
					const mPassedSettings = fnAssertSpy.getCall(0).args[0];
					const bHasSelector = Object.keys(mPassedSettings).some(function(sKey) {
						return sKey === "selector";
					});
					assert.notOk(bHasSelector, "the selector is not part of the passed settings");
					fnAssertSpy.restore();
					done();
				}
			};

			this.createManifestInlineChangeStub = sinon.stub(AppVariantInlineChangeFactory, "createDescriptorInlineChange").callsFake(function(mPropertyBag) {
				assert.strictEqual(mPropertyBag.changeType, this.sChangeType, "change type is properly passed to the 'createDescriptorInlineChange' function");
				assert.strictEqual(mPropertyBag.content, this.mParameters, "parameters are properly passed to the 'createDescriptorInlineChange' function");
				assert.strictEqual(mPropertyBag.texts, this.mTexts, "texts are properly passed to the 'createDescriptorInlineChange' function");
				this.createManifestInlineChangeStub.restore();
				return Promise.resolve(oMockManifestInlineChange);
			}.bind(this));

			this.createNewChangeStub = sinon.stub(DescriptorChangeFactory.prototype, "createNew").callsFake(function(sReference, oInlineChange, sLayer, oAppComponent, sGenerator) {
				assert.strictEqual(sReference, this.sReference, "reference is properly passed to createNew function");
				assert.strictEqual(oInlineChange.mockName, oMockManifestInlineChange.mockName, "Inline Change is properly passed to createNew function");
				assert.strictEqual(sLayer, this.sLayer, "layer is properly passed to createNew function");
				assert.strictEqual(oAppComponent, this.oMockedAppComponent, "App Component is properly passed to createNew function");
				assert.strictEqual(sGenerator, "sap.ui.rta.ManifestCommand", "the generator is properly passed to createNew function");

				this.createNewChangeStub.restore();

				return Promise.resolve(oMockManifestChange);
			}.bind(this));

			return CommandFactory.getCommandFor(this.oButton, "manifest", {
				reference: this.sReference,
				parameters: this.mParameters,
				texts: this.mTexts,
				changeType: this.sChangeType,
				appComponent: this.oMockedAppComponent
			}, {}, {layer: this.sLayer})

			.then(function(oManifestCommand) {
				assert.ok(oManifestCommand, "Manifest command exists for element");
				assert.ok(oManifestCommand.needsReload, "Manifest commands need restart to be applied");
				oManifestCommand.createAndStoreChange();
			})

			.catch(function(oError) {
				assert.ok(false, `catch must never be called - Error: ${oError}`);
			});
		});

		QUnit.test("when calling command factory for a addLibraries manifest and adding composite command id ...", function(assert) {
			const sCompositeCommandId = "my-fancy-new-composite-command";
			return CommandFactory.getCommandFor(this.oButton, "manifest", {
				reference: this.sReference,
				parameters: {
					libraries: {}
				},
				texts: this.mTexts,
				changeType: "create_ui5_addLibraries",
				appComponent: this.oMockedAppComponent
			}, {}, {layer: this.sLayer})
			.then(function(oManifestCommand) {
				oManifestCommand.setCompositeId(sCompositeCommandId);
				assert.ok(oManifestCommand, "Manifest command exists for element");
				return oManifestCommand.createAndStoreChange()
				.then(function() {
					const oStoredChange = oManifestCommand.getPreparedChange();
					assert.strictEqual(oStoredChange.getSupportInformation().compositeCommand, sCompositeCommandId, "then composite command id is attached to the change definition");
				});
			})
			.catch(function(oError) {
				assert.ok(false, `catch must never be called - Error: ${oError}`);
			});
		});

		QUnit.test("when calling command factory for a change with long name without mocks ...", function(assert) {
			const done = assert.async();
			this.sChangeType = "appdescr_ui_generic_app_changePageConfiguration";
			this.mParameters = {
				parentPage: {component: "dummy", entitySet: "dummy"},
				entityPropertyChange: {
					propertyPath: "a",
					operation: "UPSERT",
					propertyValue: "b"
				}
			};

			let oManifestCmd;
			return CommandFactory.getCommandFor(this.oButton, "manifest", {
				reference: this.sReference,
				parameters: this.mParameters,
				texts: this.mTexts,
				changeType: this.sChangeType,
				appComponent: this.oMockedAppComponent
			}, {}, {layer: this.sLayer})
			.then(function(oManifestCommand) {
				assert.ok(oManifestCommand, "Manifest command exists for element");
				assert.ok(oManifestCommand.needsReload, "Manifest commands need restart to be applied");
				oManifestCmd = oManifestCommand;
				return oManifestCommand.createAndStoreChange();
			})
			.then(function() {
				const oChange = oManifestCmd.getPreparedChange();
				assert.ok(oChange, "the prepared change is available");
				assert.deepEqual(oChange.getContent(), this.mParameters, "the stored change contains the parameters");
				assert.ok(oChange.getId().length <= 64, "the fileName is shortened to not exceed the LREP limit");
			}.bind(this))
			.catch(function(oError) {
				assert.ok(false, `catch must never be called - Error: ${oError}`);
			})
			.then(done);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});