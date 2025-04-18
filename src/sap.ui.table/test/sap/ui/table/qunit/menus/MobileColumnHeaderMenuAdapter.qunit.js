/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/Column",
	"sap/ui/table/menus/MobileColumnHeaderMenuAdapter",
	"sap/m/library",
	"sap/m/table/columnmenu/Menu",
	"sap/m/table/columnmenu/QuickAction",
	"sap/m/table/columnmenu/QuickSort",
	"sap/m/table/columnmenu/QuickSortItem",
	"sap/m/table/columnmenu/Item",
	"sap/m/table/columnmenu/ItemContainer",
	"sap/m/Button",
	"sap/ui/core/library",
	"sap/ui/Device",
	"sap/ui/model/type/Integer"
], function(
	Library,
	TableQUnitUtils,
	qutils,
	TableUtils,
	Column,
	MobileColumnHeaderMenuAdapter,
	MLibrary,
	ColumnMenu,
	QuickAction,
	QuickSort,
	QuickSortItem,
	Item,
	ItemContainer,
	Button,
	CoreLibrary,
	Device,
	IntegerType
) {
	"use strict";

	QUnit.module("Menu entries and interaction", {
		beforeEach: function() {
			this.oMenu1 = new ColumnMenu({
				quickActions: [
					new QuickSort({
						items: new QuickSortItem({
							key: "CustomQuickSort",
							label: "Custom Quick Sort"
						})
					}),
					new QuickAction({
						label: "Custom Quick Filter",
						content: new Button({text: "Execute B"}),
						category: MLibrary.table.columnmenu.Category.Filter
					})
				],
				items: [new Item({label: "Item C", icon: "sap-icon://sort"})]
			});
			this.oColumn1 = TableQUnitUtils.createTextColumn({label: "Menu with custom items"});
			this.oColumn1.setSortProperty("F");
			/** @deprecated As of version 1.120 */
			this.oColumn1.setSorted(true);
			this.oColumn1.setSortOrder(CoreLibrary.SortOrder.Descending);
			this.oColumn1.setFilterProperty("F");
			this.oColumn1.setFilterValue("initial filter value");
			this.oColumn1.setHeaderMenu(this.oMenu1);

			this.oMenu2 = new ColumnMenu();
			this.oColumn2 = TableQUnitUtils.createTextColumn({label: "Menu without custom items"});
			this.oColumn2.setSortProperty("G");
			this.oColumn2.setFilterProperty("G");
			this.oColumn2.setHeaderMenu(this.oMenu2);

			this.oTable = TableQUnitUtils.createTable({
				columns: [this.oColumn1, this.oColumn2],
				enableGrouping: true,
				enableColumnFreeze: true
			});

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oMenu1.destroy();
			this.oMenu2.destroy();
			this.oTable.destroy();
		},
		openColumnMenu: function(iColumnIndex) {
			const oElement = this.oTable.qunit.getColumnHeaderCell(iColumnIndex);

			oElement.focus();
			qutils.triggerMouseEvent(oElement, "mousedown", null, null, null, null, 0);
			qutils.triggerMouseEvent(oElement, "click");

			return new Promise(function(resolve) {
				const oMenu = this["oMenu" + (iColumnIndex + 1)];

				if (oMenu.isOpen()) {
					resolve();
				} else {
					oMenu.attachEventOnce("beforeOpen", resolve);
				}
			}.bind(this));
		},
		closeMenu: function(oMenu) {
			oMenu.close();
			return new Promise(function(resolve) {
				if (!oMenu._oPopover.isOpen()) {
					resolve();
				} else {
					oMenu._oPopover.attachEventOnce("afterClose", resolve);
				}
			});
		},
		getQuickAction: function(oMenu, sType) {
			const aQuickActions = oMenu.getAggregation("_quickActions").filter(function(oQuickAction) {
				return oQuickAction.isA("sap.m.table.columnmenu." + sType);
			});

			return sType === "QuickAction" ? aQuickActions : aQuickActions[0];
		}
	});

	QUnit.test("Menu entries", function(assert) {
		const that = this;
		let oColumn; let oMenu;

		return this.openColumnMenu(0).then(function() {
			oColumn = that.oTable.getColumns()[0];
			oMenu = oColumn.getHeaderMenuInstance();

			const oQuickSort = that.getQuickAction(oMenu, "QuickSort");
			const aQuickSortItems = oQuickSort.getItems();
			assert.equal(aQuickSortItems.length, 1, "Quick sort item count");
			assert.strictEqual(aQuickSortItems[0].getKey(), undefined, "Quick sort 'key'");
			assert.strictEqual(aQuickSortItems[0].getLabel(), oColumn.getLabel().getText(), "Quick sort 'label'");
			assert.strictEqual(aQuickSortItems[0].getSortOrder(), CoreLibrary.SortOrder.Descending, "Quick sort 'sortOrder'");

			const oQuickFilter = that.getQuickAction(oMenu, "QuickAction")[0];
			const aQuickFilterContent = oQuickFilter.getContent();
			assert.strictEqual(oQuickFilter.getLabel(), oColumn.getLabel().getText(), "Quick filter 'label'");
			assert.equal(aQuickFilterContent.length, 1, "Quick filter content count");
			assert.ok(aQuickFilterContent[0].isA("sap.m.Input"), "Quick filter content is a sap.m.Input");
			assert.strictEqual(aQuickFilterContent[0].getValue(), "initial filter value", "Quick filter value");

			const oQuickFreeze = that.getQuickAction(oMenu, "QuickAction")[1];
			const aQuickFreezeContent = oQuickFreeze.getContent();
			assert.equal(aQuickFreezeContent.length, 1, "Quick freeze content count");
			assert.equal(oQuickFreeze.getLabel(), TableUtils.getResourceText("TBL_FREEZE"), "Quick freeze label");
			assert.ok(aQuickFreezeContent[0].isA("sap.m.Switch"), "Quick freeze content is a sap.m.Switch");

			return that.openColumnMenu(1);
		}).then(function() {
			oColumn = that.oTable.getColumns()[1];
			oMenu = oColumn.getHeaderMenuInstance();

			const oQuickSort = that.getQuickAction(oMenu, "QuickSort");
			const aQuickSortItems = oQuickSort.getItems();
			assert.equal(aQuickSortItems.length, 1, "Quick sort item count");
			assert.strictEqual(aQuickSortItems[0].getKey(), undefined, "Quick sort 'key'");
			assert.strictEqual(aQuickSortItems[0].getLabel(), oColumn.getLabel().getText(), "Quick sort 'label'");
			assert.strictEqual(aQuickSortItems[0].getSortOrder(), CoreLibrary.SortOrder.None, "Quick sort 'sortOrder'");

			const oQuickFilter = that.getQuickAction(oMenu, "QuickAction")[0];
			const aQuickFilterContent = oQuickFilter.getContent();
			assert.strictEqual(oQuickFilter.getLabel(), oColumn.getLabel().getText(), "Quick filter 'label'");
			assert.equal(aQuickFilterContent.length, 1, "Quick filter content count");
			assert.ok(aQuickFilterContent[0].isA("sap.m.Input"), "Quick filter content is a sap.m.Input");
			assert.strictEqual(aQuickFilterContent[0].getValue(), "", "Quick filter value");

			const oQuickFreeze = that.getQuickAction(oMenu, "QuickAction")[1];
			const aQuickFreezeContent = oQuickFreeze.getContent();
			assert.equal(aQuickFreezeContent.length, 1, "Quick freeze content count");
			assert.equal(oQuickFreeze.getLabel(), TableUtils.getResourceText("TBL_FREEZE"), "Quick freeze label");
			assert.ok(aQuickFreezeContent[0].isA("sap.m.Switch"), "Quick freeze content is a sap.m.Switch");

			return that.closeMenu(oMenu);
		}).then(function() {
			that.oColumn2.setShowSortMenuEntry(false);
			that.oColumn2.setShowFilterMenuEntry(false);
			that.oTable.setEnableColumnFreeze(false);

			return that.openColumnMenu(1);
		}).then(function() {
			oColumn = that.oTable.getColumns()[1];
			oMenu = oColumn.getHeaderMenuInstance();

			assert.notOk(that.getQuickAction(oMenu, "QuickSort").getVisible(), "No Quick Sort");
			assert.notOk(that.getQuickAction(oMenu, "QuickAction")[0].getVisible(), "No Quick Filter");
			assert.notOk(that.getQuickAction(oMenu, "QuickAction")[1].getVisible(), "No Column Freeze");
		});
	});

	/**
	 * @deprecated As of version 1.110
	 */
	QUnit.test("Menu entries - QuickGroup", function(assert) {
		const that = this;
		let oColumn; let oMenu;

		return this.openColumnMenu(0).then(function() {
			oColumn = that.oTable.getColumns()[0];
			oMenu = oColumn.getHeaderMenuInstance();

			const oQuickGroup = that.getQuickAction(oMenu, "QuickGroup");
			const aQuickGroupItems = oQuickGroup.getItems();
			assert.equal(aQuickGroupItems.length, 1, "Quick group item count");
			assert.strictEqual(aQuickGroupItems[0].getKey(), undefined, "Quick group 'key'");
			assert.strictEqual(aQuickGroupItems[0].getLabel(), oColumn.getLabel().getText(), "Quick group 'label'");
			assert.strictEqual(aQuickGroupItems[0].getGrouped(), false, "Quick group 'grouped'");

			return that.openColumnMenu(1);
		}).then(function() {
			oColumn = that.oTable.getColumns()[1];
			oMenu = oColumn.getHeaderMenuInstance();

			const oQuickGroup = that.getQuickAction(oMenu, "QuickGroup");
			const aQuickGroupItems = oQuickGroup.getItems();
			assert.equal(aQuickGroupItems.length, 1, "Quick group item count");
			assert.strictEqual(aQuickGroupItems[0].getKey(), undefined, "Quick group 'key'");
			assert.strictEqual(aQuickGroupItems[0].getLabel(), oColumn.getLabel().getText(), "Quick group 'label'");
			assert.strictEqual(aQuickGroupItems[0].getGrouped(), false, "Quick group 'grouped'");
		});
	});

	QUnit.test("Quick Sort", function(assert) {
		const that = this;
		const oTable = this.oTable;
		const oColumnSortSpy = this.spy(this.oColumn1, "_sort");
		let oMenu; let oQuickAction;

		return this.openColumnMenu(0).then(function() {
			oMenu = oTable.getColumns()[0].getHeaderMenuInstance();
			oQuickAction = that.getQuickAction(oMenu, "QuickSort").getItems()[0].getAggregation("quickAction");
			const oSegmentedButton = oQuickAction.getContent()[0];

			qutils.triggerMouseEvent(oSegmentedButton.getButtons()[1].getId(), "mousedown", null, null, null, null, 0);
			qutils.triggerMouseEvent(oSegmentedButton.getButtons()[1].getId(), "click");

			assert.ok(oColumnSortSpy.calledOnceWithExactly(CoreLibrary.SortOrder.Ascending, false),
				"Column#_sort is called once with the correct parameters");
			return that.closeMenu(oMenu);
		}).then(function() {
			that.oColumn1.setShowSortMenuEntry(false);
			return that.openColumnMenu(0);
		}).then(function() {
			oMenu = oTable.getColumns()[0].getHeaderMenuInstance();
			assert.ok(that.getQuickAction(oMenu, "QuickSort").getItems()[0].getAggregation("quickAction") === oQuickAction,
				"The QuickSort instance is not destroyed");
			assert.notOk(that.getQuickAction(oMenu, "QuickSort").getVisible(), "The QuickSort is not visible");
		});
	});

	QUnit.test("Quick Filter and validation", function(assert) {
		const that = this;
		const oTable = this.oTable;
		const oColumn = this.oColumn1;
		const oColumnGetFilterStateSpy = this.spy(oColumn, "_getFilterState");
		const oColumnFilterSpy = this.spy(oColumn, "filter");
		let oMenu; let oQuickFilter;

		return this.openColumnMenu(0).then(function() {
			oMenu = oTable.getColumns()[0].getHeaderMenuInstance();
			oQuickFilter = that.getQuickAction(oMenu, "QuickAction")[0];
			const oFilterField = oQuickFilter.getContent()[0];

			assert.ok(oColumnGetFilterStateSpy.calledOnce, "Column#_getFilterState is called once when the menu opens");
			oFilterField.setValue("test");
			oFilterField.fireEvent("submit");

			assert.ok(oColumnGetFilterStateSpy.calledTwice, "Column#_getFilterState is called when the filter value is submitted");
			assert.ok(oColumnFilterSpy.calledOnceWithExactly("test"), "Column#filter is called once with the correct parameters");
			oColumnGetFilterStateSpy.restore();
			oColumnFilterSpy.restore();

			oColumn.setFilterType(new IntegerType());
			assert.equal(oColumn._getFilterState(), "Error", "Validation error, the expected input was integer");

			oColumn.setFilterValue("1");
			assert.equal(oColumn._getFilterState(), "None", "Validation successful");
			return that.closeMenu(oMenu);
		}).then(function() {
			that.oColumn1.setShowFilterMenuEntry(false);
			return that.openColumnMenu(0);
		}).then(function() {
			oMenu = oTable.getColumns()[0].getHeaderMenuInstance();
			assert.ok(that.getQuickAction(oMenu, "QuickAction")[0] === oQuickFilter, "The QuickFilter instance is not destroyed");
			assert.notOk(oQuickFilter.getVisible(), "The QuickFilter is not visible");
		});
	});

	QUnit.test("Custom Filter", function(assert) {
		const oTable = this.oTable;
		const oColumn = this.oColumn2;

		oTable.setEnableCustomFilter(true);

		return this.openColumnMenu(1).then(function() {
			const oMenu = oTable.getColumns()[1].getHeaderMenuInstance();
			const oCustomFilter = oMenu.getAggregation("_items")[0].getItems()[0];

			assert.equal(oCustomFilter.getLabel(), TableUtils.getResourceText("TBL_FILTER_ITEM"), "Custom filter label is correct");
			assert.equal(oCustomFilter.getIcon(), "sap-icon://filter", "Custom filter icon is correct");

			return new Promise(function(resolve) {
				oTable.attachCustomFilter(function(oEvent) {
					assert.ok(true, "'customFilter' event was fired");
					assert.equal(oEvent.getParameter("column"), oColumn, "Event parameter 'column'");
					resolve();
				});
				oCustomFilter.firePress();
			});
		});
	});

	/**
	 * @deprecated As of version 1.110
	 */
	QUnit.test("Quick Group", function(assert) {
		const that = this;
		const oTable = this.oTable;
		const oColumnSetGroupedSpy = this.spy(this.oColumn1, "_setGrouped");
		let oMenu; let oQuickGroup;

		return this.openColumnMenu(0).then(function() {
			oMenu = oTable.getColumns()[0].getHeaderMenuInstance();
			oQuickGroup = that.getQuickAction(oMenu, "QuickGroup");
			const oSwitch = oQuickGroup.getEffectiveQuickActions()[0].getContent()[0];

			oMenu.attachEventOnce("afterClose", function() {
				assert.ok(oColumnSetGroupedSpy.calledOnceWithExactly(true), "Column#_setGrouped is called once with the correct parameters");
				oTable.getColumns()[0]._setGrouped(false);
				return that.closeMenu(oMenu);
			});

			qutils.triggerMouseEvent(oSwitch.getId(), "mousedown", null, null, null, null, 0);
			qutils.triggerMouseEvent(oSwitch.getId(), "click");
		}).then(function() {
			oTable.setEnableGrouping(false);
			return that.openColumnMenu(0);
		}).then(function() {
			oMenu = oTable.getColumns()[0].getHeaderMenuInstance();
			assert.ok(that.getQuickAction(oMenu, "QuickGroup") === oQuickGroup, "The QuickGroup instance is not destroyed");
			assert.notOk(oQuickGroup.getVisible(), "The QuickGroup is not visible");
		});
	});

	QUnit.test("Quick Total", function(assert) {
		const that = this;
		const oTable = this.oTable;
		let oMenu; let oQuickTotal;

		// simulate AnalyticalTable
		const oAnalyticalTableStub = sinon.stub(TableUtils, "isA");
		oAnalyticalTableStub.callThrough();
		oAnalyticalTableStub.withArgs(oTable, "sap.ui.table.AnalyticalTable").returns(true);
		this.oColumn2._isAggregatableByMenu = function() {
			return true;
		};
		this.oColumn2.getSummed = function() {
			return false;
		};
		this.oColumn2.setSummed = function() {
			assert.ok(true, "setSummed is called");
		};

		const oColumnSetSummedSpy = this.spy(this.oColumn2, "setSummed");

		return this.openColumnMenu(1).then(function() {
			oMenu = oTable.getColumns()[1].getHeaderMenuInstance();
			oQuickTotal = that.getQuickAction(oMenu, "QuickTotal");
			const oSwitch = oQuickTotal.getEffectiveQuickActions()[0].getContent()[0];

			oMenu.attachEventOnce("afterClose", function() {
				assert.ok(oColumnSetSummedSpy.calledOnceWithExactly(true), "Column#setSummed is called once with the correct parameters");
				oTable.getColumns()[0]._setGrouped(false);
				return that.closeMenu(oMenu);
			});

			qutils.triggerMouseEvent(oSwitch.getId(), "mousedown", null, null, null, null, 0);
			qutils.triggerMouseEvent(oSwitch.getId(), "click");
		}).then(function() {
			that.oColumn2._isAggregatableByMenu = function() {
				return false;
			};
			return that.openColumnMenu(0);
		}).then(function() {
			oMenu = oTable.getColumns()[1].getHeaderMenuInstance();
			assert.ok(oQuickTotal, "The QuickTotal instance is not destroyed");
			assert.notOk(oQuickTotal.getVisible(), "The QuickTotal is not visible");
		});
	});

	QUnit.test("Quick Freeze", function(assert) {
		const that = this;
		const oTable = this.oTable;
		const oSetFixedColumnCountSpy = this.spy(this.oTable, "setFixedColumnCount");
		let oMenu; let oQuickFreeze;

		return this.openColumnMenu(0).then(function() {
			oMenu = oTable.getColumns()[0].getHeaderMenuInstance();
			oQuickFreeze = that.getQuickAction(oMenu, "QuickAction")[1];
			const oSwitch = oQuickFreeze.getContent()[0];

			oMenu.attachEventOnce("afterClose", function() {
				assert.ok(oSetFixedColumnCountSpy.calledOnceWithExactly(1), "Table#setFixedColumnCount is called once with the correct parameters");
				return that.closeMenu(oMenu);
			});

			qutils.triggerMouseEvent(oSwitch.getId(), "mousedown", null, null, null, null, 0);
			qutils.triggerMouseEvent(oSwitch.getId(), "click");
		}).then(function() {
			oTable.setEnableColumnFreeze(false);
			return that.openColumnMenu(0);
		}).then(function() {
			oMenu = oTable.getColumns()[0].getHeaderMenuInstance();
			assert.ok(that.getQuickAction(oMenu, "QuickAction")[1] === oQuickFreeze, "The QuickFreeze instance is not destroyed");
			assert.notOk(oQuickFreeze.getVisible(), "The QuickFreeze is not visible");
		});
	});

	QUnit.test("Resize", function(assert) {
		const that = this;
		const oTable = this.oTable;
		const bOriginalPointerSupport = Device.support.pointer;
		const bOriginalDesktopSupport = Device.system.desktop;

		Device.support.pointer = false;
		Device.system.desktop = false;

		return this.openColumnMenu(0).then(function() {
			const oMenu = oTable.getColumns()[0].getHeaderMenuInstance();
			const oQuickResize = that.getQuickAction(oMenu, "QuickAction")[2];
			const aContent = oQuickResize.getContent();

			const sLabel = Library.getResourceBundleFor("sap.m").getText("table.COLUMNMENU_RESIZE");
			assert.strictEqual(oQuickResize.getLabel(), sLabel, "label is correct");
			assert.strictEqual(oQuickResize.getContent()[0].getTooltip(), sLabel, "tooltip is correct");
			assert.strictEqual(aContent[0].getIcon(), "sap-icon://resize-horizontal", "button has the correct icon");

			qutils.triggerMouseEvent(aContent[0].getId(), "mousedown", null, null, null, null, 0);
			qutils.triggerMouseEvent(aContent[0].getId(), "click");

			assert.ok(oTable.$().hasClass("sapUiTableResizing") && oTable.$("rsz").hasClass("sapUiTableColRszActive"), "Resizing started");

			Device.support.pointer = bOriginalPointerSupport;
			Device.system.desktop = bOriginalDesktopSupport;
		});
	});

	QUnit.module("API", {
		beforeEach: function() {
			this.oMenu = new ColumnMenu();
			this.oColumn = new Column({
				sortProperty: "A"
			});
			this.oTable = TableQUnitUtils.createTable({
				columns: [this.oColumn]
			});

			this.oAdapter = new MobileColumnHeaderMenuAdapter();
			this.oAdapter._oItemContainer = new ItemContainer();
		},
		afterEach: function() {
			this.oMenu.destroy();
			this.oTable.destroy();
		}
	});

	QUnit.test("injectMenuItems", function(assert) {
		const oAddAggregationSpy = sinon.spy(this.oMenu, "addAggregation");

		this.oAdapter.injectMenuItems(this.oMenu, this.oColumn);
		assert.equal(oAddAggregationSpy.callCount, 7,
			"Menu.addAggregation is called 7 times (sort, filter, group, total, freeze, resize, items)");
		assert.ok(oAddAggregationSpy.calledWith("_items", this.oAdapter._oItemContainer),
			"ItemContainer is added to the menu");
	});

	QUnit.test("removeMenuItems", function(assert) {
		const oRemoveAggregationSpy = sinon.spy(this.oMenu, "removeAggregation");

		this.oAdapter.removeMenuItems(this.oMenu);
		assert.equal(oRemoveAggregationSpy.callCount, 7, "Menu.removeAggregation is called 7 times");
		assert.ok(oRemoveAggregationSpy.calledWith("_items", this.oAdapter._oItemContainer),
			"ItemContainer is removed from the menu");
	});

	QUnit.test("onAfterMenuDestroyed", function(assert) {
		this.oAdapter.injectMenuItems(this.oMenu, this.oColumn);
		assert.ok(this.oAdapter._oItemContainer, "reference to the ItemContainer is added");
		assert.ok(this.oAdapter._oQuickSort, "reference to the QuickSort is added");

		this.oAdapter.onAfterMenuDestroyed(this.oMenu);
		assert.notOk(this.oAdapter._oItemContainer, "reference to the ItemContainer is removed");
		assert.notOk(this.oAdapter._oQuickSort, "reference to the QuickSort is removed");
	});

	QUnit.test("destroy", function(assert) {
		this.oAdapter.injectMenuItems(this.oMenu, this.oColumn);
		const oDestroyQuickActionsSpy = sinon.spy(this.oAdapter, "_destroyQuickActions");
		const oDestroyItemsSpy = sinon.spy(this.oAdapter, "_destroyItems");
		assert.ok(this.oAdapter._oItemContainer, "reference to the ItemContainer is added");
		assert.ok(this.oAdapter._oQuickSort, "reference to the QuickSort is added");
		assert.ok(this.oAdapter._oColumn, "reference to the Column is added");

		this.oAdapter.destroy();
		assert.ok(oDestroyQuickActionsSpy.calledOnce, "_destroyQuickActions is called");
		assert.ok(oDestroyItemsSpy.calledOnce, "_destroyItems is called");
		assert.notOk(this.oAdapter._oItemContainer, "reference to the ItemContainer is removed");
		assert.notOk(this.oAdapter._oQuickSort, "reference to the QuickSort is removed");
		assert.notOk(this.oAdapter._oColumn, "reference to the Column is removed");
	});
});