sap.ui.define(["sap/base/i18n/Localization", "sap/ui/thirdparty/jquery"], function (Localization, jQuery) {
    "use strict";
    jQuery.sap.initMobile();

    var oGenericTileData = {
        mode: sap.m.GenericTileMode.ContentMode,
        subheader: "Expenses By Region",
        header: "Comparative Annual Totals",
        tooltip: "",
        footerNum: "Actual and Target",
        footerComp: "Compare across regions",
        scale: "MM",
        unit: "EUR",
        value: "1700",
        width: 174,
        padding: true,
        frameType: sap.m.FrameType.OneByOne,
        state: sap.m.LoadState.Loaded,
        scope: sap.m.GenericTileScope.Display,
        valueColor: sap.m.ValueColor.Error,
        indicator: sap.m.DeviationIndicator.Up,
        title: "US Profit Margin",
        footer: "Current Quarter",
        description: "Maximum deviation",
        imageDescription: "",
        backgroundImage: "images/NewsImage1.png",
        newsTileContent: [{
            footer: "August 21, 2013",
            contentText: "SAP Unveils Powerful New Player Comparison Tool Exclusively on NFL.com",
            subheader: "SAP News"
        }],
        feedTileContent: [{
            footer: "New Notifications",
            contentText: "@@notify Great outcome of the Presentation today. New functionality well received.",
            subheader: "About 1 minute ago in Computer Market"
        }],
        frameTypes: [sap.m.FrameType.OneByOne, sap.m.FrameType.TwoByOne],
        indicators: Object.keys(sap.m.DeviationIndicator),
        modes: Object.keys(sap.m.GenericTileMode),
        states: Object.keys(sap.m.LoadState),
        scopes: Object.keys(sap.m.GenericTileScope),
        wrappingTypes: Object.keys(sap.m.WrappingType),
        wrappingType: sap.m.WrappingType.Normal
    };

    var fnPress = function (oEvent) {
        if (oEvent.getParameter("scope") === sap.m.GenericTileScope.Actions &&
                oEvent.getParameter("action") === "Press") {
            var oActionSheet = new sap.m.ActionSheet({
                title: "Choose Your Action",
                showCancelButton: true,
                placement: "Bottom",
                buttons: [
                    new sap.m.Button({
                        text: "Move"
                    }),
                    new sap.m.Button({
                        text: "Whatever"
                    })
                ],
                afterClose: function () {
                    oActionSheet.destroy();
                }
            });
            oActionSheet.openBy(oEvent.getParameter("domRef"));
        } else {
            sap.m.MessageToast.show("Action " + oEvent.getParameter("action") + " on " + oEvent.getSource().getId() + " pressed.");
        }
    };

    function setDefaultParameters(oData) {
        var sName;
        var oUriParameters = new URLSearchParams(window.location.search);

        for (sName in oData) {
            if (oData.hasOwnProperty(sName) && typeof oData[sName] === 'string') {
                if (oUriParameters.has(sName)) {
                    oData[sName] = oUriParameters.get(sName);
                }
            }
        }
    }

    setDefaultParameters(oGenericTileData);

    var oGenericTileModel = new sap.ui.model.json.JSONModel(oGenericTileData);

    var oNVConfContS = new sap.m.NumericContent("numeric-cont-l", {
        value: "{/value}",
        scale: "{/scale}",
        indicator: "{/indicator}",
        formatterValue: "{/isFormatterValue}",
        truncateValueTo: "{/truncateValueTo}",
        valueColor: "{/valueColor}",
        icon:  "sap-icon://line-charts",
        withMargin: true,
        width: "100%"
    });

    var oNVConfS = new sap.m.TileContent("numeric-tile-cont-l", {
        unit: "{/unit}",
        footer: "{/footerNum}",
        content: oNVConfContS
    });

    var oGenericTile1 = new sap.m.GenericTile({
        mode: "{/mode}",
        subheader: "{/subheader}",
        frameType: "{/frameType}",
        header: "{/header}",
        tooltip: "{/tooltip}",
        state: "{/state}",
        scope: "{/scope}",
        headerImage: "{/headerImage}",
        wrappingType: "{/wrappingType}",
        imageDescription: "{/imageDescription}",
        press: fnPress,
        failedText: "{/failedText}",
        tileContent: [oNVConfS]
    });
    oGenericTile1.addStyleClass("sapUiTinyMargin");
    oGenericTile1.bindProperty("width", {
        path: "/width",
        formatter: function (sValue) {
            return sValue + "px";
        }
    });

    var oNumCnt2x1 = new sap.m.NumericContent("numeric-cont-2x1", {
        value: "{/value}",
        scale: "{/scale}",
        indicator: "{/indicator}",
        // truncateValueTo : 14,
        valueColor: "{/valueColor}",
        icon:  "sap-icon://line-charts",
        withMargin: false,
        width: "100%"
    });

    var oTc2x1 = new sap.m.TileContent("comp-tile-cont-2x1", {
        unit: "{/unit}",
        footer: "{/footerComp}",
        frameType: sap.m.FrameType.TwoByOne,
        content: oNumCnt2x1
    });

    var oGenericTile2 = new sap.m.GenericTile({
        mode: "{/mode}",
        tooltip: "{/tooltip}",
        subheader: "{/subheader}",
        frameType: sap.m.FrameType.TwoByOne,
        header: "{/header}",
        state: "{/state}",
        scope: "{/scope}",
        headerImage: "{/headerImage}",
        imageDescription: "{/imageDescription}",
        wrappingType: "{/wrappingType}",
        press: fnPress,
        failedText: "{/failedText}",
        tileContent: [oTc2x1]
    });
    oGenericTile2.addStyleClass("sapUiTinyMargin");
    oGenericTile2.bindProperty("width", {
        path: "/width",
        formatter: function (sValue) {
            return sValue + "px";
        }
    });


    var oNewsTileContent = new sap.m.TileContent("news-tile-cont-2x1", {
        footer: "{footer}",
        frameType: sap.m.FrameType.TwoByOne,
        content: new sap.m.NewsContent({
            contentText: "{contentText}",
            subheader: "{subheader}"
        })
    });

    var oGenericTile3 = new sap.m.GenericTile({
        mode: "{/mode}",
        tooltip: "{/tooltip}",
        frameType: sap.m.FrameType.TwoByOne,
        state: "{/state}",
        scope: "{/scope}",
        headerImage: "{/headerImage}",
        imageDescription: "{/imageDescription}",
        backgroundImage: "{/backgroundImage}",
        wrappingType: "{/wrappingType}",
        press: fnPress,
        failedText: "{/failedText}",
        tileContent: {
            template: oNewsTileContent,
            path: "/newsTileContent"
        }
    });
    oGenericTile3.addStyleClass("sapUiTinyMargin");
    oGenericTile3.bindProperty("width", {
        path: "/width",
        formatter: function (sValue) {
            return sValue + "px";
        }
    });

    var oFeedTileContent = new sap.m.TileContent("feed-tile-cont-2x1", {
        footer: "{footer}",
        frameType: sap.m.FrameType.TwoByOne,
        content: new sap.m.FeedContent({
            contentText: "{contentText}",
            subheader: "{subheader}"
        })
    });

    var oGenericTile4 = new sap.m.GenericTile({
        mode: "{/mode}",
        tooltip: "{/tooltip}",
        header: "{/header}",
        subheader: "{/subheader}",
        frameType: sap.m.FrameType.TwoByOne,
        state: "{/state}",
        scope: "{/scope}",
        headerImage: "{/headerImage}",
        imageDescription: "{/imageDescription}",
        wrappingType: "{/wrappingType}",
        press: fnPress,
        failedText: "{/failedText}",
        tileContent: {
            template: oFeedTileContent,
            path: "/feedTileContent"
        }
    });

    var oGenericTile5 = new sap.m.GenericTile({
        mode: "{/mode}",
        tooltip: "{/tooltip}",
        header: "{/header}",
        subheader: "{/subheader}",
        frameType: sap.m.FrameType.TwoByOne,
        state: "{/state}",
        scope: "{/scope}",
        headerImage: "{/headerImage}",
        imageDescription: "{/imageDescription}",
        wrappingType: "{/wrappingType}",
        press: fnPress,
        failedText: "{/failedText}",
        tileContent: new sap.m.TileContent({
            content: new sap.suite.ui.microchart.ColumnMicroChart({
                size: "Responsive",
                columns: [
                    new sap.suite.ui.microchart.ColumnMicroChartData({
                        value: 65,
                        color: "Error"
                    }),
                    new sap.suite.ui.microchart.ColumnMicroChartData({
                        value: 30,
                        color: "Neutral"
                    }),
                    new sap.suite.ui.microchart.ColumnMicroChartData({
                        value: 120,
                        color: "Neutral"
                    }),
                    new sap.suite.ui.microchart.ColumnMicroChartData({
                        value: 5,
                        color: "Error"
                    }),
                    new sap.suite.ui.microchart.ColumnMicroChartData({
                        value: 85,
                        color: "Error"
                    })
                ]
            })
        })
    });

    oGenericTile5.addStyleClass("sapUiTinyMargin");
    oGenericTile5.bindProperty("width", {
        path: "/width",
        formatter: function (sValue) {
            return sValue + "px";
        }
    });

    oGenericTile4.addStyleClass("sapUiTinyMargin");
    oGenericTile4.bindProperty("width", {
        path: "/width",
        formatter: function (sValue) {
            return sValue + "px";
        }
    });

    var oTitleInput = new sap.m.Input("title-value", {
        type: sap.m.InputType.Text,
        placeholder: 'Enter header ...'
    });
    oTitleInput.bindValue("/header");

    var oTooltipInput = new sap.m.Input("tooltip-value", {
        type: sap.m.InputType.Text,
        placeholder: 'Enter tooltip ...'
    });
    oTooltipInput.bindValue("/tooltip");

    // LANGUAGE

    var oWidthLabel = new sap.m.Label({
        text: "Change width",
        labelFor: "width-change"
    });

    var oWidthSlider = new sap.m.Slider({
        width: "100%",
        min: 174,
        step: 5,
        max: 600
    });

    oWidthSlider.bindProperty("value", "/width");

    var oLanguageLabel = new sap.m.Label({
        text: "Change language",
        labelFor: "language-change"
    });

    var oUpdateLanguageSelect = new sap.m.Select("language-change", {
        items: [
            new sap.ui.core.Item({key: "en-US", text: "en-US"}),
            new sap.ui.core.Item({key: "de_CH", text: "de_CH"}),
            new sap.ui.core.Item({key: "es", text: "es"}),
            new sap.ui.core.Item({key: "it_CH", text: "it_CH"}),
            new sap.ui.core.Item({key: "zh_CN", text: "zh_CN"}),
            new sap.ui.core.Item({key: "es", text: "es"})
        ],
        change: function (oEvent) {
            var sKey = oEvent.getParameter("selectedItem").getKey();
            Localization.setLanguage(sKey);
        }
    });


    var oUpdateValueLbl = new sap.m.Label({
        text: "Update Value",
        labelFor: "update-value"
    });

    var oUpdateValueInput = new sap.m.Input("update-value", {
        type: sap.m.InputType.Text,
        placeholder: 'Enter value for update ...'
    });
    oUpdateValueInput.bindValue("/value");

    var oUpdateScaleLbl = new sap.m.Label({
        text: "Update Scale",
        labelFor: "update-scale"
    });

    var oUpdateScaleInput = new sap.m.Input("update-scale", {
        type: sap.m.InputType.Text,
        placeholder: 'Enter value for scale ...'
    });
    oUpdateScaleInput.bindValue("/scale");

    var oUpdatePaddingLbl = new sap.m.Label({
        text: "Create padding",
        labelFor: "update-padding"
    });

    var oUpdatePaddingCheckbox = new sap.m.CheckBox("update-padding", {
        select: function (oEvent) {
            jQuery("body").toggleClass("sapTilePaddingTest");
        }
    });


    var oDescInput = new sap.m.Input("desc-value", {
        type: sap.m.InputType.Text,
        placeholder: 'Enter description ...'
    });
    oDescInput.bindValue("/subheader");

    var oFooterInputNum = new sap.m.Input("footer-num-value", {
        type: sap.m.InputType.Text,
        placeholder: 'Enter Numeric Footer ...'
    });
    oFooterInputNum.bindValue("/footerNum");

    var oFooterInputComp = new sap.m.Input("footer-cmp-value", {
        type: sap.m.InputType.Text,
        placeholder: 'Enter Comp Footer ...'
    });
    oFooterInputComp.bindValue("/footerComp");

    var oUnitInput = new sap.m.Input("unit-value", {
        type: sap.m.InputType.Text,
        placeholder: 'Enter Units ...'
    });
    oUnitInput.bindValue("/unit");

    var oFailedInput = new sap.m.Input("failed-text", {
        type: sap.m.InputType.Text,
        placeholder: 'Enter failed message...'
    });
    oFailedInput.bindValue("/failedText");


    var oControlForm = new sap.ui.layout.Grid("numeric-content-form", {
        defaultSpan: "XL4 L4 M6 S12",
        content: [oGenericTile1, oGenericTile2, oGenericTile3, oGenericTile4, oGenericTile5]
    });

    var editableSimpleForm = new sap.ui.layout.form.SimpleForm("controls", {
        maxContainerCols: 2,
        editable: true,
        content: [new sap.ui.core.Title({ // this starts a new group
            text: "Modify Tile"
        }), oWidthLabel, oWidthSlider, oLanguageLabel, oUpdateLanguageSelect, oUpdateValueLbl, oUpdateValueInput, oUpdateScaleLbl, oUpdateScaleInput, oUpdatePaddingLbl, oUpdatePaddingCheckbox]
    });

    var oPage = new sap.m.Page("initial-page", {
        showHeader: false,
        content: [oControlForm, editableSimpleForm]
    });
    oPage.setModel(oGenericTileModel);

    //create a mobile App embedding the page and place the App into the HTML document
    new sap.m.App("myApp", {
        pages: [oPage]
    }).placeAt("content");
});