sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Popover",
	"sap/m/Button",
	"sap/m/CheckBox",
	"sap/m/ComboBox",
	"sap/m/Input",
	"sap/m/Text",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/m/SearchField",
	"sap/m/Select",
	"sap/m/ToolbarSpacer",
	"sap/m/Link",
	"sap/m/Bar",
	"sap/m/Title",
	"sap/ui/core/Item",
    "sap/ui/core/Popup",
	"sap/m/library",
	"sap/m/HBox",
	"sap/m/VBox",
	"sap/ui/core/search/OpenSearchProvider",
	"sap/ui/thirdparty/jquery"
], function (
	JSONModel,
	App,
	Page,
	Popover,
	Button,
	CheckBox,
	ComboBox,
	Input,
	Text,
	List,
	StandardListItem,
	SearchField,
	Select,
	ToolbarSpacer,
	Link,
	Bar,
	Title,
	Item,
    Popup,
	mLibrary,
	HBox,
	VBox,
	OpenSearchProvider,
	jQuery
) {
	"use strict";
    var app = new App("myApp", {initialPage: "page1"});

    //create the list
    var oList2 = new List({
        inset: true
    });

    var data = {
        navigation: [{
            title: "Travel Expend",
            description: "Access the travel expend workflow",
            icon: "images/travel_expend.png",
            iconInset: false,
            type: "Navigation",
            press: 'detailPage'
        }, {
            title: "Travel and expense report",
            description: "Access travel and expense reports",
            icon: "images/travel_expense_report.png",
            iconInset: false,
            type: "Navigation",
            press: 'detailPage'
        }, {
            title: "Travel Request",
            description: "Access the travel request workflow",
            icon: "images/travel_request.png",
            iconInset: false,
            type: "Navigation",
            press: 'detailPage'
        }, {
            title: "Work Accidents",
            description: "Report your work accidents",
            icon: "images/wounds_doc.png",
            iconInset: false,
            type: "Navigation",
            press: 'detailPage'
        }, {
            title: "Travel Settings",
            description: "Change your travel worflow settings",
            icon: "images/settings.png",
            iconInset: false,
            type: "Navigation",
            press: 'detailPage'
        }, {
            title: "Travel Expend",
            description: "Access the travel expend workflow",
            icon: "images/travel_expend.png",
            iconInset: false,
            type: "Navigation",
            press: 'detailPage'
        }, {
            title: "Travel and expense report",
            description: "Access travel and expense reports",
            icon: "images/travel_expense_report.png",
            iconInset: false,
            type: "Navigation",
            press: 'detailPage'
        }, {
            title: "Travel Request",
            description: "Access the travel request workflow",
            icon: "images/travel_request.png",
            iconInset: false,
            type: "Navigation",
            press: 'detailPage'
        }, {
            title: "Work Accidents",
            description: "Report your work accidents",
            icon: "images/wounds_doc.png",
            iconInset: false,
            type: "Navigation",
            press: 'detailPage'
        }, {
            title: "Travel Settings",
            description: "Change your travel worflow settings",
            icon: "images/settings.png",
            iconInset: false,
            type: "Navigation",
            press: 'detailPage'
        }]
    };

    var oItemTemplate1 = new StandardListItem({
        title: "{title}",
        description: "{description}",
        icon: "{icon}",
        iconInset: "{iconInset}",
        type: "{type}"
    });

    function bindListData (data, itemTemplate, list) {
        var oModel = new JSONModel();
        // set the data for the model
        oModel.setData(data);
        // set the model to the list
        list.setModel(oModel);

        // bind Aggregation
        list.bindAggregation("items", "/navigation", itemTemplate);
    }

    bindListData(data, oItemTemplate1, oList2);
    //end of the list creation

    var oBeginButton = new Button({
        text: "Modal",
        type: mLibrary.ButtonType.Reject,
        press: function () {
            oPopover.setModal(!oPopover.getModal());
        }
    });


    var oEndButton = new Button({
        text: "Close",
        type: mLibrary.ButtonType.Accept,
        press: function () {
            oPopover.close();
        }
    });

    var footer = new Bar({
        contentLeft: [new Button({icon: "sap-icon://inspection", text: "short"})],
        contentRight: [new Button({icon: "sap-icon://home", text: "loooooong text"})]
    });

    var oPopover = new Popover("pop1", {
        placement: mLibrary.PlacementType.Bottom,
        title: "Popover",
        showHeader: true,
        beginButton: oBeginButton,
        endButton: oEndButton,
        beforeOpen: function (oEvent) {
            jQuery.sap.log.info("before popover opens!!!");
        },
        afterOpen: function (oEvent) {
            jQuery.sap.log.info("popover is opened finally!!!");
        },
        beforeClose: function (oEvent) {
            jQuery.sap.log.info("before popover closes!!!");
        },
        afterClose: function (oEvent) {
            jQuery.sap.log.info("popover is closed properly!!!");
        },
        footer: footer,
        content: [
            new Input("focusInput", {placeholder: "Search"}), oList2
        ],
        initialFocus: "focusInput"
    });

    oPopover.setTitle("New Popover with long title");

    var oPopover2 = new Popover("pop2", {
        placement: mLibrary.PlacementType.Horizontal,
        title: "Popover2",
        showHeader: true,
        subHeader: new Bar({
            contentMiddle: [
                new SearchField({
                    placeholder: "Search ...",
                    width: "100%"
                })
            ]
        }),
        verticalScrolling: true,
        horizontalScrolling: false,
        content: [
            oList2.clone()
        ]
    });

    var oPopover3 = new Popover("pop3", {
        placement: mLibrary.PlacementType.Horizontal,
        title: "Popover3",
        showHeader: true,
        verticalScrolling: false,
        horizontalScrolling: true,
        content: [
            oList2.clone()
        ]
    });


    var oButton = new Button("btn0", {
        text: "Popover Bottom",
        press: function () {
            oPopover.setPlacement(mLibrary.PlacementType.Bottom);
            oPopover.openBy(this);
        }
    });

    oButton.addStyleClass("positioned");
    var oButton1 = new Button("btn1", {
        text: "Popover Preferred Right or Flip",
        press: function () {
            oPopover.setPlacement(mLibrary.PlacementType.PreferredRightOrFlip);
            oPopover.openBy(this);
        }
    });

    oButton1.addStyleClass("positioned1");
    var oButton2 = new Button("btn2", {
        text: "Popover Left",
        press: function () {
            oPopover.setPlacement(mLibrary.PlacementType.Left);
            oPopover.openBy(this);
        }
    });

    oButton2.addStyleClass("positioned2");

    var oButton3 = new Button("btn3", {
        text: "Popover Top",
        press: function () {
            oPopover.setPlacement(mLibrary.PlacementType.Top);
            oPopover.openBy(this);
        }
    });
    oButton3.addStyleClass("positioned3");

    var oButton4 = new Button("btn4", {
        text: "Popover Vertical",
        press: function () {
            oPopover.setPlacement(mLibrary.PlacementType.Vertical);
            oPopover.openBy(this);
        }
    });
    oButton4.addStyleClass("positioned4");

    var oButton5 = new Button("btn5", {
        text: "Popover Vertical",
        press: function () {
            oPopover.setPlacement(mLibrary.PlacementType.Vertical);
            oPopover.openBy(this);
        }
    });
    oButton5.addStyleClass("positioned5");

    var oButton6 = new Button("btn6", {
        text: "Popover Horizontal",
        press: function () {
            oPopover3.openBy(this);
        }
    });
    oButton6.addStyleClass("positioned6");

    var oButton7 = new Button("btn7", {
        text: "Popover Horizontal",
        press: function () {
            oPopover2.openBy(this);
        }
    });
    oButton7.addStyleClass("positioned7");

    var oButton8 = new Button("btn8", {
        text: "Popover Auto",
        press: function () {
            oPopover.setPlacement(mLibrary.PlacementType.Auto);
            oPopover.openBy(this);
        }
    });
    oButton8.addStyleClass("positioned8");

    var oButton9 = new Button("btn9", {
        text: "Popover Auto",
        press: function () {
            oPopover.setPlacement(mLibrary.PlacementType.Auto);
            oPopover.openBy(this);
        }
    });
    oButton9.addStyleClass("positioned9");

    var oButton10 = new Button("btn10", {
        text: "Popover with dangers",
        press: function () {
            oPopoverSelect.openBy(this);
        }
    });

    var oList3 = new List({
        inset: true
    });

    bindListData(data, oItemTemplate1, oList3);

    var oPopover12 = new Popover("popover12", {
        placement: mLibrary.PlacementType.Left,
        showHeader: false,
        content: [
            new CheckBox("popover12CheckBox1",{text:"test1"}),
            new CheckBox("popover12CheckBox2",{text:"test2"}),
            new CheckBox("popover12CheckBox3",{text:"test3"})
        ]
    });

    var oButton15 = new Button("btn15", {
        text: "Popover with checkboxes",
        press: function () {
            oPopover12.openBy(this);
        }
    });
    oButton15.addStyleClass("positioned15");

    var oSearchProvider = new OpenSearchProvider({
        suggestUrl: "../../../proxy/http/en.wikipedia.org/w/api.php?action=opensearch&namespace=0&search={searchTerms}",
        suggestType: "json"
    });

    var oPopoverSelect = new Popover("popSelect", {
        content: [
            new Select("selectInPopover", {
                items: [
                    new Item({
                        key: "0",
                        text: "item 0"
                    }),
                    new Item({
                        key: "1",
                        text: "item 1"
                    }),
                    new Item({
                        key: "2",
                        text: "item 2"
                    }),
                    new Item({
                        key: "3",
                        text: "item 3"
                    })
                ]
            }),
            new Input({
                showSuggestion: true,
                placeholder: "Type here ...",
                suggest: function (oEvent) {
                    var that = this;
                    oSearchProvider.suggest(oEvent.getParameter("suggestValue"), function (sValue, aSuggestions) {
                        if (sValue === that.getValue()) {
                            that.destroySuggestionItems();
                            for (var i = 0; i < aSuggestions.length; i++) {
                                that.addSuggestionItem(new Item({text: aSuggestions[i]}));
                            }
                        }
                    });
                }
            })
        ],
        contentWidth: "20em",
        contentHeight: "50%"
    });

    var oButton16 = new Button("btn16", {
        text: "Nested Popovers",
        press: function () {
            oPopoverNested.openBy(this);
        }
    });
    oButton16.addStyleClass("positioned16");

    var oPopoverNested = new Popover("popNested", {
        title: "Nested Popovers",
        placement: mLibrary.PlacementType.Auto,
        content: [
            new HBox({
                items: [
                    new Button("nestedBtn", {
                        text: "Open Nested Popover",
                        press: function () {
                            var oPopover = new Popover({
                                title: "Description",
                                placement: mLibrary.PlacementType.Bottom
                            });

                            oPopover.addStyleClass("sapUiContentPadding");
                            oPopover.addContent(new Text({ text: "Further Descripton" }));
                            oPopover.openBy(this);
                        }
                    }),
                    new Link("defocus", { text: "Close" })
                ],
                justifyContent: mLibrary.FlexJustifyContent.SpaceAround,
                alignItems: mLibrary.FlexAlignItems.Center,
                renderType: mLibrary.FlexRendertype.Bare
            })
        ],
        contentWidth: "20em",
        contentHeight: "20em"
    });
    oPopoverNested.addStyleClass("sapUiContentPadding");

    var oVBox = new VBox({
        items: [
            new Button("with-h-with-f", {
                text: "WithH WithF",
                press: function () {
                    oPopover.setShowHeader(true);
                    oPopover.setFooter(footer);
                    oPopover.setPlacement(mLibrary.PlacementType.Right);
                    oPopover.openBy(this);
                }
            }),
            new Button("no-h-with-f", {
                text: "NoH WithF",
                press: function () {
                    oPopover.setShowHeader(false);
                    oPopover.setFooter(footer);
                    oPopover.setPlacement(mLibrary.PlacementType.Right);
                    oPopover.openBy(this);
                }
            }),
            new Button("with-h-no-f", {
                text: "WithH NoF",
                press: function () {
                    oPopover.setShowHeader(true);
                    oPopover.setFooter(null);
                    oPopover.setPlacement(mLibrary.PlacementType.Right);
                    oPopover.openBy(this);
                }
            }),
            new Button("no-h-no-f", {
                text: "NoH NoF",
                press: function () {
                    oPopover.setShowHeader(false);
                    oPopover.setFooter(null);
                    oPopover.setPlacement(mLibrary.PlacementType.Right);
                    oPopover.openBy(this);
                }
            }),
            oButton10
        ]
    });

    oVBox.addStyleClass("vbox");

    var i,
        aPopoverContent = [new Item({text: "UTC - (UTC+00:00) Burkina Faso, Bouvet Islands, Cote d'Ivoire, West Sahara, Ghana, Greenland, Gambia, Guinea, Guinea-Bissau, Heard/McDon.Isl, Brit.Ind.Oc.Ter, Iceland"})];
    for (i = 0; i < 40; i++) {
        aPopoverContent.push(new Item({text: "test"}));
    }
    var oOverflowingPopover = new ComboBox({
        id: "overflowing-popover",
        items: aPopoverContent
    });
    oOverflowingPopover.addStyleClass("positioned11");

    // Add a css class to the body HTML element, in order to be used for caret stylization in visual tests run.
    var oCustomCssButton = new Button("customCssButton",{
        text: "Toggle custom CSS for visual test",
        press: function() {
            var $body = jQuery("body");

            $body.toggleClass("customClassForVisualTests");
        }
    });
    var page1 = new Page("page1", {
        headerContent: [
            new CheckBox("customWithin", {
                text: "Custom Within",
                selected : false,
                select : function(event) {
                    var oWithin = document.getElementById("within");

                    if (event.getParameter("selected")) {
                        oWithin.style.display = "block";
                        Popup.setWithinArea(oWithin);
                    } else {
                        oWithin.style.display = "none";
                        Popup.setWithinArea(null);
                    }
                }
            }).addStyleClass("sapUiSmallMarginEnd"),
            new Title({
                text: "sap.m.Popover"
            }),
            new ToolbarSpacer({
                width: "600px"
            }),
            oCustomCssButton
        ],
        content: [
            oButton, oButton1, oButton2, oButton3, oButton4, oButton5, oButton6, oOverflowingPopover, oButton7, oButton8, oButton9, oVBox, oButton15, oButton16
        ]
    });

    app.addPage(page1);
    app.placeAt("div");
});
