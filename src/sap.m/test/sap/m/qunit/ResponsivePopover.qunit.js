/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/m/StandardListItem",
	"sap/m/List",
	"sap/m/Input",
	"sap/m/Button",
	"sap/m/library",
	"sap/ui/Device",
	"sap/m/ResponsivePopover",
	"sap/m/Text",
	"sap/m/Toolbar",
	"sap/m/NavContainer",
	"sap/m/Page",
	"sap/ui/core/InvisibleText",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/jquery"
], function(
	JSONModel,
	StandardListItem,
	List,
	Input,
	Button,
	mobileLibrary,
	Device,
	ResponsivePopover,
	Text,
	Toolbar,
	NavContainer,
	Page,
	InvisibleText,
	nextUIUpdate,
	jQuery
) {
	"use strict";

	// shortcut for sap.m.PlacementType
	var PlacementType = mobileLibrary.PlacementType;

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.TitleAlignment
	var TitleAlignment = mobileLibrary.TitleAlignment;


	// mockup data
	var data = {
		navigation : [ {
			title : "Travel Expend",
			description : "Access the travel expend workflow",
			icon : "images/travel_expend.png",
			iconInset : false,
			type : "Navigation",
			press : 'detailPage'
		}, {
			title : "Travel and expense report",
			description : "Access travel and expense reports",
			icon : "images/travel_expense_report.png",
			iconInset : false,
			type : "Navigation",
			press : 'detailPage'
		}, {
			title : "Travel Request",
			description : "Access the travel request workflow",
			icon : "images/travel_request.png",
			iconInset : false,
			type : "Navigation",
			press : 'detailPage'
		}, {
			title : "Work Accidents",
			description : "Report your work accidents",
			icon : "images/wounds_doc.png",
			iconInset : false,
			type : "Navigation",
			press : 'detailPage'
		}, {
			title : "Travel Settings",
			description : "Change your travel worflow settings",
			icon : "images/settings.png",
			iconInset : false,
			type : "Navigation",
			press : 'detailPage'
		}]
	};

	var oSimpleJSONModel = new JSONModel({
		data: [{titleName: "Title"}]
	});

	var oItemTemplate1 = new StandardListItem({
		title : "{title}",
		description : "{description}",
		icon : "{icon}",
		iconInset : "{iconInset}",
		type : "{type}"
	});

	function bindListData(data, itemTemplate, list) {
		var oModel = new JSONModel();
		// set the data for the model
		oModel.setData(data);
		// set the model to the list
		list.setModel(oModel);

		// bind Aggregation
		list.bindAggregation("items", {
			path: "/navigation",
			template: itemTemplate,
			templateShareable: false
		});
	}

	QUnit.module("API", {
		beforeEach: async function() {
			this.clock = sinon.useFakeTimers();

			// Arrange
			this.oList = new List();
			this.oInput = new Input();
			this.oBeginButton = new Button({
				text: "Action1",
				type: ButtonType.Reject
			});

			this.oEndButton = new Button({
				text: "Action2",
				type: ButtonType.Accept
			});

			this.oControlProps = {
				placement: PlacementType.Bottom,
				title: "Adaptive now",
				showHeader: false,
				icon: "sap-icon://manager",
				modal: true,
				offsetX: 10,
				offsetY: 20,
				contentWidth: "100px",
				contentHeight: "200px",
				horizontalScrolling: false,
				verticalScrolling: false,
				showCloseButton: true,
				beginButton: this.oBeginButton,
				endButton: this.oEndButton
			};


			this.oButton = new Button({
				text : "ResponsivePopover"
			});

			bindListData(data, oItemTemplate1, this.oList);
			this.oButton.placeAt('qunit-fixture');
			this.clock.tick(500);
			await nextUIUpdate(this.clock);
		},
		afterEach: function() {

			if (this.oResponsivePopover && this.oResponsivePopover.isOpen()) {
				this.oResponsivePopover.close();
			}

			// Cleanup
			this.oButton && this.oButton.destroy();
			this.oResponsivePopover && this.oResponsivePopover.destroy();

			// Restore this.clock if it was initialized and fake timers were used during the test
			// The clock should be restored after control destruction
			if (this.clock) {
				this.clock.runToLast();
				this.clock.restore();
			}
		}
	});

	QUnit.test("Desktop and tablet mode", function(assert) {

		// Act and Arrange

		this.stub(Device, "system").value({desktop: true});
		this.oResponsivePopover = new ResponsivePopover(this.oControlProps);
		this.oResponsivePopover.addContent(this.oList);
		this.oResponsivePopover.setInitialFocus(this.oList);

		// Assert
		assert.ok(this.oResponsivePopover._oControl.isA("sap.m.Popover"), "ResponsivePopover should contain a popover inside");
		assert.equal(this.oResponsivePopover._oControl.getPlacement(), PlacementType.Bottom, "Placement should be passed to inner popover");
		assert.equal(this.oResponsivePopover._oControl.getTitle(), "Adaptive now", "Title should be passed to inner popover");
		assert.equal(this.oResponsivePopover._oControl.getShowHeader(), false, "ShowHeader should be passed to inner popover");
		assert.equal(this.oResponsivePopover._oControl.getModal(), true, "Modal should be passed to inner popover");
		assert.equal(this.oResponsivePopover._oControl.getOffsetX(), 10, "OffsetX should be passed to inner popover");
		assert.equal(this.oResponsivePopover._oControl.getOffsetY(), 20, "OffsetY should be passed to inner popover");
		assert.equal(this.oResponsivePopover._oControl.getContentWidth(), "100px", "ContentWidth should be passed to inner popover");
		assert.equal(this.oResponsivePopover._oControl.getContentHeight(), "200px", "ContentHeight should be passed to inner popover");
		assert.equal(this.oResponsivePopover._oControl.getHorizontalScrolling(), false, "HorizontalScrolling should be passed to inner popover");
		assert.equal(this.oResponsivePopover._oControl.getVerticalScrolling(), false, "VerticalScrolling should be passed to inner popover");
		assert.equal(this.oResponsivePopover._oControl.getInitialFocus(), this.oList.getId(), "InitialFocus should be passed to the inner popover");
		assert.strictEqual(this.oResponsivePopover._oControl.getFooter().getContent()[1], this.oBeginButton, "BeginButton should be passed to inner popover");
		assert.strictEqual(this.oResponsivePopover._oControl.getFooter().getContent()[2], this.oEndButton, "EndButton should be passed to inner popover");

	});

	QUnit.test('Phone mode', async function(assert) {

		// Act and Arrange
		this.stub(Device, "system").value({phone: true});
		this.oResponsivePopover = new ResponsivePopover(this.oControlProps);
		this.oResponsivePopover.setShowHeader(true);
		this.oResponsivePopover.setShowCloseButton(false);
		this.oResponsivePopover.addContent(this.oInput);
		this.oResponsivePopover.setInitialFocus(this.oInput);

		// Assert
		assert.ok(this.oResponsivePopover._oControl.isA("sap.m.Dialog"), "ResponsivePopover should be a dialog now");
		assert.equal(this.oResponsivePopover._oControl.getStretch(), true, "Dialog should have stretch enabled");
		assert.equal(this.oResponsivePopover._oControl.getTitle(), "Adaptive now", "Title should be passed to inner dialog");
		assert.equal(this.oResponsivePopover._oControl.getIcon(), "sap-icon://manager", "Icon should be passed to inner dialog");
		assert.equal(this.oResponsivePopover._oControl.getShowHeader(), true, "ShowHeader should be passed to inner dialog");
		assert.equal(this.oResponsivePopover._oControl.getContentWidth(), "100px", "ContentWidth should be passed to inner dialog");
		assert.equal(this.oResponsivePopover._oControl.getContentHeight(), "200px", "ContentHeight should be passed to inner dialog");
		assert.equal(this.oResponsivePopover._oControl.getHorizontalScrolling(), false, "HorizontalScrolling should be passed to inner dialog");
		assert.equal(this.oResponsivePopover._oControl.getVerticalScrolling(), false, "VerticalScrolling should be passed to inner dialog");
		assert.equal(this.oResponsivePopover._oControl.getInitialFocus(), this.oInput.getId(), "InitialFocus should be passed to the inner dialog");
		assert.strictEqual(this.oResponsivePopover._oControl.getBeginButton(), this.oBeginButton, "BeginButton should be passed to inner dialog");
		assert.strictEqual(this.oResponsivePopover._oControl.getEndButton(), this.oEndButton, "EndButton should be passed to inner dialog");

		// Open the ResponsivePopover
		this.oResponsivePopover.openBy(this.oButton);
		this.clock.tick(500);
		await nextUIUpdate(this.clock);

		// Assert
		assert.ok(jQuery("#" + this.oResponsivePopover.getId() + "-closeButton").length === 0, "CloseButton should not be rendered");

		this.oResponsivePopover.setShowCloseButton(true);
		await nextUIUpdate(this.clock);

		assert.ok(jQuery("#" + this.oResponsivePopover.getId() + "-closeButton").length === 1, "CloseButton should be rendered");
	});

	QUnit.test("Close button should not be forwarded to an internal aggregation Toolbar", async function (assert) {
		this.stub(Device, "system").value({ phone: true, desktop: false });

		var oToolbar = new Toolbar(),
			oResponsivePopover = new ResponsivePopover({
				showHeader: false,
				content: [
					new NavContainer( {
						pages: [
							new Page({
								customHeader: oToolbar
							})
						]
					})
				]
			});

		// Open the ResponsivePopover
		oResponsivePopover.openBy(this.oButton);
		await nextUIUpdate(this.clock);
		this.clock.tick(500);
		assert.ok(true, "does not throw an exception");
		assert.strictEqual(oToolbar.getContent().length, 0, "no content should be added to the Toolbar");

		oResponsivePopover.destroy();
	});

	QUnit.test("Getter for begin/end button", function(assert) {
		// Act and Arrange
		this.stub(Device, "system").value({ phone: true });
		this.oResponsivePopover = new ResponsivePopover(this.oControlProps);

		assert.ok(this.oResponsivePopover.getBeginButton(), "Should be executed without any errors");
		assert.ok(this.oResponsivePopover.getEndButton(), "Should be executed without any errors");
	});

	QUnit.test("Add end button without begin button", async function (assert) {
		var oPopover = new ResponsivePopover();
		// create footer
		oPopover._createButtonFooter();
		// spy
		var oInserAggregationSpy = this.spy(oPopover._oFooter, "insertContent");

		// act
		oPopover.setEndButton(new Button());
		await nextUIUpdate(this.clock);

		// assert
		assert.strictEqual(oInserAggregationSpy.getCall(0).args[1], 1, "insert content should be called with position 1 for end button");
	});

	QUnit.test("Clone method", function(assert) {

		// Act and Arrange
		this.oResponsivePopover = new ResponsivePopover(this.oControlProps);
		this.oResponsivePopover.addContent(this.oList);
		var oClone = this.oResponsivePopover.clone();

		// Assert
		assert.strictEqual(this.oResponsivePopover instanceof ResponsivePopover, true, "Should return a new instance of ResponsivePopover");
		assert.notEqual(this.oResponsivePopover.getContent(), oClone.getContent(), "The conents of the clone and original ResponsivePopover should not be same(e.g different IDs)");
		assert.strictEqual(oClone.getContent()[0].getParent().getParent(), oClone, "Cloned content parent should be the clone instance");
		assert.strictEqual(oClone.getContent()[0] instanceof List, true, "The first control in the content should be a list");
	});

	QUnit.test("Phone mode with NavContainer content", async function(assert) {
		// Arrange and Act
		this.stub(Device, "system").value({phone: true});
		this.oResponsivePopover = new ResponsivePopover(this.oControlProps);
		var oNavContainer = new NavContainer({
			pages: [
					new Page("page1", {
						title: "page1"
					}),
					new Page("page2", {
						title: "page2"
					})
				]
		});

		this.oResponsivePopover.addContent(oNavContainer);
		await nextUIUpdate(this.clock);

		this.oResponsivePopover.openBy(this.oButton);
		this.clock.tick(500);

		// Assert
		assert.ok(jQuery("#" + this.oResponsivePopover.getId() + "-closeButton").closest("#page1-intHeader")[0], "CloseButton should be rendered in page1");
		oNavContainer.to("page2");
		this.clock.tick(500);
		assert.ok(jQuery("#" + this.oResponsivePopover.getId() + "-closeButton").closest("#page2-intHeader")[0], "CloseButton should be rendered in page2");
	});

	QUnit.test("ResponsivepPopover should return the same domref as the internal popup control", function(assert) {
		// Arrange
		this.oResponsivePopover = new ResponsivePopover();

		// Act
		this.oResponsivePopover.openBy(this.oButton);
		this.clock.tick(500);

		// Assert
		assert.ok(this.oResponsivePopover.isOpen(), "responsive popover is opened");
		assert.strictEqual(this.oResponsivePopover.getDomRef(), this.oResponsivePopover._oControl.getDomRef(), "getDomRef call is forwarded");
	});

	QUnit.test("ResponsivepPopover should act according to value of resizing property", function(assert) {
		// Arrange
		this.oResponsivePopover = new ResponsivePopover();
		this.oResponsivePopover.setResizable(true);

		// Act
		this.oResponsivePopover.openBy(this.oButton);
		this.clock.tick(500);
		let domQueryLength;

		if (!Device.system.desktop) {
			domQueryLength = this.oResponsivePopover.getDomRef().querySelectorAll('.sapMPopoverResizeHandle').length;
			assert.strictEqual(domQueryLength,  0, "Arrow not found in responsive popover because not desktop device");
		} else {
			// Assert when resizable
			domQueryLength = this.oResponsivePopover.getDomRef().querySelectorAll('.sapMPopoverResizeHandle').length;
			assert.strictEqual(domQueryLength,  1, "Arrow found in responsive popover");

			this.oResponsivePopover.close();

			this.oResponsivePopover.setResizable(false);
			this.oResponsivePopover.openBy(this.oButton);
			this.clock.tick(500);

			// Assert when not resizable
			domQueryLength = this.oResponsivePopover.getDomRef().querySelectorAll('.sapMPopoverResizeHandle').length;
			assert.strictEqual(domQueryLength,  0, "Arrow not found in responsive popover");
		}
	});

	QUnit.test("ResponsivePopover should be extensible", function (assert) {
			var ResponsivePopoverExtended = ResponsivePopover.extend("sap.m.ResponsivePopoverExtended", {
				metadata: {
					properties: {
						customBooleanProperty: {type : "boolean", group : "Misc", defaultValue : true}
					}
				},

				// no rendering required for the scenarios in this module
				renderer: null
			});

			var oResponsivePopoverExtendedInstance = new ResponsivePopoverExtended();
			oResponsivePopoverExtendedInstance.setCustomBooleanProperty(false);

			assert.ok(true, "This is expected to pass because custom property is only set on ResponsivePopover itself and not on aggregated controls");
	});

	QUnit.test("ResponsivePopover should pass the data from the binded model to the inner control", function (assert) {
		// Arrange
		this.oResponsivePopover = new ResponsivePopover();
		this.oResponsivePopover.setModel(oSimpleJSONModel);
		this.oResponsivePopover.bindProperty("title", "titleName");
		this.oResponsivePopover.bindElement({
			path: "/data/0"
		});

		// Act
		this.oResponsivePopover.openBy(this.oButton);
		this.clock.tick(500);
		// Assert
		assert.equal(this.oResponsivePopover._oControl.getTitle(), "Title", "Title should be passed to inner popover");
	});

	QUnit.test("ResponsivePopover with ariaLabelledBy", function (assert) {
		// Arrange
		var sInvTextId = "invisibleText";

		/* var oInvText = */ new InvisibleText(sInvTextId, {text: "Additional Label"});
		this.oResponsivePopover = new ResponsivePopover();
		this.oResponsivePopover.addAriaLabelledBy(sInvTextId);

		// Act
		this.oResponsivePopover.openBy(this.oButton);
		this.clock.tick(500);

		// Assert
		// The Popover or the Dialog could have some additional logic for the aria-labelledby attribute. Therefore, we only need to assure that the additional ID is added to the attribute.
		assert.ok(this.oResponsivePopover.getDomRef().getAttribute('aria-labelledby').indexOf(sInvTextId) !== -1, "should contain the id of the invisible label in the aria-labelledby attribute");
	});

	QUnit.test("Should proxy dependents aggregation correctly", async function (assert) {
		// Arrange
		var oResponsivePopover = new ResponsivePopover("popover", {
			content: [new Text({text: "Hello"})],
			dependents: [new Text("worldText", {text: "World!"})]
		});

		// Act
		await nextUIUpdate(this.clock);

		// Assert
		assert.strictEqual(oResponsivePopover.getDependents().length, 1, "Dependents aggregation is forwarded correctly");
	});

	QUnit.test("ResponsivePopover should not fall in infinite loop when invalidation comes from child control", async function (assert) {
		var oResponsivePopover = new ResponsivePopover("rpo");
		var oButton = new Button();

		oButton.placeAt('qunit-fixture');
		await nextUIUpdate(this.clock);

		// open the RPO
		oResponsivePopover.openBy(oButton);
		this.clock.tick(500);

		// remove it from the UI Area
		var oUIArea = oResponsivePopover.getParent();
		oUIArea.removeAllContent();
		await nextUIUpdate(this.clock);

		// invalidate it
		oResponsivePopover.addContent(new Button());
		await nextUIUpdate(this.clock);

		assert.ok(true, "Assertion has done");
	});

	//================================================================================
	// ResponsivePopover accessibility
	//================================================================================

	QUnit.test("ResponsivePopover with aria-modal attribute set to true", function (assert) {
		// Arrange
		var oResponsivePopover = new ResponsivePopover();

		// Act
		oResponsivePopover.openBy(this.oButton);
		this.clock.tick(500);
		// Assert
		assert.strictEqual(oResponsivePopover.getDomRef().getAttribute('aria-modal'), "true", 'aria-modal attribute is true');
	});

	QUnit.test("ResponsivePopover setting ariaRoleApplication property should set it to the internal popover", function (assert) {
		// Arrange
		var oResponsivePopover = new ResponsivePopover();

		// Act
		oResponsivePopover._setAriaRoleApplication(true);

		// Assert
		assert.strictEqual(oResponsivePopover._oControl.getProperty('ariaRoleApplication'), true, 'Internal\'s popover ariaRoleApplication property is set to true');
	});

	QUnit.module("Title Alignment");

	QUnit.test("setTitleAlignment test", async function (assert) {

		var oPopover = new ResponsivePopover({
				title: "Header"
			}),
			oButton = new Button({text: "Test"}),
			sAlignmentClass = "sapMBarTitleAlign",
			setTitleAlignmentSpy = this.spy(oPopover, "setTitleAlignment"),
			sInitialAlignment,
			sAlignment;

		oButton.placeAt("qunit-fixture");
		await nextUIUpdate();
		oPopover.openBy(oButton);
		await nextUIUpdate();
		sInitialAlignment = oPopover.getTitleAlignment();

		// initial titleAlignment test depending on theme
		assert.ok(oPopover._oControl._getAnyHeader().hasStyleClass(sAlignmentClass + sInitialAlignment),
					"The default titleAlignment is '" + sInitialAlignment + "', there is class '" + sAlignmentClass + sInitialAlignment + "' applied to the Header");

		// check if all types of alignment lead to apply the proper CSS class
		for (sAlignment in TitleAlignment) {
			oPopover.setTitleAlignment(sAlignment);
			await nextUIUpdate();
			assert.ok(oPopover._oControl._getAnyHeader().hasStyleClass(sAlignmentClass + sAlignment),
						"titleAlignment is set to '" + sAlignment + "', there is class '" + sAlignmentClass + sAlignment + "' applied to the Header");
		}

		// check how many times setTitleAlignment method is called
		assert.strictEqual(setTitleAlignmentSpy.callCount, Object.keys(TitleAlignment).length,
			"'setTitleAlignment' method is called total " + setTitleAlignmentSpy.callCount + " times");

		// cleanup
		oPopover.destroy();
	});

	QUnit.module("Footer", {
		beforeEach: function () {
			var oBeginButton = new Button({
				text: "Action1",
				type: ButtonType.Reject
			});

			var oEndButton = new Button({
				text: "Action2",
				type: ButtonType.Accept
			});

			var oSpacer = new sap.m.ToolbarSpacer({});
			this.oFooter = new sap.m.OverflowToolbar({
				content: [oSpacer, oBeginButton, oEndButton]
			});

			this.oControlProps = {
				footer: this.oFooter
			};
		},
		afterEach: function () {
			if (this.oResponsivePopover && this.oResponsivePopover.isOpen()) {
				this.oResponsivePopover.close();
			}

			// Cleanup
			this.oResponsivePopover && this.oResponsivePopover.destroy();
		}
	});

	QUnit.test("Forwarding", function(assert) {
		// Act and Arrange
		this.stub(Device, "system").value({ phone: true });
		this.oResponsivePopover = new ResponsivePopover(this.oControlProps);

		assert.strictEqual(this.oResponsivePopover._oControl.getFooter(), this.oFooter, "Footer is forwarded to the inner control");
	});
});