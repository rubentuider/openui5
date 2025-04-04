/*!
 * ${copyright}
 */

sap.ui.define([
	"./ValueHelp.delegate",
	"sap/ui/mdc/valuehelp/content/MTable",
	"sap/ui/mdc/valuehelp/content/Conditions",
	"sap/ui/mdc/valuehelp/FilterBar",
	"sap/ui/mdc/FilterField",
	"sap/m/library",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/Text",
	"sap/ui/model/odata/type/String"
], function(
	ODataV4ValueHelpDelegate,
	MTable,
	Conditions,
	FilterBar,
	FilterField,
	mLibrary,
	Table,
	Column,
	ColumnListItem,
	Text,
	StringType
) {
	"use strict";

	const ValueHelpDelegate = Object.assign({}, ODataV4ValueHelpDelegate);

//	var counter = 0;

	ValueHelpDelegate.retrieveContent = function (oValueHelp, oContainer) {
		const oParams = new URLSearchParams(window.location.search);
		const oParamSuspended = oParams.get("suspended");
		const bSuspended = oParamSuspended ? oParamSuspended === "true" : false;

		const aCurrentContent = oContainer && oContainer.getContent();
		let oCurrentContent = aCurrentContent && aCurrentContent[0];

		const bMultiSelect = oValueHelp.getMaxConditions() === -1;

		if (oContainer.isA("sap.ui.mdc.valuehelp.Popover")) {

			if (!oCurrentContent) {
				oCurrentContent = new MTable({keyPath: "ID", descriptionPath: "name"});
				oContainer.addContent(oCurrentContent);
			}

			if (!oCurrentContent.getTable()) {
				oCurrentContent.setTable(new Table("mTable1", {
					width: "30rem",
					mode: mLibrary.ListMode.SingleSelectMaster,
					columns: [
						new Column({header: new Text({text : "ID"})}),
						new Column({header: new Text({text : "Name"})})
					],
					items: {
						path : "/Authors",
						parameters: {
							$count: true
						},
						length: 10,
						suspended: bSuspended,
						template : new ColumnListItem({
							type: "Active",
							cells: [
								new Text({text: {path: 'ID', type: new StringType()}}),
								new Text({text: {path: 'name', type: new StringType()}})
							]
						})
					}
				}));
			}
		}

		if (oContainer.isA("sap.ui.mdc.valuehelp.Dialog")) {

			if (!oCurrentContent) {

				oCurrentContent = new MTable({keyPath: "ID", descriptionPath: "name", group:"group1", title: "Default Search Template"});
				oContainer.addContent(oCurrentContent);
				oCurrentContent = new MTable({keyPath: "ID", descriptionPath: "name", group:"group1", title: "Search Template 1"});
				oContainer.addContent(oCurrentContent);

				oContainer.addContent(oCurrentContent);

				if (bMultiSelect) {
					const oAdditionalContent = new Conditions({
						title:"Define Conditions",
						shortTitle:"Conditions",
						label:"Label of Field"
					});
					oContainer.addContent(oAdditionalContent);
				}
			}

			const sCollectiveSearchKey = oCurrentContent.getCollectiveSearchKey();

			const oCurrentTable = oCurrentContent.getTable();
			if (oCurrentTable) {
				oCurrentTable.destroy();
			}

			const oCurrentFB = oCurrentContent.getFilterBar();

			if (oCurrentFB) {
				oCurrentContent.setFilterBar();
				oCurrentFB.destroy();
			}

			let oCollectiveSearchContent;

			switch (sCollectiveSearchKey) {
				case "template1":

					oCurrentContent.setFilterBar(
						new FilterBar("FB0-FH1-Dialog-FB2", {
							liveMode: false,
							delegate: {
								name: "delegates/GenericVhFilterBarDelegate",
								payload: {}
							},
							basicSearchField: new FilterField({
								delegate: {
									name: "delegates/odata/v4/FieldBaseDelegate",
									payload: {}
								},
								dataType: "Edm.String",
								conditions: "{$filters>/conditions/$search}",
								propertyKey: "$search",
								width: "50%",
								maxConditions: 1,
								placeholder: "Search"
							}),
							filterItems: [
								new FilterField({
									delegate: {
										name: "delegates/odata/v4/FieldBaseDelegate",
										payload: {}
									},
									label: "Country of Origin",
									conditions: "{$filters>/conditions/countryOfOrigin_code}"
								})
							]
						})
					);

					oCollectiveSearchContent = new Table(oCurrentContent.getId() + "--" +  "template1", {
						width: "100%",
						growing: true,
						growingScrollToLoad: true,
						growingThreshold: 20,
						mode: bMultiSelect ? mLibrary.ListMode.MultiSelect : mLibrary.ListMode.SingleSelectLeft,
						columns: [
							new Column({header: new Text({text : "ID"})}),
							new Column({header: new Text({text : "Name"})}),
							new Column({header: new Text({text : "Country of Origin"})})

						],
						items: {
							path : "/Authors",
							parameters: {
								$count: true
							},
							suspended: bSuspended,
							template : new ColumnListItem({
								type: "Active",
								cells: [
									new Text({text: {path: 'ID', type: new StringType()}}),
									new Text({text: {path: 'name', type: new StringType()}}),
									new Text({text: {path: 'countryOfOrigin_code', type: new StringType()}})
								]
							})
						}
					});
					break;
				default:

					oCurrentContent.setFilterBar(
						new FilterBar("FB0-FH1-Dialog-FB1", {
							liveMode: false,
							delegate: {
								name: "delegates/GenericVhFilterBarDelegate",
								payload: {}
							},
							basicSearchField: new FilterField({
								delegate: {
									name: "delegates/odata/v4/FieldBaseDelegate",
									payload: {}
								},
								dataType: "Edm.String",
								conditions: "{$filters>/conditions/$search}",
								propertyKey: "$search",
								width: "50%",
								maxConditions: 1,
								placeholder: "Search"
							}),
							filterItems: [
								new FilterField({
									delegate: {
										name: "delegates/odata/v4/FieldBaseDelegate",
										payload: {}
									},
									label: "Name",
									conditions: "{$filters>/conditions/name}"
								})
							]
						})
					);

					oCollectiveSearchContent = new Table(oCurrentContent.getId() + "--" +  "default", {
						width: "100%",
						growing: true,
						growingScrollToLoad: true,
						growingThreshold: 20,
						mode: bMultiSelect ? mLibrary.ListMode.MultiSelect : mLibrary.ListMode.SingleSelectLeft,
						columns: [
							new Column({header: new Text({text : "ID"})}),
							new Column({header: new Text({text : "Name"})})
						],
						items: {
							path : "/Authors",
							parameters: {
								$count: true
							},
							suspended: bSuspended,
							template : new ColumnListItem({
								type: "Active",
								cells: [
									new Text({text: {path: 'ID', type: new StringType()}}),
									new Text({text: {path: 'name', type: new StringType()}})
								]
							})
						}
					});
					break;
			}
			oCurrentContent.setTable(oCollectiveSearchContent);
		}

		return Promise.resolve();
	};

	return ValueHelpDelegate;
});
