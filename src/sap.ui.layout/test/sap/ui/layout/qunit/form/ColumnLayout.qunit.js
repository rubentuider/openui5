/* global QUnit, sinon */

// Test only the things relevant for ColumnLayout. The basic Form functionality
// is tested in Form, FormContainer and FormElement qUnit tests.
// via qUnit only the DOM structure and classes can be tested, so the real
// layout must be tested in some visual test.

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/layout/form/ColumnLayout",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormElement",
	"sap/ui/layout/form/SemanticFormElement",
	"sap/ui/layout/form/ColumnElementData",
	"sap/ui/layout/form/ColumnContainerData",
	"sap/ui/core/Title",
	"sap/m/Toolbar",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/Link",
	"sap/m/Title",
	"sap/ui/qunit/utils/nextUIUpdate"
],
	function(
		jQuery,
		qutils,
		ColumnLayout,
		Form,
		FormContainer,
		FormElement,
		SemanticFormElement,
		ColumnElementData,
		ColumnContainerData,
		Title,
		Toolbar,
		Label,
		Text,
		Link,
		mTitle,
		nextUIUpdate
	) {
	"use strict";

	var oForm;
	var oColumnLayout;
	var oFormContainer1;
	var oFormContainer2;
	var oFormElement1;
	var oFormElement2;
	var oFormElement3;
	var oFormElement4;
	var oLabel1;
	var oLabel2;
	var oLabel3;
	var oLabel4;
	var oField1;
	var oField2;
	var oField3;
	var oField4;
	var oTitle;

	// if some test breaks internal controls of test may not destroyed
	// what leads to duplicate ID errors in next test
	function cleanupControl(oControl) {
		if (oControl && !oControl._bIsBeingDestroyed) {
			oControl.destroy();
		}
		oControl = undefined;
	}

	async function initForm(bEditable) {
		oColumnLayout = new ColumnLayout("CL1");
		oLabel1 = new Label("L1", {text: "Label 1"});
		oField1 = new Text("T1", {text: "Text 1"});
		oFormElement1 = new FormElement("FE1",{
			label: oLabel1,
			fields: [oField1]
		});
		oFormContainer1 = new FormContainer("FC1",{
			formElements: [ oFormElement1 ]
		});
		var aFormContainers = [oFormContainer1];

		oForm = new Form("F1", {
			layout: oColumnLayout,
			editable: bEditable,
			formContainers: aFormContainers
		}).placeAt("qunit-fixture");
		await nextUIUpdate();
	}

	function afterTest() {
		if (oForm) {
			oForm.destroy();
			oForm = undefined;
			cleanupControl(oColumnLayout);
			cleanupControl(oLabel1);
			cleanupControl(oLabel2);
			cleanupControl(oLabel3);
			cleanupControl(oLabel4);
			cleanupControl(oField1);
			cleanupControl(oField2);
			cleanupControl(oField3);
			cleanupControl(oField4);
			cleanupControl(oFormElement1);
			cleanupControl(oFormElement2);
			cleanupControl(oFormElement3);
			cleanupControl(oFormElement4);
			cleanupControl(oFormContainer1);
			cleanupControl(oFormContainer2);
			cleanupControl(oTitle);
		}
	}

	async function addContainer(sID) {
		var oLabel = new Label(sID + "L1", {text: "Label 1"});
		var oField = new Text(sID + "T1", {text: "Text 1"});
		var oFormElement = new FormElement(sID + "FE1",{
			label: oLabel,
			fields: [oField]
		});
		var oFormContainer = new FormContainer(sID, {
			formElements: [ oFormElement ]
		});

		oForm.addFormContainer(oFormContainer);
		await nextUIUpdate();

		return oFormContainer;
	}

	async function addElement(oFormContainer, sID) {
		var oLabel = new Label(sID + "L1", {text: "Label 1"});
		var oField = new Text(sID + "T1", {text: "Text 1"});
		var oFormElement = new FormElement(sID,{
			label: oLabel,
			fields: [oField]
		});

		oFormContainer.addFormElement(oFormElement);
		await nextUIUpdate();

		return oFormElement;
	}

	function checkContainerSizeClasses(assert, $Container, iContainer, sSize, iColumns, bFirst, bBreak) {
		assert.ok($Container.hasClass("sapUiFormCLContainer" + sSize + iColumns), "Container" + iContainer + ": Size " + sSize + ": " + iColumns + " columns");
		if (bFirst) {
			assert.ok($Container.hasClass("sapUiFormCLContainer" + sSize + "FirstRow"), "Container" + iContainer + ": Size " + sSize + ": first row");
		} else {
			assert.notOk($Container.hasClass("sapUiFormCLContainer" + sSize + "FirstRow"), "Container" + iContainer + ": Size " + sSize + ": not first row");
		}
		if (bBreak) {
			assert.ok($Container.hasClass("sapUiFormCLContainer" + sSize + "Break"), "Container" + iContainer + ": Size " + sSize + ": line-break");
		} else {
			assert.notOk($Container.hasClass("sapUiFormCLContainer" + sSize + "Break"), "Container" + iContainer + ": Size " + sSize + ": no line-break");
		}
	}

	function checkContainerClasses(assert, $Container, iContainer, iSC, bSF, bSB, iMC, bMF, bMB, iLC, bLF, bLB, iXLC, bXLF, bXLB) {
		checkContainerSizeClasses(assert, $Container, iContainer, "S", iSC, bSF, bSB);
		checkContainerSizeClasses(assert, $Container, iContainer, "M", iMC, bMF, bMB);
		checkContainerSizeClasses(assert, $Container, iContainer, "L", iLC, bLF, bLB);
		checkContainerSizeClasses(assert, $Container, iContainer, "XL", iXLC, bXLF, bXLB);
	}

	function checkElementSizeClasses(assert, $Node, iNode, sSize, iColumns, bBreak, iSpace) {
		assert.ok($Node.hasClass("sapUiFormCLCells" + sSize + iColumns), sSize + ": " + iNode + ". node has has " + iColumns + " cells");
		if (bBreak) {
			assert.ok($Node.hasClass("sapUiFormCLCell" + sSize + "Break"), sSize + ": " + iNode + ". node has line-break");
		} else {
			assert.notOk($Node.hasClass("sapUiFormCLCell" + sSize + "Break"), sSize + ": " + iNode + ". node has no line-break");
		}
		if (iSpace > 0) {
			assert.ok($Node.hasClass("sapUiFormCLCell" + sSize + "Space" + iSpace), sSize + ": " + iNode + ". node has has " + iSpace + " space");
		}
	}

	function checkElementClasses(assert, $Node, iNode, bLabel, sID, iSC, bSB, iSS, iLC, bLB, iLS, bEditable) {
		if (bLabel) {
			assert.ok($Node.hasClass("sapUiFormElementLbl"), iNode + ". child is label node");
			const sNode = bEditable ? "div" : "dt";
			assert.ok($Node.is(sNode), "label node is " + sNode);
		} else {
			assert.notOk($Node.hasClass("sapUiFormElementLbl"), iNode + ". child is no label node");
			const sNode = bEditable ? "div" : "dd";
			assert.ok($Node.is(sNode), "field node is " + sNode);
		}

		assert.equal($Node.children()[0].id, sID, sID + " is content of " + iNode + ". child node");

		checkElementSizeClasses(assert, $Node, iNode, "S", iSC, bSB, iSS);
		checkElementSizeClasses(assert, $Node, iNode, "L", iLC, bLB, iLS);
	}

	QUnit.module("layout rendering", {
		beforeEach: async() => {await initForm(false);},
		afterEach: afterTest
	});

	QUnit.test("default values", function(assert) {
		assert.equal(oColumnLayout.getColumnsM(), 1, "columnsM");
		assert.equal(oColumnLayout.getColumnsL(), 2, "columnsM");
		assert.equal(oColumnLayout.getColumnsXL(), 2, "columnsM");
		assert.equal(oColumnLayout.getLabelCellsLarge(), 4, "labelCellsLarge");
		assert.equal(oColumnLayout.getEmptyCellsLarge(), 0, "emptyCellsLarge");
	});

	QUnit.test("Responsiveness (test case 1)", async function(assert) {

		// arrange
		var done = assert.async();

		// act
		oForm.setWidth("500px");
		await nextUIUpdate();

		// assert
		window.requestAnimationFrame(async function() {
			var fnTest = function(assert) {
				var $Layout = jQuery("#CL1");
				assert.ok($Layout.hasClass("sapUiFormCLMedia-Std-Phone"), "Layout has Phone size");
				assert.notOk($Layout.hasClass("sapUiFormCLMedia-Std-Tablet"), "Layout has not Tablet size");
				assert.notOk($Layout.hasClass("sapUiFormCLMedia-Std-Desktop"), "Layout has not Desktop size");
				assert.notOk($Layout.hasClass("sapUiFormCLMedia-Std-LargeDesktop"), "Layout has not LargeDesktop size");
				assert.ok($Layout.hasClass("sapUiFormCLSmallColumns"), "Layout has small columns");
				assert.notOk($Layout.hasClass("sapUiFormCLWideColumns"), "Layout has not large columns");
			};
			fnTest(assert); // test classes set after rendering

			sinon.stub(oColumnLayout, "onAfterRendering").callsFake(function(oEvent) {
				fnTest(assert); // classes should still exist after re-rendering
				oColumnLayout.onAfterRendering.wrappedMethod.call(this, oEvent);
			});
			oForm.invalidate();
			await nextUIUpdate();
			done();
		});
	});

	QUnit.test("Responsiveness (test case 2)", async function(assert) {

		// arrange
		var done = assert.async();

		// act
		oForm.setWidth("1000px");
		await nextUIUpdate();

		// assert
		window.requestAnimationFrame(async function() {
			var fnTest = function(assert) {
				var $Layout = jQuery("#CL1");
				assert.notOk($Layout.hasClass("sapUiFormCLMedia-Std-Phone"), "Layout has not Phone size");
				assert.ok($Layout.hasClass("sapUiFormCLMedia-Std-Tablet"), "Layout has Tablet size");
				assert.notOk($Layout.hasClass("sapUiFormCLMedia-Std-Desktop"), "Layout has not Desktop size");
				assert.notOk($Layout.hasClass("sapUiFormCLMedia-Std-LargeDesktop"), "Layout has not LargeDesktop size");
				assert.notOk($Layout.hasClass("sapUiFormCLSmallColumns"), "Layout has not small columns");
				assert.ok($Layout.hasClass("sapUiFormCLWideColumns"), "Layout has large columns");
			};
			fnTest(assert); // test classes set after rendering

			sinon.stub(oColumnLayout, "onAfterRendering").callsFake(function(oEvent) {
				fnTest(assert); // classes should still exist after re-rendering
				oColumnLayout.onAfterRendering.wrappedMethod.call(this, oEvent);
			});
			oForm.invalidate();
			await nextUIUpdate();
			done();
		});
	});

	QUnit.test("Responsiveness (test case 3)", async function(assert) {

		// arrange
		var done = assert.async();

		// act
		oForm.setWidth("1300px");
		await nextUIUpdate();

		// assert
		window.requestAnimationFrame(async function() {
			var fnTest = function(assert) {
				var $Layout = jQuery("#CL1");
				assert.notOk($Layout.hasClass("sapUiFormCLMedia-Std-Phone"), "Layout has not Phone size");
				assert.notOk($Layout.hasClass("sapUiFormCLMedia-Std-Tablet"), "Layout has not Tablet size");
				assert.ok($Layout.hasClass("sapUiFormCLMedia-Std-Desktop"), "Layout has Desktop size");
				assert.notOk($Layout.hasClass("sapUiFormCLMedia-Std-LargeDesktop"), "Layout has not LargeDesktop size");
				assert.notOk($Layout.hasClass("sapUiFormCLSmallColumns"), "Layout has not small columns");
				assert.ok($Layout.hasClass("sapUiFormCLWideColumns"), "Layout has large columns");
			};
			fnTest(assert); // test classes set after rendering

			sinon.stub(oColumnLayout, "onAfterRendering").callsFake(function(oEvent) {
				fnTest(assert); // classes should still exist after re-rendering
				oColumnLayout.onAfterRendering.wrappedMethod.call(this, oEvent);
			});
			oForm.invalidate();
			await nextUIUpdate();
			done();
		});
	});

	QUnit.test("Responsiveness (test case 4)", async function(assert) {

		// arrange
		var done = assert.async();

		// act
		oForm.setWidth("1500px");
		await nextUIUpdate();

		// assert
		window.requestAnimationFrame(async function() {
			var fnTest = function(assert) {
				var $Layout = jQuery("#CL1");
				assert.notOk($Layout.hasClass("sapUiFormCLMedia-Std-Phone"), "Layout has not Phone size");
				assert.notOk($Layout.hasClass("sapUiFormCLMedia-Std-Tablet"), "Layout has not Tablet size");
				assert.notOk($Layout.hasClass("sapUiFormCLMedia-Std-Desktop"), "Layout has not Desktop size");
				assert.ok($Layout.hasClass("sapUiFormCLMedia-Std-LargeDesktop"), "Layout has LargeDesktop size");
				assert.notOk($Layout.hasClass("sapUiFormCLSmallColumns"), "Layout has not small columns");
				assert.ok($Layout.hasClass("sapUiFormCLWideColumns"), "Layout has large columns");
			};
			fnTest(assert); // test classes set after rendering

			sinon.stub(oColumnLayout, "onAfterRendering").callsFake(function(oEvent) {
				fnTest(assert); // classes should still exist after re-rendering
				oColumnLayout.onAfterRendering.wrappedMethod.call(this, oEvent);
			});
			oForm.invalidate();
			await nextUIUpdate();
			done();
		});
	});

	QUnit.test("keyboard", function(assert) {
		this.spy(oColumnLayout, "onsapright");
		this.spy(oColumnLayout, "onsapleft");

		qutils.triggerKeydown("CL1", "ARROW_DOWN");
		assert.ok(oColumnLayout.onsapright.called, "sapright called");

		qutils.triggerKeydown("CL1", "ARROW_UP");
		assert.ok(oColumnLayout.onsapright.called, "sapleft called");
	});

	QUnit.test("invalid columns", async function(assert) {
		var oException;

		try {
			oColumnLayout.setColumnsM(2).setColumnsL(3).setColumnsXL(1);
			await nextUIUpdate();
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
	});

	QUnit.module("container rendering", {
		beforeEach: async() => {await initForm(false);},
		afterEach: afterTest
	});

	QUnit.test("One container - default columns", function(assert) {
		var oDomRef = window.document.getElementById("CL1");
		assert.ok(oDomRef, "Layout rendered");

		oDomRef = window.document.getElementById("FC1");
		assert.ok(oDomRef, "Container rendered");
		var $Container = jQuery("#FC1");
		assert.equal($Container.parent().attr("id"), "CL1", "not content DOM element rendered");
		assert.equal($Container.children().length, 1, "only one DOM node in Container");
		assert.equal($Container.children()[0].id, "FC1-content", "content node for Container rendered");
		assert.ok(jQuery($Container.children()[0]).is("dl"), "content node for Container is <dl>");
		assert.notOk($Container.attr("role"), "no role set");
		assert.equal(jQuery("#F1").attr("role"), "form", "role \"form\" set on Form");

		oDomRef = window.document.getElementById("FE1");
		assert.ok(oDomRef, "Element rendered");
		assert.equal(jQuery("#FE1").parent().attr("id"), "FC1-content", "Container content node is parent of Element");

		checkContainerClasses(assert, $Container, 1, 1, true, false, 1, true, false, 2, true, false, 2, true, false);
	});

	QUnit.test("One container - set columns", async function(assert) {
		oColumnLayout.setColumnsM(2).setColumnsL(3).setColumnsXL(4);
		await nextUIUpdate();

		var $Container = jQuery("#FC1");
		checkContainerClasses(assert, $Container, 1, 1, true, false, 2, true, false, 3, true, false, 4, true, false);
	});

	QUnit.test("One container - Title", async function(assert) {
		var oTitle = new Title("Title1", {text: "Title"});
		oFormContainer1.setTitle(oTitle);
		await nextUIUpdate();

		var $Container = jQuery("#FC1");
		assert.equal($Container.children().length, 2, "two DOM nodes in Container");
		assert.equal($Container.children()[0].id, "Title1", "Title rendered");
		assert.equal($Container.children()[1].id, "FC1-content", "content node for Container rendered");
		assert.equal(jQuery($Container.children()[1]).attr("aria-Labelledby"), oTitle.getId(), "content node has aria-labelledby");
		assert.notOk($Container.attr("role"), "no role set on Container");
		assert.notOk($Container.attr("aria-Labelledby"), "Container has no aria-labelledby");
		assert.equal(jQuery("#F1").attr("role"), "region", "role \"region\" set on Form");
	});

	QUnit.test("One container - Toolbar", async function(assert) {
		var oTitle = new Title("Title1", {text: "Title"});
		var oTitle2 = new mTitle("Title2", {text: "Title 2"});
		var oToolbar = new Toolbar("TB1", {content: [oTitle2]});
		oFormContainer1.setTitle(oTitle);
		oFormContainer1.setToolbar(oToolbar);
		await nextUIUpdate();

		var $Container = jQuery("#FC1");
		assert.equal($Container.children().length, 2, "two DOM nodes in Container");
		assert.equal($Container.children()[0].id, "TB1", "Toolbar rendered");
		assert.equal($Container.children()[1].id, "FC1-content", "content node for Container rendered");
		assert.notOk(jQuery($Container.children()[1]).attr("aria-Labelledby"), "content node has no aria-labelledby");
		assert.equal($Container.attr("role"), "region", "role \"region\" set on Container");
		assert.equal($Container.attr("aria-Labelledby"), oTitle2.getId(), "Container has aria-labelledby");
		assert.equal(jQuery("#F1").attr("role"), "region", "role \"region\" set on Form");
	});

	QUnit.test("Expand", async function(assert) {
		var $Container = jQuery("#FC1");
		assert.notOk($Container.hasClass("sapUiFormCLContainerColl"), "container not collapsed");

		oFormContainer1.setExpanded(false);
		assert.ok($Container.hasClass("sapUiFormCLContainerColl"), "container collapsed");

		oFormContainer1.setExpanded(true);
		assert.notOk($Container.hasClass("sapUiFormCLContainerColl"), "container not collapsed");

		oFormContainer1.setExpanded(false);
		oFormContainer1.invalidate(); // to test in renderer
		await nextUIUpdate();
		$Container = jQuery("#FC1");
		assert.ok($Container.hasClass("sapUiFormCLContainerColl"), "container collapsed");
	});

	QUnit.test("Tooltip", async function(assert) {
		var $Container = jQuery("#FC1");
		assert.notOk($Container.attr("title"), "container has no tooltip");

		oFormContainer1.setTooltip("Test");
		await nextUIUpdate();
		$Container = jQuery("#FC1");
		assert.equal($Container.attr("title"), "Test", "container has tooltip");
	});

	QUnit.test("Two containers - default columns", async function(assert) {
		oFormContainer2 = await addContainer("FC2");

		var oDomRef = window.document.getElementById("FC1");
		assert.ok(oDomRef, "Container1 rendered");
		var $Container = jQuery("#FC1");
		assert.ok($Container.parent().hasClass("sapUiFormCLContent"), "content DOM element rendered");
		assert.ok($Container.parent().hasClass("sapUiFormCLColumnsM1"), "M: Layout has 1 column");
		assert.ok($Container.parent().hasClass("sapUiFormCLColumnsL2"), "L: Layout has 2 columns");
		assert.ok($Container.parent().hasClass("sapUiFormCLColumnsXL2"), "XL: Layout has 2 columns");
		assert.notOk($Container.attr("role"), "no role set on Container");
		assert.equal(jQuery("#F1").attr("role"), "region", "role \"region\" set on Form");
		checkContainerClasses(assert, $Container, 1, 1, true, false, 1, true, false, 1, true, false, 1, true, false);

		oDomRef = window.document.getElementById("FC2");
		assert.ok(oDomRef, "Container2 rendered");
		$Container = jQuery("#FC2");
		assert.notOk($Container.attr("role"), "no role set on Container");
		checkContainerClasses(assert, $Container, 2, 1, false, false, 1, false, false, 1, true, false, 1, true, false);
	});

	QUnit.test("Two containers - set columns", async function(assert) {
		oColumnLayout.setColumnsM(2).setColumnsL(3).setColumnsXL(4);
		oFormContainer2 = await addContainer("FC2");

		var $Container = jQuery("#FC1");
		assert.ok($Container.parent().hasClass("sapUiFormCLColumnsM2"), "M: Layout has 2 columns");
		assert.ok($Container.parent().hasClass("sapUiFormCLColumnsL3"), "L: Layout has 3 columns");
		assert.ok($Container.parent().hasClass("sapUiFormCLColumnsXL4"), "XL: Layout has 4 columns");
		checkContainerClasses(assert, $Container, 1, 1, true, false, 1, true, false, 2, true, false, 2, true, false);

		$Container = jQuery("#FC2");
		checkContainerClasses(assert, $Container, 2, 1, false, false, 1, true, false, 1, true, false, 2, true, false);

		// make 2. continer larger zo see if it gets more columns in L
		oFormElement2 = await addElement(oFormContainer2, "FE2");
		$Container = jQuery("#FC1");
		checkContainerClasses(assert, $Container, 1, 1, true, false, 1, true, false, 1, true, false, 2, true, false);
		$Container = jQuery("#FC2");
		checkContainerClasses(assert, $Container, 2, 1, false, false, 1, true, false, 2, true, false, 2, true, false);
	});

	QUnit.test("Two container - first invisible", async function(assert) {
		oFormContainer1.setVisible(false);
		oFormContainer2 = await addContainer("FC2");

		var oDomRef = window.document.getElementById("FC1");
		assert.notOk(oDomRef, "Container1 not rendered");
		oDomRef = window.document.getElementById("FC2");
		assert.ok(oDomRef, "Container2 rendered");
		var $Container = jQuery("#FC2");
		assert.equal($Container.parent().attr("id"), "CL1", "not content DOM element rendered");
		checkContainerClasses(assert, $Container, 2, 1, true, false, 1, true, false, 2, true, false, 2, true, false);
	});

	QUnit.test("Two container - Title", async function(assert) {
		var oTitle = new Title("Title1", {text: "Title"});
		oFormContainer2 = await addContainer("FC2");
		oFormContainer2.setTitle(oTitle);
		await nextUIUpdate();

		var $Container = jQuery("#FC1");
		assert.equal($Container.children().length, 1, "one DOM node in Container");
		assert.equal($Container.children()[0].id, "FC1-content", "content node for Container rendered");
		assert.notOk(jQuery($Container.children()[1]).attr("aria-Labelledby"), "content node has no aria-labelledby");
		assert.notOk($Container.attr("role"), "no role set on Container");
		assert.notOk($Container.attr("aria-Labelledby"), "Container has no aria-labelledby");
		assert.equal(jQuery("#F1").attr("role"), "region", "role \"region\" set on Form");

		$Container = jQuery("#FC2");
		assert.equal($Container.children().length, 2, "two DOM nodes in Container");
		assert.equal($Container.children()[0].id, "Title1", "Title rendered");
		assert.equal($Container.children()[1].id, "FC2-content", "content node for Container rendered");
		assert.equal(jQuery($Container.children()[1]).attr("aria-Labelledby"), oTitle.getId(), "content node has aria-labelledby");
		assert.notOk($Container.attr("role"), "no role set on Container");
		assert.notOk($Container.attr("aria-Labelledby"), "Container has no aria-labelledby");
	});

	QUnit.test("Two container - Toolbar", async function(assert) {
		var oTitle = new mTitle("Title2", {text: "Title 2"});
		var oToolbar = new Toolbar("TB1", {content: [oTitle]});
		oFormContainer2 = await addContainer("FC2");
		oFormContainer2.setToolbar(oToolbar);
		await nextUIUpdate();

		var $Container = jQuery("#FC1");
		assert.equal($Container.children().length, 1, "one DOM node in Container");
		assert.equal($Container.children()[0].id, "FC1-content", "content node for Container rendered");
		assert.notOk(jQuery($Container.children()[1]).attr("aria-Labelledby"), "content node has no aria-labelledby");
		assert.notOk($Container.attr("role"), "no role set on Container");
		assert.notOk($Container.attr("aria-Labelledby"), "Container has no aria-labelledby");
		assert.equal(jQuery("#F1").attr("role"), "region", "role \"region\" set on Form");

		$Container = jQuery("#FC2");
		assert.equal($Container.children().length, 2, "two DOM nodes in Container");
		assert.equal($Container.children()[0].id, "TB1", "Toolbar rendered");
		assert.equal($Container.children()[1].id, "FC2-content", "content node for Container rendered");
		assert.notOk(jQuery($Container.children()[1]).attr("aria-Labelledby"), "content node has no aria-labelledby");
		assert.equal($Container.attr("role"), "region", "role \"region\" set on Container");
		assert.equal($Container.attr("aria-Labelledby"), oTitle.getId(), "Container has aria-labelledby");
	});

	QUnit.test("Three containers - default columns", async function(assert) {
		await addContainer("FC2");
		await addContainer("FC3");

		var oDomRef = window.document.getElementById("FC1");
		assert.ok(oDomRef, "Container1 rendered");
		var $Container = jQuery("#FC1");
		assert.ok($Container.parent().hasClass("sapUiFormCLContent"), "content DOM element rendered");
		checkContainerClasses(assert, $Container, 1, 1, true, false, 1, true, false, 1, true, false, 1, true, false);

		oDomRef = window.document.getElementById("FC2");
		assert.ok(oDomRef, "Container2 rendered");
		$Container = jQuery("#FC2");
		checkContainerClasses(assert, $Container, 2, 1, false, false, 1, false, false, 1, true, false, 1, true, false);

		oDomRef = window.document.getElementById("FC3");
		assert.ok(oDomRef, "Container3 rendered");
		$Container = jQuery("#FC3");
		checkContainerClasses(assert, $Container, 3, 1, false, false, 1, false, false, 1, false, true, 1, false, true);
	});

	QUnit.test("Three containers - set columns", async function(assert) {
		oColumnLayout.setColumnsM(2).setColumnsL(3).setColumnsXL(4);
		await addContainer("FC2");
		await addContainer("FC3");

		var $Container = jQuery("#FC1");
		checkContainerClasses(assert, $Container, 1, 1, true, false, 1, true, false, 1, true, false, 2, true, false);

		$Container = jQuery("#FC2");
		checkContainerClasses(assert, $Container, 2, 1, false, false, 1, true, false, 1, true, false, 1, true, false);

		$Container = jQuery("#FC3");
		checkContainerClasses(assert, $Container, 3, 1, false, false, 1, false, true, 1, true, false, 1, true, false);
	});

	QUnit.test("Four containers - default columns", async function(assert) {
		await addContainer("FC2");
		await addContainer("FC3");
		await addContainer("FC4");

		var oDomRef = window.document.getElementById("FC1");
		assert.ok(oDomRef, "Container1 rendered");
		var $Container = jQuery("#FC1");
		assert.ok($Container.parent().hasClass("sapUiFormCLContent"), "content DOM element rendered");
		checkContainerClasses(assert, $Container, 1, 1, true, false, 1, true, false, 1, true, false, 1, true, false);

		oDomRef = window.document.getElementById("FC2");
		assert.ok(oDomRef, "Container2 rendered");
		$Container = jQuery("#FC2");
		checkContainerClasses(assert, $Container, 2, 1, false, false, 1, false, false, 1, true, false, 1, true, false);

		oDomRef = window.document.getElementById("FC3");
		assert.ok(oDomRef, "Container3 rendered");
		$Container = jQuery("#FC3");
		checkContainerClasses(assert, $Container, 3, 1, false, false, 1, false, false, 1, false, true, 1, false, true);

		oDomRef = window.document.getElementById("FC4");
		assert.ok(oDomRef, "Container4 rendered");
		$Container = jQuery("#FC4");
		checkContainerClasses(assert, $Container, 4, 1, false, false, 1, false, false, 1, false, false, 1, false, false);
	});

	QUnit.test("Four containers - set columns", async function(assert) {
		oColumnLayout.setColumnsM(2).setColumnsL(3).setColumnsXL(4);
		await addContainer("FC2");
		await addContainer("FC3");
		await addContainer("FC4");

		var $Container = jQuery("#FC1");
		assert.ok($Container.parent().hasClass("sapUiFormCLContent"), "content DOM element rendered");
		checkContainerClasses(assert, $Container, 1, 1, true, false, 1, true, false, 1, true, false, 1, true, false);

		$Container = jQuery("#FC2");
		checkContainerClasses(assert, $Container, 2, 1, false, false, 1, true, false, 1, true, false, 1, true, false);

		$Container = jQuery("#FC3");
		checkContainerClasses(assert, $Container, 3, 1, false, false, 1, false, true, 1, true, false, 1, true, false);

		$Container = jQuery("#FC4");
		checkContainerClasses(assert, $Container, 4, 1, false, false, 1, false, false, 1, false, true, 1, true, false);
	});


	QUnit.test("Five containers - default columns", async function(assert) {
		await addContainer("FC2");
		await addContainer("FC3");
		await addContainer("FC4");
		await addContainer("FC5");

		var oDomRef = window.document.getElementById("FC1");
		assert.ok(oDomRef, "Container1 rendered");
		var $Container = jQuery("#FC1");
		assert.ok($Container.parent().hasClass("sapUiFormCLContent"), "content DOM element rendered");
		checkContainerClasses(assert, $Container, 1, 1, true, false, 1, true, false, 1, true, false, 1, true, false);

		oDomRef = window.document.getElementById("FC2");
		assert.ok(oDomRef, "Container2 rendered");
		$Container = jQuery("#FC2");
		checkContainerClasses(assert, $Container, 2, 1, false, false, 1, false, false, 1, true, false, 1, true, false);

		oDomRef = window.document.getElementById("FC3");
		assert.ok(oDomRef, "Container3 rendered");
		$Container = jQuery("#FC3");
		checkContainerClasses(assert, $Container, 3, 1, false, false, 1, false, false, 1, false, true, 1, false, true);

		oDomRef = window.document.getElementById("FC4");
		assert.ok(oDomRef, "Container4 rendered");
		$Container = jQuery("#FC4");
		checkContainerClasses(assert, $Container, 4, 1, false, false, 1, false, false, 1, false, false, 1, false, false);

		oDomRef = window.document.getElementById("FC5");
		assert.ok(oDomRef, "Container5 rendered");
		$Container = jQuery("#FC5");
		checkContainerClasses(assert, $Container, 5, 1, false, false, 1, false, false, 1, false, true, 1, false, true);
	});

	QUnit.test("Five containers - set columns", async function(assert) {
		oColumnLayout.setColumnsM(2).setColumnsL(3).setColumnsXL(4);
		await addContainer("FC2");
		await addContainer("FC3");
		await addContainer("FC4");
		await addContainer("FC5");

		var $Container = jQuery("#FC1");
		assert.ok($Container.parent().hasClass("sapUiFormCLContent"), "content DOM element rendered");
		checkContainerClasses(assert, $Container, 1, 1, true, false, 1, true, false, 1, true, false, 1, true, false);

		$Container = jQuery("#FC2");
		checkContainerClasses(assert, $Container, 2, 1, false, false, 1, true, false, 1, true, false, 1, true, false);

		$Container = jQuery("#FC3");
		checkContainerClasses(assert, $Container, 3, 1, false, false, 1, false, true, 1, true, false, 1, true, false);

		$Container = jQuery("#FC4");
		checkContainerClasses(assert, $Container, 4, 1, false, false, 1, false, false, 1, false, true, 1, true, false);

		$Container = jQuery("#FC5");
		checkContainerClasses(assert, $Container, 5, 1, false, false, 1, false, true, 1, false, false, 1, false, true);
	});

	QUnit.test("Five containers - set columns (M 3, L 4, XL 6 columns)", async function(assert) {
		oColumnLayout.setColumnsM(3).setColumnsL(4).setColumnsXL(6);
		await addContainer("FC2");
		await addContainer("FC3");
		await addContainer("FC4");
		await addContainer("FC5");

		var $Container = jQuery("#FC1");
		assert.ok($Container.parent().hasClass("sapUiFormCLContent"), "content DOM element rendered");
		checkContainerClasses(assert, $Container, 1, 1, true, false, 1, true, false, 1, true, false, 2, true, false);

		$Container = jQuery("#FC2");
		checkContainerClasses(assert, $Container, 2, 1, false, false, 1, true, false, 1, true, false, 1, true, false);

		$Container = jQuery("#FC3");
		checkContainerClasses(assert, $Container, 3, 1, false, false, 1, true, false, 1, true, false, 1, true, false);

		$Container = jQuery("#FC4");
		checkContainerClasses(assert, $Container, 4, 1, false, false, 1, false, true, 1, true, false, 1, true, false);

		$Container = jQuery("#FC5");
		checkContainerClasses(assert, $Container, 5, 1, false, false, 1, false, false, 1, false, true, 1, true, false);
	});

	QUnit.test("ColumnContainerData - One container", async function(assert) {
		var oLayoutData = new ColumnContainerData({columnsM: 1, columnsL: 1, columnsXL: 1});
		oFormContainer1.setLayoutData(oLayoutData);
		await nextUIUpdate();

		var $Container = jQuery("#FC1");
		assert.ok($Container.parent().hasClass("sapUiFormCLContent"), "content DOM element rendered");
		checkContainerClasses(assert, $Container, 1, 1, true, false, 1, true, false, 1, true, false, 1, true, false);
	});

	QUnit.test("ColumnContainerData - two containers", async function(assert) {
		oColumnLayout.setColumnsM(2).setColumnsL(3).setColumnsXL(4);
		var oFormContainer2 = await addContainer("FC2");
		var oLayoutData = new ColumnContainerData({columnsM: 2, columnsL: 2, columnsXL: 3});
		oFormContainer2.setLayoutData(oLayoutData);
		await nextUIUpdate();

		var $Container = jQuery("#FC1");
		checkContainerClasses(assert, $Container, 1, 1, true, false, 1, true, false, 1, true, false, 1, true, false);
		$Container = jQuery("#FC2");
		checkContainerClasses(assert, $Container, 2, 1, false, false, 2, false, true, 2, true, false, 3, true, false);

		oLayoutData.setColumnsM(1).setColumnsL(1).setColumnsXL(1);
		await nextUIUpdate();
		$Container = jQuery("#FC1");
		checkContainerClasses(assert, $Container, 1, 1, true, false, 1, true, false, 2, true, false, 3, true, false);
		$Container = jQuery("#FC2");
		checkContainerClasses(assert, $Container, 2, 1, false, false, 1, true, false, 1, true, false, 1, true, false);

		oFormContainer2.setLayoutData();
		oLayoutData.setColumnsM(2).setColumnsL(3).setColumnsXL(4);
		oFormContainer1.setLayoutData(oLayoutData);
		await nextUIUpdate();
		$Container = jQuery("#FC1");
		checkContainerClasses(assert, $Container, 1, 1, true, false, 2, true, false, 3, true, false, 4, true, false);
		$Container = jQuery("#FC2");
		checkContainerClasses(assert, $Container, 2, 1, false, false, 1, false, true, 1, false, true, 1, false, true);

		oColumnLayout.setColumnsXL(6);
		oLayoutData.setColumnsM(2).setColumnsL(3).setColumnsXL(6);
		await nextUIUpdate();
		$Container = jQuery("#FC1");
		checkContainerClasses(assert, $Container, 1, 1, true, false, 2, true, false, 3, true, false, 6, true, false);
		$Container = jQuery("#FC2");
		checkContainerClasses(assert, $Container, 2, 1, false, false, 1, false, true, 1, false, true, 1, false, true);

	});

	QUnit.test("ColumnContainerData - invalid cells", async function(assert) {
		var oException;

		try {
			var oLayoutData = new ColumnContainerData({columnsM: 2, columnsL: 3, columnsXL: 4});
			oFormContainer1.setLayoutData(oLayoutData);
			await nextUIUpdate();
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
	});

	QUnit.test("order of elements", async function(assert) {
		await addElement(oFormContainer1, "FE2");
		await addElement(oFormContainer1, "FE3");

		var $Content = jQuery("#FC1-content");
		assert.equal($Content.children().length, 3, "Content has 3 children");
		assert.equal($Content.children()[0].id, "FE1", "FormElement1 is first child");
		assert.equal($Content.children()[1].id, "FE2", "FormElement2 is second child");
		assert.equal($Content.children()[2].id, "FE3", "FormElement3 is third child");
	});

	QUnit.test("invisible element", async function(assert) {
		var oFormElement2 = await addElement(oFormContainer1, "FE2");
		oFormElement2.setVisible(false);
		await addElement(oFormContainer1, "FE3");
		await addElement(oFormContainer1, "FE4");

		var $Content = jQuery("#FC1-content");
		assert.equal($Content.children().length, 3, "Content has 2 children");
		assert.equal($Content.children()[0].id, "FE1", "FormElement1 is first child");
		assert.equal($Content.children()[1].id, "FE3", "FormElement3 is second child");
	});

	QUnit.test("getContainerRenderedDomRef", function(assert) {
		var oDom = oColumnLayout.getContainerRenderedDomRef(oFormContainer1);
		assert.ok(oDom, "Dom returned");
		assert.equal(oDom.id, "FC1", "Dom for FormContainer returned");
	});

	// check the different rendering in edit mode (only test related to this are needed)
	QUnit.module("container rendering (editable)", {
		beforeEach: async() => {await initForm(true);},
		afterEach: afterTest
	});

	QUnit.test("One container - default columns", function(assert) {
		var oDomRef = window.document.getElementById("CL1");
		assert.ok(oDomRef, "Layout rendered");

		oDomRef = window.document.getElementById("FC1");
		assert.ok(oDomRef, "Container rendered");
		var $Container = jQuery("#FC1");
		assert.equal($Container.parent().attr("id"), "CL1", "not content DOM element rendered");
		assert.equal($Container.children().length, 1, "only one DOM node in Container");
		assert.equal($Container.children()[0].id, "FC1-content", "content node for Container rendered");
		assert.ok(jQuery($Container.children()[0]).is("div"), "content node for Container is <div>");
		assert.notOk($Container.attr("role"), "no role set");
		assert.equal(jQuery("#F1").attr("role"), "form", "role \"form\" set on Form");

		oDomRef = window.document.getElementById("FE1");
		assert.ok(oDomRef, "Element rendered");
		assert.equal(jQuery("#FE1").parent().attr("id"), "FC1-content", "Container content node is parent of Element");

		checkContainerClasses(assert, $Container, 1, 1, true, false, 1, true, false, 2, true, false, 2, true, false);
	});

	QUnit.test("One container - Title", async function(assert) {
		var oTitle = new Title("Title1", {text: "Title"});
		oFormContainer1.setTitle(oTitle);
		await nextUIUpdate();

		var $Container = jQuery("#FC1");
		assert.equal($Container.children().length, 2, "two DOM nodes in Container");
		assert.equal($Container.children()[0].id, "Title1", "Title rendered");
		assert.equal($Container.children()[1].id, "FC1-content", "content node for Container rendered");
		assert.notOk(jQuery($Container.children()[1]).attr("aria-Labelledby"), "content node has no aria-labelledby");
		assert.equal($Container.attr("role"), "form", "role \"form\" set on Container");
		assert.equal($Container.attr("aria-Labelledby"), oTitle.getId(), "Container has aria-labelledby");
		assert.equal(jQuery("#F1").attr("role"), "region", "role \"region\" set on Form");
	});

	QUnit.test("One container - Toolbar", async function(assert) {
		var oTitle = new Title("Title1", {text: "Title"});
		var oTitle2 = new mTitle("Title2", {text: "Title 2"});
		var oToolbar = new Toolbar("TB1", {content: [oTitle2]});
		oFormContainer1.setTitle(oTitle);
		oFormContainer1.setToolbar(oToolbar);
		await nextUIUpdate();

		var $Container = jQuery("#FC1");
		assert.equal($Container.children().length, 2, "two DOM nodes in Container");
		assert.equal($Container.children()[0].id, "TB1", "Toolbar rendered");
		assert.equal($Container.children()[1].id, "FC1-content", "content node for Container rendered");
		assert.notOk(jQuery($Container.children()[1]).attr("aria-Labelledby"), "content node has no aria-labelledby");
		assert.equal($Container.attr("role"), "form", "role \"form\" set on Container");
		assert.equal($Container.attr("aria-Labelledby"), oTitle2.getId(), "Container has aria-labelledby");
		assert.equal(jQuery("#F1").attr("role"), "region", "role \"region\" set on Form");
	});

	QUnit.test("Two containers - default columns", async function(assert) {
		oFormContainer2 = await addContainer("FC2");

		var oDomRef = window.document.getElementById("FC1");
		assert.ok(oDomRef, "Container1 rendered");
		var $Container = jQuery("#FC1");
		assert.ok($Container.parent().hasClass("sapUiFormCLContent"), "content DOM element rendered");
		assert.ok($Container.parent().hasClass("sapUiFormCLColumnsM1"), "M: Layout has 1 column");
		assert.ok($Container.parent().hasClass("sapUiFormCLColumnsL2"), "L: Layout has 2 columns");
		assert.ok($Container.parent().hasClass("sapUiFormCLColumnsXL2"), "XL: Layout has 2 columns");
		assert.equal($Container.attr("role"), "form", "role \"form\" set on Container");
		assert.equal(jQuery("#F1").attr("role"), "region", "role \"region\" set on Form");
		checkContainerClasses(assert, $Container, 1, 1, true, false, 1, true, false, 1, true, false, 1, true, false);

		oDomRef = window.document.getElementById("FC2");
		assert.ok(oDomRef, "Container2 rendered");
		$Container = jQuery("#FC2");
		assert.equal($Container.attr("role"), "form", "role \"form\" set on Container");
		checkContainerClasses(assert, $Container, 2, 1, false, false, 1, false, false, 1, true, false, 1, true, false);
	});

	QUnit.test("Two container - Title", async function(assert) {
		var oTitle = new Title("Title1", {text: "Title"});
		oFormContainer2 = await addContainer("FC2");
		oFormContainer2.setTitle(oTitle);
		await nextUIUpdate();

		var $Container = jQuery("#FC1");
		assert.equal($Container.children().length, 1, "one DOM node in Container");
		assert.equal($Container.children()[0].id, "FC1-content", "content node for Container rendered");
		assert.notOk(jQuery($Container.children()[1]).attr("aria-Labelledby"), "content node has no aria-labelledby");
		assert.equal($Container.attr("role"), "form", "role \"form\" set on Container");
		assert.notOk($Container.attr("aria-Labelledby"), "Container has no aria-labelledby");
		assert.equal(jQuery("#F1").attr("role"), "region", "role \"region\" set on Form");

		$Container = jQuery("#FC2");
		assert.equal($Container.children().length, 2, "two DOM nodes in Container");
		assert.equal($Container.children()[0].id, "Title1", "Title rendered");
		assert.equal($Container.children()[1].id, "FC2-content", "content node for Container rendered");
		assert.notOk(jQuery($Container.children()[1]).attr("aria-Labelledby"), "content node has no aria-labelledby");
		assert.equal($Container.attr("role"), "form", "role \"form\" set on Container");
		assert.equal($Container.attr("aria-Labelledby"), oTitle.getId(), "Container has aria-labelledby");
	});

	QUnit.test("Two container - Toolbar", async function(assert) {
		var oTitle = new mTitle("Title2", {text: "Title 2"});
		var oToolbar = new Toolbar("TB1", {content: [oTitle]});
		oFormContainer2 = await addContainer("FC2");
		oFormContainer2.setToolbar(oToolbar);
		await nextUIUpdate();

		var $Container = jQuery("#FC1");
		assert.equal($Container.children().length, 1, "one DOM node in Container");
		assert.equal($Container.children()[0].id, "FC1-content", "content node for Container rendered");
		assert.notOk(jQuery($Container.children()[1]).attr("aria-Labelledby"), "content node has no aria-labelledby");
		assert.equal($Container.attr("role"), "form", "role \"form\" set on Container");
		assert.notOk($Container.attr("aria-Labelledby"), "Container has no aria-labelledby");
		assert.equal(jQuery("#F1").attr("role"), "region", "role \"region\" set on Form");

		$Container = jQuery("#FC2");
		assert.equal($Container.children().length, 2, "two DOM nodes in Container");
		assert.equal($Container.children()[0].id, "TB1", "Toolbar rendered");
		assert.equal($Container.children()[1].id, "FC2-content", "content node for Container rendered");
		assert.notOk(jQuery($Container.children()[1]).attr("aria-Labelledby"), "content node has no aria-labelledby");
		assert.equal($Container.attr("role"), "form", "role \"form\" set on Container");
		assert.equal($Container.attr("aria-Labelledby"), oTitle.getId(), "Container has aria-labelledby");
	});

	QUnit.module("element rendering", {
		beforeEach: async() => {await initForm(false);},
		afterEach: afterTest
	});

	QUnit.test("Label with one field", function(assert) {
		var $Element = jQuery("#FE1");
		var aChildren = $Element.children();
		assert.equal(aChildren.length, 2, "Element has 2 child nodes");
		checkElementClasses(assert, jQuery(aChildren[0]), 1, true, "L1", 12, false, 0, 4, false, 0, false);
		checkElementClasses(assert, jQuery(aChildren[1]), 2, false, "T1", 12, false, 0, 8, false, 0, false);
		assert.ok(jQuery("#T1").attr("style").indexOf("100%") > 0, "Control width set to 100%");
	});

	QUnit.test("One field without label", async function(assert) {
		oFormElement1.destroyLabel();
		await nextUIUpdate();
		var $Element = jQuery("#FE1");
		var aChildren = $Element.children();
		assert.equal(aChildren.length, 1, "Element has 1 child nodes");
		checkElementClasses(assert, jQuery(aChildren[0]), 1, false, "T1", 12, false, 0, 12, false, 0, false);
	});

	QUnit.test("Label with two fields", async function(assert) {
		oFormElement1.addField(new Text("T2", {text: "Text2"}));
		await nextUIUpdate();

		var $Element = jQuery("#FE1");
		var aChildren = $Element.children();
		assert.equal(aChildren.length, 3, "Element has 3 child nodes");
		checkElementClasses(assert, jQuery(aChildren[0]), 1, true, "L1", 12, false, 0, 4, false, 0, false);
		checkElementClasses(assert, jQuery(aChildren[1]), 2, false, "T1", 6, false, 0, 4, false, 0, false);
		checkElementClasses(assert, jQuery(aChildren[2]), 3, false, "T2", 6, false, 0, 4, false, 0, false);
	});

	QUnit.test("Label with three fields", async function(assert) {
		oFormElement1.addField(new Text("T2", {text: "Text2"}));
		oFormElement1.addField(new Text("T3", {text: "Text3"}));
		await nextUIUpdate();

		var $Element = jQuery("#FE1");
		var aChildren = $Element.children();
		assert.equal(aChildren.length, 4, "Element has 4 child nodes");
		checkElementClasses(assert, jQuery(aChildren[0]), 1, true, "L1", 12, false, 0, 4, false, 0, false);
		checkElementClasses(assert, jQuery(aChildren[1]), 2, false, "T1", 4, false, 0, 4, false, 0, false);
		checkElementClasses(assert, jQuery(aChildren[2]), 3, false, "T2", 4, false, 0, 2, false, 0, false);
		checkElementClasses(assert, jQuery(aChildren[3]), 4, false, "T3", 4, false, 0, 2, false, 0, false);
	});

	QUnit.test("Label with 10 fields", async function(assert) {
		oFormElement1.addField(new Text("T2", {text: "Text2"}));
		oFormElement1.addField(new Text("T3", {text: "Text3"}));
		oFormElement1.addField(new Text("T4", {text: "Text4"}));
		oFormElement1.addField(new Text("T5", {text: "Text5"}));
		oFormElement1.addField(new Text("T6", {text: "Text6"}));
		oFormElement1.addField(new Text("T7", {text: "Text7"}));
		oFormElement1.addField(new Text("T8", {text: "Text8"}));
		oFormElement1.addField(new Text("T9", {text: "Text9"}));
		oFormElement1.addField(new Text("T10", {text: "Text10"}));
		await nextUIUpdate();

		var $Element = jQuery("#FE1");
		var aChildren = $Element.children();
		assert.equal(aChildren.length, 11, "Element has 11 child nodes");
		checkElementClasses(assert, jQuery(aChildren[0]), 1, true, "L1", 12, false, 0, 4, false, 0, false);
		checkElementClasses(assert, jQuery(aChildren[1]), 2, false, "T1", 3, false, 0, 1, false, 0, false);
		checkElementClasses(assert, jQuery(aChildren[2]), 3, false, "T2", 1, false, 0, 1, false, 0, false);
		checkElementClasses(assert, jQuery(aChildren[3]), 4, false, "T3", 1, false, 0, 1, false, 0, false);
		checkElementClasses(assert, jQuery(aChildren[4]), 5, false, "T4", 1, false, 0, 1, false, 0, false);
		checkElementClasses(assert, jQuery(aChildren[5]), 6, false, "T5", 1, false, 0, 1, false, 0, false);
		checkElementClasses(assert, jQuery(aChildren[6]), 7, false, "T6", 1, false, 0, 1, false, 0, false);
		checkElementClasses(assert, jQuery(aChildren[7]), 8, false, "T7", 1, false, 0, 1, false, 0, false);
		checkElementClasses(assert, jQuery(aChildren[8]), 9, false, "T8", 1, false, 0, 1, false, 0, false);
		checkElementClasses(assert, jQuery(aChildren[9]), 10, false, "T9", 1, false, 0, 4, true, 4, false);
		checkElementClasses(assert, jQuery(aChildren[10]), 11, false, "T10", 1, false, 0, 4, false, 0);
	});

	QUnit.test("Label with 15 fields", async function(assert) {
		oFormElement1.addField(new Text("T2", {text: "Text2"}));
		oFormElement1.addField(new Text("T3", {text: "Text3"}));
		oFormElement1.addField(new Text("T4", {text: "Text4"}));
		oFormElement1.addField(new Text("T5", {text: "Text5"}));
		oFormElement1.addField(new Text("T6", {text: "Text6"}));
		oFormElement1.addField(new Text("T7", {text: "Text7"}));
		oFormElement1.addField(new Text("T8", {text: "Text8"}));
		oFormElement1.addField(new Text("T9", {text: "Text9"}));
		oFormElement1.addField(new Text("T10", {text: "Text10"}));
		oFormElement1.addField(new Text("T11", {text: "Text11"}));
		oFormElement1.addField(new Text("T12", {text: "Text12"}));
		oFormElement1.addField(new Text("T13", {text: "Text13"}));
		oFormElement1.addField(new Text("T14", {text: "Text14"}));
		oFormElement1.addField(new Text("T15", {text: "Text15"}));
		await nextUIUpdate();

		var $Element = jQuery("#FE1");
		var aChildren = $Element.children();
		assert.equal(aChildren.length, 16, "Element has 16 child nodes");
		checkElementClasses(assert, jQuery(aChildren[0]), 1, true, "L1", 12, false, 0, 4, false, 0, false);
		checkElementClasses(assert, jQuery(aChildren[1]), 2, false, "T1", 1, false, 0, 1, false, 0, false);
		checkElementClasses(assert, jQuery(aChildren[2]), 3, false, "T2", 1, false, 0, 1, false, 0, false);
		checkElementClasses(assert, jQuery(aChildren[3]), 4, false, "T3", 1, false, 0, 1, false, 0, false);
		checkElementClasses(assert, jQuery(aChildren[4]), 5, false, "T4", 1, false, 0, 1, false, 0, false);
		checkElementClasses(assert, jQuery(aChildren[5]), 6, false, "T5", 1, false, 0, 1, false, 0, false);
		checkElementClasses(assert, jQuery(aChildren[6]), 7, false, "T6", 1, false, 0, 1, false, 0, false);
		checkElementClasses(assert, jQuery(aChildren[7]), 8, false, "T7", 1, false, 0, 1, false, 0, false);
		checkElementClasses(assert, jQuery(aChildren[8]), 9, false, "T8", 1, false, 0, 1, false, 0, false);
		checkElementClasses(assert, jQuery(aChildren[9]), 10, false, "T9", 1, false, 0, 2, true, 4, false);
		checkElementClasses(assert, jQuery(aChildren[10]), 11, false, "T10", 1, false, 0, 1, false, 0, false);
		checkElementClasses(assert, jQuery(aChildren[11]), 12, false, "T11", 1, false, 0, 1, false, 0, false);
		checkElementClasses(assert, jQuery(aChildren[12]), 13, false, "T12", 1, false, 0, 1, false, 0, false);
		checkElementClasses(assert, jQuery(aChildren[13]), 14, false, "T13", 4, true, 0, 1, false, 0, false);
		checkElementClasses(assert, jQuery(aChildren[14]), 15, false, "T14", 4, false, 0, 1, false, 0, false);
		checkElementClasses(assert, jQuery(aChildren[15]), 16, false, "T15", 4, false, 0, 1, false, 0, false);
	});

	QUnit.test("ColumnElementData on label", async function(assert) {
		var oLayoutData = new ColumnElementData({cellsLarge: 12, cellsSmall: 5});
		oLabel1.setLayoutData(oLayoutData);
		await nextUIUpdate();

		var $Element = jQuery("#FE1");
		var aChildren = $Element.children();
		checkElementClasses(assert, jQuery(aChildren[0]), 1, true, "L1", 5, false, 0, 12, false, 0, false);
		checkElementClasses(assert, jQuery(aChildren[1]), 2, false, "T1", 7, false, 0, 12, false, 0, false);
	});

	QUnit.test("ColumnElementData on label with -1", async function(assert) {
		var oLayoutData = new ColumnElementData({cellsLarge: -1, cellsSmall: -1});
		oLabel1.setLayoutData(oLayoutData);
		await nextUIUpdate();

		var $Element = jQuery("#FE1");
		var aChildren = $Element.children();
		checkElementClasses(assert, jQuery(aChildren[0]), 1, true, "L1", 12, false, 0, 4, false, 0, false);
		checkElementClasses(assert, jQuery(aChildren[1]), 2, false, "T1", 12, false, 0, 8, false, 0, false);
	});

	QUnit.test("ColumnElementData on field", async function(assert) {
		oFormElement1.addField(new Text("T2", {text: "Text2", layoutData: new ColumnElementData({cellsLarge: -1, cellsSmall: -1})}));
		var oLayoutData = new ColumnElementData({cellsLarge: 1, cellsSmall: 1});
		oField1.setLayoutData(oLayoutData);
		await nextUIUpdate();

		var $Element = jQuery("#FE1");
		var aChildren = $Element.children();
		checkElementClasses(assert, jQuery(aChildren[0]), 1, true, "L1", 12, false, 0, 4, false, 0, false);
		checkElementClasses(assert, jQuery(aChildren[1]), 2, false, "T1", 1, false, 0, 1, false, 0, false);
		checkElementClasses(assert, jQuery(aChildren[2]), 3, false, "T2", 11, false, 0, 7, false, 0, false);
	});

	QUnit.test("ColumnElementData on label and field", async function(assert) {
		var oLayoutData = new ColumnElementData({cellsLarge: 3, cellsSmall: 3});
		oLabel1.setLayoutData(oLayoutData);
		oLayoutData = new ColumnElementData({cellsLarge: 5, cellsSmall: 5});
		oField1.setLayoutData(oLayoutData);
		await nextUIUpdate();

		var $Element = jQuery("#FE1");
		var aChildren = $Element.children();
		checkElementClasses(assert, jQuery(aChildren[0]), 1, true, "L1", 3, false, 0, 3, false, 0, false);
		checkElementClasses(assert, jQuery(aChildren[1]), 2, false, "T1", 5, false, 0, 5, false, 0, false);

		oLayoutData.setCellsLarge(10).setCellsSmall(10);
		await nextUIUpdate();
		$Element = jQuery("#FE1");
		aChildren = $Element.children();
		checkElementClasses(assert, jQuery(aChildren[1]), 2, false, "T1", 10, true, 0, 10, true, 0, false);
	});

	QUnit.test("ColumnElementData on label and fields", async function(assert) {
		oField2 = new Text("T2", {text: "Text2"});
		oField3 = new Text("T3", {text: "Text3"});
		oFormElement1.addField(oField2);
		oFormElement1.addField(oField3);
		var oLayoutData = new ColumnElementData({cellsLarge: 3, cellsSmall: 12});
		oLabel1.setLayoutData(oLayoutData);
		oLayoutData = new ColumnElementData({cellsLarge: 8, cellsSmall: 11});
		oField1.setLayoutData(oLayoutData);
		oLayoutData = new ColumnElementData({cellsLarge: 5, cellsSmall: 5});
		oField3.setLayoutData(oLayoutData);
		await nextUIUpdate();

		var $Element = jQuery("#FE1");
		var aChildren = $Element.children();
		checkElementClasses(assert, jQuery(aChildren[0]), 1, true, "L1", 12, false, 0, 3, false, 0, false);
		checkElementClasses(assert, jQuery(aChildren[1]), 2, false, "T1", 11, false, 0, 8, false, 0, false);
		checkElementClasses(assert, jQuery(aChildren[2]), 3, false, "T2", 1, false, 0, 1, false, 0, false);
		checkElementClasses(assert, jQuery(aChildren[3]), 4, false, "T3", 5, true, 0, 5, true, 3, false);

		oLayoutData.setCellsLarge(10).setCellsSmall(5);
		oLayoutData = oLabel1.getLayoutData();
		oLayoutData.setCellsLarge(3).setCellsSmall(2);
		await nextUIUpdate();
		$Element = jQuery("#FE1");
		aChildren = $Element.children();
		checkElementClasses(assert, jQuery(aChildren[1]), 2, false, "T1", 11, false, 0, 8, false, 0, false);
		checkElementClasses(assert, jQuery(aChildren[2]), 3, false, "T2", 1, false, 0, 1, false, 0, false);
		checkElementClasses(assert, jQuery(aChildren[3]), 4, false, "T3", 5, true, 2, 10, true, 0, false);
	});

	QUnit.test("Tooltip", async function(assert) {
		var $Element = jQuery("#FE1");
		assert.notOk($Element.attr("title"), "Element has no tooltip");

		oFormElement1.setTooltip("Test");
		await nextUIUpdate();
		$Element = jQuery("#FE1");
		assert.equal($Element.attr("title"), "Test", "element has tooltip");
	});

	QUnit.test("getElementRenderedDomRef", function(assert) {
		var oDom = oColumnLayout.getElementRenderedDomRef(oFormElement1);
		assert.ok(oDom, "Dom returned");
		assert.equal(oDom.id, "FE1", "FormElemnt Dom returened");
	});

	QUnit.test("invalid content", async function(assert) {
		var oToolbar = new Toolbar("TB1");
		var oException;

		try {
			oFormElement1.addField(oToolbar);
			await nextUIUpdate();
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
		oToolbar.destroy();
	});

	QUnit.module("element rendering (editable)", {
		beforeEach: async() => {await initForm(true);},
		afterEach: afterTest
	});

	QUnit.test("Label with one field", function(assert) {
		var $Element = jQuery("#FE1");
		var aChildren = $Element.children();
		assert.equal(aChildren.length, 2, "Element has 2 child nodes");
		checkElementClasses(assert, jQuery(aChildren[0]), 1, true, "L1", 12, false, 0, 4, false, 0, true);
		checkElementClasses(assert, jQuery(aChildren[1]), 2, false, "T1", 12, false, 0, 8, false, 0, true);
		assert.ok(jQuery("#T1").attr("style").indexOf("100%") > 0, "Control width set to 100%");
	});

	QUnit.test("One field without label", async function(assert) {
		oFormElement1.destroyLabel();
		await nextUIUpdate();
		var $Element = jQuery("#FE1");
		var aChildren = $Element.children();
		assert.equal(aChildren.length, 1, "Element has 1 child nodes");
		checkElementClasses(assert, jQuery(aChildren[0]), 1, false, "T1", 12, false, 0, 12, false, 0, true);
	});

	QUnit.test("Label with two fields", async function(assert) {
		oFormElement1.addField(new Text("T2", {text: "Text2"}));
		await nextUIUpdate();

		var $Element = jQuery("#FE1");
		var aChildren = $Element.children();
		assert.equal(aChildren.length, 3, "Element has 3 child nodes");
		checkElementClasses(assert, jQuery(aChildren[0]), 1, true, "L1", 12, false, 0, 4, false, 0, true);
		checkElementClasses(assert, jQuery(aChildren[1]), 2, false, "T1", 6, false, 0, 4, false, 0, true);
		checkElementClasses(assert, jQuery(aChildren[2]), 3, false, "T2", 6, false, 0, 4, false, 0, true);
	});

	var myTypeCheck = function(vTypeName) {
		if (vTypeName === "sap.ui.core.ISemanticFormContent") {
			return true;
		} else {
			return this.getMetadata().isA(vTypeName);
		}
	};
	Link.prototype.isA = myTypeCheck;

	QUnit.module("semantic element rendering", {
		beforeEach: async function() {
			Link.prototype.getFormRenderAsControl = function() {return true;}; // TODO: remove after Link supports this
			Link.prototype.getFormObservingProperties = function() {return ["text"];};
			oColumnLayout = new ColumnLayout("CL1");
			oLabel1 = new Label("L1", {text: "Label 1"});
			oField1 = new Link("Link1", {text: "Text 1"});
			oField2 = new Link("Link2", {text: "Text2"});
			oFormElement1 = new SemanticFormElement("FE1",{
				label: oLabel1,
				fields: [oField1, oField2]
			});
			oFormContainer1 = new FormContainer("FC1",{
				formElements: [ oFormElement1 ]
			});
			var aFormContainers = [oFormContainer1];

			oForm = new Form("F1", {
				layout: oColumnLayout,
				editable: false,
				formContainers: aFormContainers
			}).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			delete Link.prototype.getFormRenderAsControl;
			delete Link.prototype.getFormObservingProperties;
			afterTest();
		}
	});

	QUnit.test("getLayoutDataForDelimiter", function(assert) {
		var oLayoutData = oColumnLayout.getLayoutDataForDelimiter();
		assert.ok(oLayoutData, "LayoutData returned");
		assert.ok(oLayoutData && oLayoutData.isA("sap.ui.layout.form.ColumnElementData"), "ColumnElementData returned");
		assert.equal(oLayoutData && oLayoutData.getCellsLarge(), 1, "cellsLarge");
		assert.equal(oLayoutData && oLayoutData.getCellsSmall(), 1, "cellsSmall");

		// test for promise
		var oStub = this.stub(sap.ui, "require");
		oStub.withArgs("sap/ui/layout/form/ColumnElementData").onFirstCall().returns(undefined);
		oStub.callThrough();

		oLayoutData = oColumnLayout.getLayoutDataForDelimiter();
		assert.ok(oLayoutData instanceof Promise, "Promise returned");
		if (oLayoutData instanceof Promise) {
			var fnDone = assert.async();
			oLayoutData.then(function(oLayoutData) {
				assert.ok(oLayoutData, "LayoutData returned");
				assert.ok(oLayoutData && oLayoutData.isA("sap.ui.layout.form.ColumnElementData"), "ColumnElementData returned");
				assert.equal(oLayoutData && oLayoutData.getCellsLarge(), 1, "cellsLarge");
				assert.equal(oLayoutData && oLayoutData.getCellsSmall(), 1, "cellsSmall");
				fnDone();
			});
		}

		oStub.restore();
	});

	QUnit.test("getLayoutDataForSemanticField", function(assert) {
		var oLayoutData = oColumnLayout.getLayoutDataForSemanticField(2, 1);
		assert.ok(oLayoutData, "LayoutData returned");
		assert.ok(oLayoutData && oLayoutData.isA("sap.ui.layout.form.ColumnElementData"), "ColumnElementData returned");
		assert.equal(oLayoutData && oLayoutData.getCellsLarge(), -1, "cellsLarge");
		assert.equal(oLayoutData && oLayoutData.getCellsSmall(), 11, "cellsSmall");

		var oLayoutData2 = oColumnLayout.getLayoutDataForSemanticField(2, 1, oLayoutData);
		assert.ok(oLayoutData, "LayoutData returned");
		assert.ok(oLayoutData && oLayoutData.isA("sap.ui.layout.form.ColumnElementData"), "ColumnElementData returned");
		assert.equal(oLayoutData && oLayoutData.getCellsLarge(), -1, "cellsLarge");
		assert.equal(oLayoutData && oLayoutData.getCellsSmall(), 11, "cellsSmall");
		assert.equal(oLayoutData, oLayoutData2, "LayoutData just updated, no new instance");

		oLayoutData.destroy();
		oLayoutData2.destroy();

		// test for promise
		var oStub = this.stub(sap.ui, "require");
		oStub.withArgs("sap/ui/layout/form/ColumnElementData").onFirstCall().returns(undefined);
		oStub.callThrough();

		oLayoutData = oColumnLayout.getLayoutDataForSemanticField(3, 3);
		assert.ok(oLayoutData instanceof Promise, "Promise returned");
		if (oLayoutData instanceof Promise) {
			var fnDone = assert.async();
			oLayoutData.then(function(oLayoutData) {
				assert.ok(oLayoutData, "LayoutData returned");
				assert.ok(oLayoutData && oLayoutData.isA("sap.ui.layout.form.ColumnElementData"), "ColumnElementData returned");
				assert.equal(oLayoutData && oLayoutData.getCellsLarge(), -1, "cellsLarge");
				assert.equal(oLayoutData && oLayoutData.getCellsSmall(), 11, "cellsSmall");
				oLayoutData.destroy();
				fnDone();
			});
		}

		oStub.restore();
	});

	QUnit.test("renderControlsForSemanticElement", function(assert) {
		assert.ok(oColumnLayout.renderControlsForSemanticElement(), "control rendering supported");
	});

	QUnit.test("rendering", function(assert) {
		var $Element = jQuery("#FE1");
		var aChildren = $Element.children();
		assert.equal(aChildren.length, 2, "Element has 2 child nodes");
		checkElementClasses(assert, jQuery(aChildren[0]), 1, true, "L1", 12, false, 0, 4, false, 0, false);
		checkElementClasses(assert, jQuery(aChildren[1]), 2, false, "Link1", 12, false, 0, 8, false, 0, false);

		var aContent = jQuery(aChildren[1]).children();
		assert.equal(aContent.length, 3, "Cell has 3 content nodes");
		assert.equal(aContent[0].id, "Link1", "Link is first content");
		assert.equal(aContent[1].id, "FE1-delimiter-0", "Delemiter is second content");
		assert.equal(aContent[2].id, "Link2", "Link is third content");

		assert.ok(jQuery("#Link1").attr("style").indexOf("100%") > 0 && jQuery("#Link1").attr("style").indexOf("max-width") >= 0, "Control max-width set to 100%");
		assert.ok(jQuery("#Link2").attr("style").indexOf("100%") > 0 && jQuery("#Link2").attr("style").indexOf("max-width") >= 0, "Control max-width set to 100%");
	});

	QUnit.test("rendering (editable)", async function(assert) {
		sinon.spy(oForm, "invalidate");
		oForm.setEditable(true);
		assert.ok(oForm.invalidate.calledOnce, "Form invalidated");
		await nextUIUpdate();
		var $Element = jQuery("#FE1");
		var aChildren = $Element.children();
		assert.equal(aChildren.length, 4, "Element has 4 child nodes");
		checkElementClasses(assert, jQuery(aChildren[0]), 1, true, "L1", 12, false, 0, 4, false, 0, true);
		checkElementClasses(assert, jQuery(aChildren[1]), 2, false, "Link1", 11, false, 0, 4, false, 0, true);
		checkElementClasses(assert, jQuery(aChildren[2]), 3, false, "FE1-delimiter-0", 1, false, 0, 1, false, 0, true);
		checkElementClasses(assert, jQuery(aChildren[3]), 4, false, "Link2", 11, true, 0, 3, false, 0, true);
	});

});
