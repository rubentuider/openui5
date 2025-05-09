/*eslint-env mocha */
import assert from "node:assert";
import configs from "../lib/config.js";
import { join, resolve } from "node:path";
import fs from "node:fs";
import fileContent from "../lib/fileContent.js";
import Generator from "../lib/Generator.js";
import j2j from "json2json";
import sinon from "sinon";
import Territories from "../lib/Territories.js";
import Timezones from "../lib/Timezones.js";
import trailingCurrencyCodeFormatter from "../lib/trailingCurrencyCodeFormatter.js";
import util from "../lib/util.js";

describe("Generator.js", function () {

	//*********************************************************************************************
	afterEach(function () {
		sinon.verify();
	});

	//*********************************************************************************************
	it("constructor", function () {
		// code under test
		const oGenerator = new Generator("~sSourceFolder", "~sOutputFolder", "~sCLDRVersion");

		assert.strictEqual(oGenerator._sCLDRVersion, "~sCLDRVersion");
		assert.strictEqual(oGenerator._sOutputFolder, "~sOutputFolder");
		assert.strictEqual(oGenerator._sSourceFolder, "~sSourceFolder");
		assert.deepEqual(oGenerator._aTasks, []);
		assert.ok(oGenerator._oTerritories instanceof Territories);
		assert.ok(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(oGenerator._sTimestamp));
		assert.ok(oGenerator._oTimezones instanceof Timezones);
		assert.deepEqual(oGenerator._mUnsupportedDateTimePatterns, null);
	});

	//*********************************************************************************************
	it("private members", function () {
		// code under test
		assert.strictEqual(Generator["#oCurrencySignReplacements"], undefined);
		assert.strictEqual(Generator["#oIndianCurrencyFormatShort"], undefined);
		assert.strictEqual(Generator["#oIndiaDecimalFormatShort"], undefined);
		assert.strictEqual(Generator["#oTZNamesReplacements"], undefined);
	});

	//*********************************************************************************************
	it("addStaticData: with calendar preferences", function () {
		const oUtilMock = sinon.mock(util);
		oUtilMock.expects("getCurrencyDigits").withExactArgs().returns("~CurrencyDigits");
		oUtilMock.expects("getPluralRules").withExactArgs("~sCLDRTag").returns({"~PluralRules": "~PluralRules"});
		oUtilMock.expects("getWeekData").withExactArgs("~sCLDRTag").returns({"~WeekData": "~WeekData"});
		oUtilMock.expects("getTimeData").withExactArgs("~sCLDRTag").returns({"~TimeData": "~TimeData"});
		oUtilMock.expects("getCalendarData").withExactArgs().returns({"~CalendarData": "~CalendarData"});
		oUtilMock.expects("getDayPeriodRules").withExactArgs("~sCLDRTag")
			.returns({"~DayPeriodRules": "~DayPeriodRules"});
		oUtilMock.expects("getCalendarPreference").withExactArgs("~sCLDRTag").returns("~CalendarPreference");
		const oResult = {};
		sinon.mock(Generator).expects("checkAndFixCalendarPreference")
			.withExactArgs(sinon.match.same(oResult), "~sCLDRTag");

		// code under test
		Generator.addStaticData(oResult, "~sCLDRTag");

		assert.deepEqual(oResult, {
			calendarPreference: "~CalendarPreference",
			currencyDigits: "~CurrencyDigits",
			"~CalendarData": "~CalendarData",
			"~DayPeriodRules": "~DayPeriodRules",
			"~PluralRules": "~PluralRules",
			"~TimeData": "~TimeData",
			"~WeekData": "~WeekData"
		});
	});

	//*********************************************************************************************
	it("addStaticData: no calendar preferences", function () {
		const oUtilMock = sinon.mock(util);
		oUtilMock.expects("getCurrencyDigits").withExactArgs().returns("~CurrencyDigits");
		oUtilMock.expects("getPluralRules").withExactArgs("zh-Hans-~foo").returns({"~PluralRules": "~PluralRules"});
		oUtilMock.expects("getWeekData").withExactArgs("zh-Hans-~foo").returns({"~WeekData": "~WeekData"});
		oUtilMock.expects("getTimeData").withExactArgs("zh-Hans-~foo").returns({"~TimeData": "~TimeData"});
		oUtilMock.expects("getCalendarData").withExactArgs().returns({"~CalendarData": "~CalendarData"});
		oUtilMock.expects("getDayPeriodRules").withExactArgs("zh-Hans-~foo")
			.returns({"~DayPeriodRules": "~DayPeriodRules"});
		oUtilMock.expects("getCalendarPreference").withExactArgs("zh-Hans-~foo").returns(undefined);
		const oResult = {};
		sinon.mock(Generator).expects("checkAndFixCalendarPreference")
			.withExactArgs(sinon.match.same(oResult), "zh-Hans-~foo");

		// code under test
		Generator.addStaticData(oResult, "zh-Hans-~foo");

		assert.deepEqual(oResult, {
			currencyDigits: "~CurrencyDigits",
			"~CalendarData": "~CalendarData",
			"~DayPeriodRules": "~DayPeriodRules",
			"~PluralRules": "~PluralRules",
			"~TimeData": "~TimeData",
			"~WeekData": "~WeekData"
		});
	});

	//*********************************************************************************************
	[
		{aCalendarPreference: ["gregorian"], sCLDRTag: "~foo"},
		{aCalendarPreference: undefined, sCLDRTag: "~foo"},
		{aCalendarPreference: ["islamic-umalqura"], sCLDRTag: "ar-SA"},
		{aCalendarPreference: ["persian"], sCLDRTag: "fa"},
		{aCalendarPreference: ["buddhist"], sCLDRTag: "th"}
	].forEach(({aCalendarPreference, sCLDRTag}, i) => {
		it("checkAndFixCalendarPreference: no log; #" + i, function () {
			const oResult = {calendarPreference: aCalendarPreference};

			// code under test
			Generator.checkAndFixCalendarPreference(oResult, "~foo");

			assert.strictEqual(oResult.calendarPreference, aCalendarPreference);
		});
	});

	//*********************************************************************************************
	[
		{
			oResult: {calendarPreference: ["islamic", "gregorian"]},
			sCLDRTag: "~foo",
			sMessage: `'~foo': ["islamic","gregorian"]`,
			oExpectedResult: {calendarPreference: ["islamic", "gregorian"]}
		},
		{
			oResult: {},
			sCLDRTag: "fa",
			sMessage: `'fa': undefined; keep known value: `
				+ `["persian","gregorian","islamic","islamic-civil","islamic-tbla"]`,
			oExpectedResult: {calendarPreference: ["persian", "gregorian", "islamic", "islamic-civil", "islamic-tbla"]}
		},
		{
			oResult: {calendarPreference: ["gregorian"]},
			sCLDRTag: "ar-SA",
			sMessage: `'ar-SA': ["gregorian"]; `
				+ `keep known value: ["islamic-umalqura","gregorian","islamic","islamic-rgsa"]`,
			oExpectedResult: {calendarPreference: ["islamic-umalqura", "gregorian", "islamic", "islamic-rgsa"]}
		},
		{
			oResult: {calendarPreference: ["gregorian"]},
			sCLDRTag: "th",
			sMessage: `'th': ["gregorian"]; keep known value: ["buddhist","gregorian"]`,
			oExpectedResult: {calendarPreference: ["buddhist", "gregorian"]}
		}
	].forEach(({oResult, sCLDRTag, sMessage, oExpectedResult}, i) => {
		it("checkAndFixCalendarPreference: with log; #" + i, function () {
			sinon.mock(console).expects("log")
				.withExactArgs("WARNING: Unexpected calendar preference for locale " + sMessage);

			// code under test
			Generator.checkAndFixCalendarPreference(oResult, sCLDRTag);

			assert.deepEqual(oResult, oExpectedResult);
		});
	});

	//*********************************************************************************************
	it("checkUnsupportedRTLCodes: success", function () {
		// code under test (the supported ones -> rAllRTLCharacters in NumberFormat.js)
		Generator.checkUnsupportedRTLCodes("someUI5Tag", {foo : "\u061c\u200e\u200f\u202a\u202b\u202c"});
	});

	//*********************************************************************************************
	["\u202d", "\u202e", "\u2066", "\u2067", "\u2068", "\u2069"].forEach(function(sRTLCode) {
		it("checkUnsupportedRTLCodes: \\u" + sRTLCode.codePointAt(0).toString(16), function () {
			const oResult = {foo : {bar : `unsupported ${sRTLCode} in bar pattern`}};

			/* eslint-disable max-nested-callbacks */
			assert.throws(() => {
				// code under test
				Generator.checkUnsupportedRTLCodes("someUI5Tag", oResult);
			}, new Error(`Unsupported RTL character \\u${sRTLCode.codePointAt(0).toString(16)}`
				+ ` found for locale someUI5Tag`
			));
		});
	});

	//*********************************************************************************************
	it("cleanupFileCacheAndWriteResult: mkdir and write successful", function () {
		const oGenerator = {
			_sOutputFolder: "~outputFolder",
			_aTasks: [],
			emit() {}
		};
		const oResult = {a: "b", c: {d: "e", f: 42}};
		sinon.mock(fileContent).expects("clearCache").withExactArgs();

		// code under test
		Generator.prototype.cleanupFileCacheAndWriteResult.call(oGenerator, "~sUI5Tag", oResult);

		assert.strictEqual(oGenerator._aTasks.length, 1);

		const oCallbacks = {fnCallback() {}};
		const oMkdirExpectation =
			sinon.mock(fs).expects("mkdir").withExactArgs("~outputFolder", {recursive: true}, sinon.match.func);
		const sResolvedPath = resolve(join("~outputFolder/~sUI5Tag.json"));
		sinon.mock(oCallbacks).expects("fnCallback").withExactArgs(null, sResolvedPath);

		// code under test
		oGenerator._aTasks[0](oCallbacks.fnCallback);

		const oWriteFileExpectation = sinon.mock(fs).expects("writeFile")
			.withExactArgs(sResolvedPath, "{\n\t\"a\": \"b\",\n\t\"c\": {\n\t\t\"d\": \"e\",\n\t\t\"f\": 42\n\t}\n}",
				sinon.match.func);

		// code under test - called by fs.mkdir
		oMkdirExpectation.args[0][2](null);

		sinon.mock(oGenerator).expects("emit").withExactArgs("localeJSONReady", sResolvedPath);

		// code under test - called by fs.writeFile
		oWriteFileExpectation.args[0][2](null);
	});

	//*********************************************************************************************
	it("cleanupFileCacheAndWriteResult: mkdir with error", function () {
		const oGenerator = {
			_sOutputFolder: "~outputFolder",
			_aTasks: [],
			emit() {}
		};
		sinon.mock(fileContent).expects("clearCache").withExactArgs();

		// code under test
		Generator.prototype.cleanupFileCacheAndWriteResult.call(oGenerator, "~sUI5Tag", "~oResult");

		assert.strictEqual(oGenerator._aTasks.length, 1);

		const oCallbacks = {fnCallback() {}};
		const oMkdirExpectation =
			sinon.mock(fs).expects("mkdir").withExactArgs("~outputFolder", {recursive: true}, sinon.match.func);
		const oError = new Error("Failed intentionally");
		sinon.mock(oCallbacks).expects("fnCallback").withExactArgs(oError, undefined);

		// code under test
		oGenerator._aTasks[0](oCallbacks.fnCallback);

		sinon.mock(fs).expects("writeFile").never();
		sinon.mock(oGenerator).expects("emit").withExactArgs("error", oError);

		// code under test - called by fs.mkdir
		oMkdirExpectation.args[0][2](oError);
	});

	//*********************************************************************************************
	it("cleanupFileCacheAndWriteResult: mkdir successful and write fails", function () {
		const oGenerator = {
			_sOutputFolder: "~outputFolder",
			_aTasks: [],
			emit() {}
		};
		sinon.mock(fileContent).expects("clearCache").withExactArgs();

		// code under test
		Generator.prototype.cleanupFileCacheAndWriteResult.call(oGenerator, "~sUI5Tag", "~oResult");

		assert.strictEqual(oGenerator._aTasks.length, 1);

		const oCallbacks = {fnCallback() {}};
		const oMkdirExpectation =
			sinon.mock(fs).expects("mkdir").withExactArgs("~outputFolder", {recursive: true}, sinon.match.func);
		const oError = new Error("Failed intentionally");
		const sResolvedPath = resolve(join("~outputFolder/~sUI5Tag.json"));
		sinon.mock(oCallbacks).expects("fnCallback").withExactArgs(oError, sResolvedPath);

		// code under test
		oGenerator._aTasks[0](oCallbacks.fnCallback);

		const oWriteFileExpectation =
			sinon.mock(fs).expects("writeFile").withExactArgs(sResolvedPath, sinon.match.string, sinon.match.func);

		// code under test - called by fs.mkdir
		oMkdirExpectation.args[0][2](null);

		sinon.mock(oGenerator).expects("emit").withExactArgs("error", oError);

		// code under test - called by fs.writeFile
		oWriteFileExpectation.args[0][2](oError);
	});

	//*********************************************************************************************
	[
		{sUI5Tag: "zh_CN", sCLDRTag: "zh-Hans-CN"},
		{sUI5Tag: "zh_SG", sCLDRTag: "zh-Hans-SG"},
		{sUI5Tag: "zh_TW", sCLDRTag: "zh-Hant-TW"},
		{sUI5Tag: "zh_HK", sCLDRTag: "zh-Hans-HK"},
		{sUI5Tag: "en", sCLDRTag: "en"},
		{sUI5Tag: "de_CH", sCLDRTag: "de-CH"},
		{sUI5Tag: "cnr", sCLDRTag: "sr-Latn-ME"},
		{sUI5Tag: "foo_bar", sCLDRTag: "foo-bar"}
	].forEach(({sUI5Tag, sCLDRTag}) => {
		it("getCLDRTag: " + sUI5Tag + " -> " + sCLDRTag, function () {
			// code under test
			assert.strictEqual(Generator.getCLDRTag(sUI5Tag), sCLDRTag);
		});
	});

	//*********************************************************************************************
	it("getParentLocaleTag", function () {
		sinon.mock(fileContent).expects("getContent")
			// join is used to create the platform specific path delimiter
			.withExactArgs(join("foo/bar/cldr-core/supplemental/parentLocales.json"))
			.twice()
			.returns({
				supplemental : {
					parentLocales : {
						parentLocale : {"~CLDRTag" : "~ParentCLDRTag"}
					}
				}
			});

		// code under test
		assert.strictEqual(Generator.getParentLocaleTag("foo/bar/", "~CLDRTag"), "~ParentCLDRTag");
		assert.strictEqual(Generator.getParentLocaleTag("foo/bar/", "~CLDRTagWithNoParent"), undefined);
	});

	//*********************************************************************************************
	it("formatLocaleData", function () {
		const sFilePath = join("~sSrcFolder/~packageName/main/~LocaleTag/~fileName");
		sinon.mock(fs).expects("existsSync").withExactArgs(sFilePath).returns(true);
		sinon.mock(fileContent).expects("getContent")
			.withExactArgs(sFilePath)
			.returns({
				main : {
					"~LocaleTag" : {
						identity : {language : "~Language"},
						localeDisplayNames : {languages : {}}
					}
				}
			});

		const oObjectTemplate = {template : "~Template", transform() {}};
		sinon.mock(j2j).expects("ObjectTemplate").withExactArgs("~Template").returns(oObjectTemplate);
		sinon.mock(oObjectTemplate).expects("transform")
			.withExactArgs({ identity : { language : "~Language" },localeDisplayNames : { languages : {} } })
			.returns({data : "~oResult", template : "~Template"});

		const mConfig = {
			fileName : "~fileName",
			packageName : "~packageName",
			template : "~Template"
		};
		const oResult = {data : "~oResult"};

		// code under test
		Generator.formatLocaleData("~sSrcFolder", mConfig, "~LocaleTag", oResult);

		assert.deepEqual(oResult, {data : "~oResult", template : "~Template"});
	});

	//*********************************************************************************************
	it("formatLocaleData: file doesn't exist", function () {
		const sFilePath = join("~sSrcFolder/~packageName/main/~LocaleTag/~fileName");
		sinon.mock(fs).expects("existsSync").withExactArgs(sFilePath).returns(false);
		sinon.mock(fileContent).expects("getContent").never();
		sinon.mock(j2j).expects("ObjectTemplate").never();

		const mConfig = {
			fileName : "~fileName",
			packageName : "~packageName"
		};

		// code under test
		Generator.formatLocaleData("~sSrcFolder", mConfig, "~LocaleTag", "~oResult");
	});

	//*********************************************************************************************
	it("formatLocaleData: child data overwrites parent data for currencySymbols", function () {
		const sFilePath = join("~sSrcFolder/~packageName/main/~LocaleTag/currencies.json");
		sinon.mock(fs).expects("existsSync").withExactArgs(sFilePath).returns(true);
		sinon.mock(fileContent).expects("getContent")
			.withExactArgs(sFilePath)
			.returns({
				main: {
					"~LocaleTag": {
						numbers: {currencies:  {"SameCurrency": "~ChildCurrency"}}
					}
				}
			});

		const oObjectTemplate = {template: "~Template", transform() {}};
		sinon.mock(j2j).expects("ObjectTemplate").withExactArgs("~Template").returns(oObjectTemplate);
		sinon.mock(oObjectTemplate).expects("transform")
			.withExactArgs({numbers: {currencies:  {"SameCurrency": "~ChildCurrency"}}})
			.returns({currencySymbols: {"SameCurrency": "~ChildCurrency"}});

		const mConfig = {
			fileName: "currencies.json",
			packageName: "~packageName",
			template: "~Template"
		};
		const oResult = {
			currencySymbols: {
				"ParentCurrency": "~Value",
				"SameCurrency": "~ValueParent"
			}
		};

		// code under test
		Generator.formatLocaleData("~sSrcFolder", mConfig, "~LocaleTag", oResult);

		assert.deepEqual(oResult, {currencySymbols: {
			"ParentCurrency": "~Value",
			"SameCurrency": "~ChildCurrency"
		}});
	});

	//*********************************************************************************************
	it("processConfigTemplates: without parent tag", function () {
		sinon.mock(Generator).expects("formatLocaleData")
			.withExactArgs("~sSrcFolder", "~mConfig", "~sCLDRTag", "~oResult");

		// code under test
		Generator.processConfigTemplates("~sSrcFolder", "~mConfig", "~sCLDRTag", "~oResult");
	});

	// *********************************************************************************************
	it("processConfigTemplates: with parent tag", function () {
		const oGeneratorMock = sinon.mock(Generator);

		oGeneratorMock.expects("formatLocaleData")
			.withExactArgs("~sSrcFolder", "~mConfig", "~sParentLocaleTag", "~oResult");
		oGeneratorMock.expects("formatLocaleData")
			.withExactArgs("~sSrcFolder", "~mConfig", "~sCLDRTag", "~oResult");

		// code under test
		Generator.processConfigTemplates("~sSrcFolder", "~mConfig", "~sCLDRTag", "~oResult", "~sParentLocaleTag");
	});

	//*********************************************************************************************
	[
		{CLDRTag : "zh-Hans-CN", PathTag : "zh-Hans"},
		{CLDRTag : "zh-Hant-TW", PathTag : "zh-Hant"}
	].forEach(function (oFixture) {
		it("processConfigTemplates: with special sCLDRTag: " + oFixture.CLDRTag, function () {
			sinon.mock(Generator).expects("formatLocaleData")
				.withExactArgs("~sSrcFolder", "~mConfig", oFixture.PathTag, "~oResult");

			// code under test
			Generator.processConfigTemplates("~sSrcFolder", "~mConfig", oFixture.CLDRTag, "~oResult");
		});
	});

	//*********************************************************************************************
	[
		{
			sCLDRTag: "ar",
			accounting: "0\u202b¤\u200e\u202c",
			"currencyFormat-sap-short": "0\u202a¤\u202c",
			"currencyFormat-short": "0\u202b¤\u200e\u202c",
			"sap-accounting": "0\u202a¤\u202c",
			"sap-standard": "0\u202a¤\u202c",
			standard: "0\u202b¤\u200e\u202c"
		}, {
			sCLDRTag: "de",
			accounting: "0¤",
			"currencyFormat-sap-short": "0¤",
			"currencyFormat-short": "0¤",
			"sap-accounting": "0¤",
			"sap-standard": "0¤",
			standard: "0¤"
		}, {
			sCLDRTag: "fa",
			accounting: "0\u202a¤\u202c",
			"currencyFormat-sap-short": "0\u202a¤\u202c",
			"currencyFormat-short": "0\u202a¤\u202c",
			"sap-accounting": "0\u202a¤\u202c",
			"sap-standard": "0\u202a¤\u202c",
			standard: "0\u202a¤\u202c"
		}, {
			sCLDRTag: "he",
			accounting: "0¤\u200e",
			"currencyFormat-sap-short": "0\u200e¤",
			"currencyFormat-short": "0\u200e¤",
			"sap-accounting": "0¤\u200e",
			"sap-standard": "0¤\u200e",
			standard: "0¤\u200e"
		}
	].forEach((oFixture) => {
		it("updateCurrencyFormats integrative test: " + "'" + oFixture.sCLDRTag + "'", function () {
			const oResult = {
				currencyFormat: {
					standard: "0¤",
					accounting: "0¤",
					currencySpacing: {
						beforeCurrency: {
							insertBetween: "\u00a0"
						}
					}
				},
				"currencyFormat-short": {
					"1000-one": "0¤"
				}
			};

			// code under test
			Generator.updateCurrencyFormats(oFixture.sCLDRTag, oResult);

			assert.strictEqual(oResult.currencyFormat.accounting, oFixture.accounting);
			assert.deepEqual(oResult["currencyFormat-sap-short"], {"1000-one": oFixture["currencyFormat-sap-short"]});
			assert.deepEqual(oResult["currencyFormat-short"], {"1000-one": oFixture["currencyFormat-short"]});
			assert.strictEqual(oResult.currencyFormat["sap-accounting"], oFixture["sap-accounting"]);
			assert.strictEqual(oResult.currencyFormat["sap-standard"], oFixture["sap-standard"]);
			assert.strictEqual(oResult.currencyFormat.standard, oFixture.standard);
			assert.strictEqual(oResult.currencyFormat.currencySpacing, undefined);
		});
	});

	//*********************************************************************************************
	it("updateCurrencyFormats integrative test 'en-IN'", function () {
		const oCurrencyFormat = {
			standard: "0¤",
			accounting: "0¤",
			currencySpacing: {
				beforeCurrency: {
					insertBetween: "\u00a0"
				}
			}
		};
		const oResultEnGB = {
			currencyFormat: JSON.parse(JSON.stringify(oCurrencyFormat)),
			"currencyFormat-short": {
				"1000-one": "¤0K",
				"1000-one-alphaNextToNumber": "¤\u00a0" + "0K",
				"1000-other": "¤0K",
				"1000-other-alphaNextToNumber": "¤\u00a0" + "0" + "\u00a0" + "K"
			},
			"decimalFormat-short": {
				"1000-one": "0K",
				"1000-other": "0K"
			}
		};

		// code under test
		Generator.updateCurrencyFormats("en-GB", oResultEnGB);

		assert.deepEqual(oResultEnGB["currencyFormat-short"],
			{
				"1000-one": "¤0K",
				"1000-one-alphaNextToNumber": "¤\u00a0" + "0K",
				"1000-other": "¤0K",
				"1000-other-alphaNextToNumber": "¤\u00a0" + "0" + "\u00a0" + "K"
			}
		);
		assert.deepEqual(oResultEnGB["decimalFormat-short"],
			{
				"1000-one": "0K",
				"1000-other": "0K"
			}
		);
		assert.deepEqual(oResultEnGB["currencyFormat-sap-short"],
			{
				"1000-one": "0K\u00a0¤",
				"1000-other": "0K\u00a0¤",
				"1000-other-alphaNextToNumber": "0" + "\u00a0" + "K" + "\u00a0¤"
			}
		);

		const oResultEnIN = {
			currencyFormat: JSON.parse(JSON.stringify(oCurrencyFormat)),
			"currencyFormat-short": {
				"1000-one": "¤0T",
				"1000-one-alphaNextToNumber": "¤\u00a0" + "0T",
				"1000-other": "¤0T",
				"1000-other-alphaNextToNumber": "¤\u00a0" + "0T"
			},
			"decimalFormat-short": {
				"1000-one": "0T",
				"1000-other": "0T"
			}
		};

		// code under test
		Generator.updateCurrencyFormats("en-IN", oResultEnIN);

		assert.strictEqual(oResultEnIN["currencyFormat-short"], oResultEnGB["currencyFormat-short"]);
		assert.strictEqual(oResultEnIN["decimalFormat-short"], oResultEnGB["decimalFormat-short"]);
		const oIndianCurrencyShortFormat = Generator._oIndianFormat["currencyFormat-short"];
		assert.deepEqual(oResultEnIN["currencyFormat-short-indian"], oIndianCurrencyShortFormat);
		assert.deepEqual(oResultEnIN["decimalFormat-short-indian"], Generator._oIndianFormat["decimalFormat-short"]);
		assert.deepEqual(oResultEnIN["currencyFormat-sap-short"], oResultEnGB["currencyFormat-sap-short"]);
		const oExpectedSAPIndianSort = Object.keys(oIndianCurrencyShortFormat).reduce((oResult, sKey) => {
			if (!sKey.endsWith("-alphaNextToNumber")) {
				oResult[sKey] = oIndianCurrencyShortFormat[sKey].slice(1) + "\u00a0" + "¤";
			}
			return oResult;
		}, {});
		assert.deepEqual(oResultEnIN["currencyFormat-sap-short-indian"], oExpectedSAPIndianSort);
	});

	//*********************************************************************************************
	[
		{
			sCLDRTag: "ar",
			currencySign: "\u202b¤\u200e\u202c",
			currencySignTrailing: "\u202a¤\u202c",
			shortCurrencySign: "\u202b¤\u200e\u202c",
			shortCurrencySignTrailing: "\u202a¤\u202c",
			transformTrailingCurrency: true
		}, {
			sCLDRTag: "fa",
			currencySign: "\u202a¤\u202c",
			currencySignTrailing: "\u202a¤\u202c",
			shortCurrencySign: "\u202a¤\u202c",
			shortCurrencySignTrailing: "\u202a¤\u202c",
			transformTrailingCurrency: false
		}, {
			sCLDRTag: "he",
			currencySign: "¤\u200e",
			currencySignTrailing: "¤\u200e",
			shortCurrencySign: "\u200e¤",
			shortCurrencySignTrailing: "\u200e¤",
			transformTrailingCurrency: false
		}, {
			sCLDRTag: "foo",
			currencySign: "¤",
			currencySignTrailing: "¤",
			shortCurrencySign: "¤",
			shortCurrencySignTrailing: "¤",
			transformTrailingCurrency: true
		}
	].forEach((oFixture) => {
		it("updateCurrencyFormats: " + "'" + oFixture.sCLDRTag + "'", function () {
			const oResult = {
				currencyFormat: {
					currencySpacing: {
						beforeCurrency: {
							insertBetween: "~CurrencySpacingBefore"
						}
					}
				},
				"currencyFormat-short": "~CurrencyFormatShort"
			};

			sinon.mock(Generator).expects("updateAccountingAndStandardCurrencyFormat")
				.withExactArgs(sinon.match.same(oResult.currencyFormat), oFixture.currencySign,
					"~CurrencySpacingBefore", oFixture.transformTrailingCurrency, oFixture.currencySignTrailing);
			sinon.mock(Generator).expects("updateShortCurrencyFormats")
				.withExactArgs("~CurrencyFormatShort", oFixture.shortCurrencySign, "~CurrencySpacingBefore",
					oFixture.transformTrailingCurrency, oFixture.shortCurrencySignTrailing)
				.returns("~CurrencyFormatSAPShort");

			// code under test
			Generator.updateCurrencyFormats(oFixture.sCLDRTag, oResult);

			assert.strictEqual(oResult["currencyFormat-sap-short"], "~CurrencyFormatSAPShort");
			assert.strictEqual(oResult.currencyFormat.currencySpacing, undefined);
		});
	});

	//*********************************************************************************************
	it("updateCurrencyFormats: en-GB; remembers the currency and decimal formats", function () {
		const oENResult = {
			currencyFormat: {
				currencySpacing: {
					beforeCurrency: {insertBetween: "~SpaceBeforeGB"}
				}
			},
			"currencyFormat-short": "~CurrencyFormatShortGB",
			"decimalFormat-short": "~DecimalFormatShortGB"
		};
		Generator._oGBCurrencyFormatShort = undefined;
		Generator._oGBDecimalFormatShort = undefined;
		const oGeneratorMock = sinon.mock(Generator);
		oGeneratorMock.expects("updateAccountingAndStandardCurrencyFormat")
			.withExactArgs(sinon.match.same(oENResult.currencyFormat), "¤", "~SpaceBeforeGB", true, "¤");
		oGeneratorMock.expects("updateShortCurrencyFormats")
			.withExactArgs("~CurrencyFormatShortGB", "¤", "~SpaceBeforeGB", true, "¤")
			.returns("~CurrencyFormatSAPShortGB");

		// code under test - remember the format used later as default for en-IN locale
		Generator.updateCurrencyFormats("en-GB", oENResult);

		assert.strictEqual(Generator._oGBCurrencyFormatShort, "~CurrencyFormatShortGB");
		assert.strictEqual(Generator._oGBDecimalFormatShort, "~DecimalFormatShortGB");
		assert.strictEqual(oENResult["currencyFormat-sap-short"], "~CurrencyFormatSAPShortGB");
		assert.strictEqual(oENResult["currencyFormat-short-indian"], undefined);
		assert.strictEqual(oENResult["decimalFormat-short-indian"], undefined);
		assert.strictEqual(oENResult["currencyFormat-sap-short-indian"], undefined);
	});

	//*********************************************************************************************
	it("updateCurrencyFormats: en-IN; uses by default the en-GB currency and decimal formats", function () {
		const oINResult = {
			currencyFormat: {
				currencySpacing: {
					beforeCurrency: {insertBetween: "~SpaceBeforeIN"}
				}
			},
			"currencyFormat-short": "~CurrencyFormatShortIN",
			"decimalFormat-short": "~DecimalFormatShortIN"
		};
		Generator._oGBCurrencyFormatShort = "~CurrencyFormatShortGB";
		Generator._oGBDecimalFormatShort = "~DecimalFormatShortGB";
		const oGeneratorMock = sinon.mock(Generator);
		oGeneratorMock.expects("updateAccountingAndStandardCurrencyFormat")
			.withExactArgs(sinon.match.same(oINResult.currencyFormat), "¤", "~SpaceBeforeIN", true, "¤");
		oGeneratorMock.expects("updateShortCurrencyFormats")
			.withExactArgs("~CurrencyFormatShortGB", "¤", "~SpaceBeforeIN", true, "¤")
			.returns("~CurrencyFormatSAPShortGB");
		oGeneratorMock.expects("updateShortCurrencyFormats")
			.withExactArgs(sinon.match.same(Generator._oIndianFormat["currencyFormat-short"]), "¤", "~SpaceBeforeIN",
				true, "¤")
			.returns("~CurrencyFormatSAPShortIN");

		// code under test
		Generator.updateCurrencyFormats("en-IN", oINResult);

		assert.strictEqual(oINResult["currencyFormat-sap-short"], "~CurrencyFormatSAPShortGB");
		assert.strictEqual(oINResult["currencyFormat-short-indian"], Generator._oIndianFormat["currencyFormat-short"]);
		assert.strictEqual(oINResult["decimalFormat-short-indian"], Generator._oIndianFormat["decimalFormat-short"]);
		assert.strictEqual(oINResult["currencyFormat-sap-short-indian"], "~CurrencyFormatSAPShortIN");
	});

	//*********************************************************************************************
	it("getTrailingCurrency transform trailing: true", function () {
		sinon.mock(trailingCurrencyCodeFormatter).expects("transformCurrencyPattern")
			.withExactArgs("~foo", "~CurrencySpacingBefore")
			.returns("~a¤;~b¤~c;¤~b");

		// code under test
		assert.strictEqual(
			Generator.getTrailingCurrency("~foo", "~CurrencySpacingBefore", true, "~Replacement"),
			"~a~Replacement;~b~Replacement~c;~Replacement~b");
	});

	//*********************************************************************************************
	it("getTrailingCurrency transform trailing: false", function () {
		sinon.mock(trailingCurrencyCodeFormatter).expects("transformCurrencyPattern").never();

		// code under test
		assert.strictEqual(
			Generator.getTrailingCurrency("~a¤;~b¤~c;¤~b", "~CurrencySpacingBefore", false, "~Replacement"),
			"~a~Replacement;~b~Replacement~c;~Replacement~b");
	});

	//*********************************************************************************************
	it("getTrailingShortCurrency transform trailing: true", function () {
		sinon.mock(trailingCurrencyCodeFormatter).expects("transformShortCurrencyPattern")
			.withExactArgs("~foo", "~CurrencySpacingBefore")
			.returns("~a¤;~b¤~c;¤~b");

		// code under test
		assert.strictEqual(
			Generator.getTrailingShortCurrency("~foo", "~CurrencySpacingBefore", true, "~Replacement"),
			"~a~Replacement;~b~Replacement~c;~Replacement~b");
	});

	//*********************************************************************************************
	it("getTrailingShortCurrency transform trailing: false", function () {
		sinon.mock(trailingCurrencyCodeFormatter).expects("transformShortCurrencyPattern").never();

		// code under test
		assert.strictEqual(
			Generator.getTrailingShortCurrency("~a¤;~b¤~c;¤~b", "~CurrencySpacingBefore", false, "~Replacement"),
			"~a~Replacement;~b~Replacement~c;~Replacement~b");
	});

	//*********************************************************************************************
	[{
		oCurrencyFormat: {
			accounting: "~x¤~y;~z¤",
			"accounting-noCurrency": "~accounting-noCurrency",
			standard: "~a¤~b;~c¤",
			"standard-noCurrency": "~standard-noCurrency"
		}
	}, {
		oCurrencyFormat: {
			accounting: "~x¤~y;~z¤",
			"accounting-alphaNextToNumber": "~x ¤~y;~z ¤",
			"accounting-noCurrency": "~accounting-noCurrency",
			standard: "~a¤~b;~c¤",
			"standard-noCurrency": "~standard-noCurrency"
		},
		bAccountingAlphaNextToNumber: true
	}, {
		oCurrencyFormat: {
			accounting: "~x¤~y;~z¤",
			"accounting-noCurrency": "~accounting-noCurrency",
			standard: "~a¤~b;~c¤",
			"standard-alphaNextToNumber": "~a ¤~b;~c ¤",
			"standard-noCurrency": "~standard-noCurrency"
		},
		bStandardAlphaNextToNumber: true
	}].forEach(({oCurrencyFormat, bAccountingAlphaNextToNumber, bStandardAlphaNextToNumber}, i) => {
		it("updateAccountingAndStandardCurrencyFormat: #" + i, function () {
			const GeneratorMock = sinon.mock(Generator);

			GeneratorMock.expects("getTrailingCurrency")
				.withExactArgs("~a¤~b;~c¤", "~CurrencySpacingBefore", "~bTransformTrailingCurrency",
					"~currencySignTrailingReplacement")
				.returns("~standardTrailing");
			GeneratorMock.expects("getTrailingCurrency")
				.withExactArgs("~x¤~y;~z¤", "~CurrencySpacingBefore", "~bTransformTrailingCurrency",
					"~currencySignTrailingReplacement")
				.returns("~accountingTrailing");
			GeneratorMock.expects("getTrailingCurrency")
				.withExactArgs("~a ¤~b;~c ¤", "~CurrencySpacingBefore", "~bTransformTrailingCurrency",
					"~currencySignTrailingReplacement")
				.exactly(bStandardAlphaNextToNumber ? 1 : 0)
				.returns("~standardAlphaNextToNumberTrailing");
			GeneratorMock.expects("getTrailingCurrency")
				.withExactArgs("~x ¤~y;~z ¤", "~CurrencySpacingBefore", "~bTransformTrailingCurrency",
					"~currencySignTrailingReplacement")
				.exactly(bAccountingAlphaNextToNumber ? 1 : 0)
				.returns("~accountingAlphaNextToNumberTrailing");

			// code under test
			Generator.updateAccountingAndStandardCurrencyFormat(oCurrencyFormat, "$", "~CurrencySpacingBefore",
				"~bTransformTrailingCurrency", "~currencySignTrailingReplacement");

			assert.strictEqual(oCurrencyFormat.accounting, "~x$~y;~z$");
			assert.strictEqual(oCurrencyFormat.standard, "~a$~b;~c$");
			assert.strictEqual(oCurrencyFormat["sap-accounting"], "~accountingTrailing");
			assert.strictEqual(oCurrencyFormat["sap-accounting-noCurrency"], "~accounting-noCurrency");
			if (bAccountingAlphaNextToNumber) {
				assert.strictEqual(oCurrencyFormat["accounting-alphaNextToNumber"], "~x $~y;~z $");
				assert.strictEqual(oCurrencyFormat["sap-accounting-alphaNextToNumber"],
					"~accountingAlphaNextToNumberTrailing");
			}
			assert.strictEqual(oCurrencyFormat["sap-standard"], "~standardTrailing");
			assert.strictEqual(oCurrencyFormat["sap-standard-noCurrency"], "~standard-noCurrency");
			if (bStandardAlphaNextToNumber) {
				assert.strictEqual(oCurrencyFormat["standard-alphaNextToNumber"], "~a $~b;~c $");
				assert.strictEqual(oCurrencyFormat["sap-standard-alphaNextToNumber"],
					"~standardAlphaNextToNumberTrailing");
			}
		});
	});

	//*********************************************************************************************
	it("updateShortCurrencyFormats", function () {
		const oCurrencyFormatShort = {
			a: "a¤;¤A",
			"a-alphaNextToNumber": "a ¤;¤ A",
			b: "b k¤;¤B k",
			"b-alphaNextToNumber": "b k ¤;¤ B k"
		};
		const GeneratorMock = sinon.mock(Generator);

		GeneratorMock.expects("getTrailingShortCurrency")
			.withExactArgs("a¤;¤A", "~CurrencySpacingBefore", "~bTransformTrailingCurrency",
				"~sShortCurrencySignTrailingReplacement")
			.returns("~newA");
		GeneratorMock.expects("getTrailingShortCurrency")
			.withExactArgs("a ¤;¤ A", "~CurrencySpacingBefore", "~bTransformTrailingCurrency",
				"~sShortCurrencySignTrailingReplacement")
			.returns("~newA-alphaNextToNumber");
		GeneratorMock.expects("getTrailingShortCurrency")
			.withExactArgs("b k¤;¤B k", "~CurrencySpacingBefore", "~bTransformTrailingCurrency",
				"~sShortCurrencySignTrailingReplacement")
			.returns("~newB");
		GeneratorMock.expects("getTrailingShortCurrency")
			.withExactArgs("b k ¤;¤ B k", "~CurrencySpacingBefore", "~bTransformTrailingCurrency",
				"~sShortCurrencySignTrailingReplacement")
			// after moving the currency sign to the end and there is no difference between the standard and
			// the "-alphaNextToNumber" value, the "-alphaNextToNumber" entry has to be skipped
			.returns("~newB");

		// code under test
		assert.deepEqual(
			Generator.updateShortCurrencyFormats(oCurrencyFormatShort, "€", "~CurrencySpacingBefore",
				"~bTransformTrailingCurrency", "~sShortCurrencySignTrailingReplacement"),
			{
				a: "~newA",
				"a-alphaNextToNumber": "~newA-alphaNextToNumber",
				b: "~newB"
			}
		);

		assert.deepEqual(oCurrencyFormatShort, {
			a: "a€;€A",
			"a-alphaNextToNumber": "a €;€ A",
			b: "b k€;€B k",
			"b-alphaNextToNumber": "b k €;€ B k"
		});
	});

	//*********************************************************************************************
	[
		{sUI5Tag: "~sRTLLocale0", bRtl: true, aExpectedRTLLocales: ["~sRTLLocale0"]},
		{sUI5Tag: "~sUI5Tag", bRtl: false, aExpectedRTLLocales: ["~sRTLLocale0"]},
		{sUI5Tag: "~zh_TW", bRtl: false, aExpectedRTLLocales: ["~sRTLLocale0"]}, /* BCP: 2380141822 */
		{sUI5Tag: "~sRTLLocale1", bRtl: true, aExpectedRTLLocales: ["~sRTLLocale0", "~sRTLLocale1"]}
	].forEach(({sUI5Tag, bRtl, aExpectedRTLLocales}) => {
		it(`generateLocaleFile for locale: ${sUI5Tag}`, function () {
			const oGenerator = {
				_sCLDRVersion: "~sCLDRVersion",
				_sSourceFolder: "~sSourceFolder",
				_oTerritories: {
					updateLocaleTerritories() {}
				},
				_oTimezones : {
					updateLocaleTimezones() {}
				},
				_sTimestamp: "~sTimestamp",
				aUI5Tags: [sUI5Tag],
				checkAllDateTimePatterns() {},
				checkUnsupportedRTLCodes() {},
				cleanupFileCacheAndWriteResult() {},
				updateMonthAbbreviations() {},
				updateTimezones() {}
			};
			const oGeneratorMock = sinon.mock(Generator);
			let oResult;

			oGeneratorMock.expects("getCLDRTag").withExactArgs(sUI5Tag).returns("~sCLDRTag");
			oGeneratorMock.expects("getParentLocaleTag")
				.withExactArgs("~sSourceFolder", "~sCLDRTag")
				.returns("~sParentLocaleTag");
			configs.forEach((mConfig, i) => {
				oGeneratorMock.expects("processConfigTemplates")
					.withExactArgs("~sSourceFolder", sinon.match.same(mConfig), "~sCLDRTag", sinon.match.object,
						"~sParentLocaleTag")
					.callsFake((sSourceFolder, mConfig, sCLDRTag, oResult0, sParentLocaleTag) => {
						if (i === 0) {
							assert.deepEqual(oResult0, {
								"__buildtime": "~sTimestamp",
								"__license": "This file has been derived from Unicode Common Locale Data Repository"
									+ " (CLDR) files (http://cldr.unicode.org). See the copyright and permission notice"
									+ " in the Unicode-Data-Files-LICENSE.txt available at the same location as this"
									+ " file or visit http://www.unicode.org/copyright.html",
								"__version": "~sCLDRVersion"
							});
							oResult0.rtl = bRtl;
							oResult = oResult0;
						} else {
							assert.strictEqual(oResult, oResult0);
						}
					});
			});
			sinon.mock(oGenerator).expects("updateMonthAbbreviations")
				.withExactArgs(sinon.match((oResult0) => oResult0 === oResult), sUI5Tag);
			oGeneratorMock.expects("addMissingLanguageNameForMontenegrin")
				.withExactArgs(sinon.match((oResult0) => oResult0 === oResult), sUI5Tag);
			sinon.mock(oGenerator._oTerritories).expects("updateLocaleTerritories")
				.withExactArgs(sinon.match((oResult0) => oResult0 === oResult), sUI5Tag);
			oGeneratorMock.expects("updateCurrencyFormats")
				.withExactArgs("~sCLDRTag", sinon.match((oResult0) => oResult0 === oResult));
			sinon.mock(oGenerator._oTimezones).expects("updateLocaleTimezones")
				.withExactArgs("~sCLDRTag", sinon.match((oResult0) => oResult0 === oResult));
			oGeneratorMock.expects("addStaticData")
				.withExactArgs(sinon.match((oResult0) => oResult0 === oResult), "~sCLDRTag");
			oGeneratorMock.expects("checkUnsupportedRTLCodes")
				.withExactArgs(sUI5Tag, sinon.match((oResult0) => oResult0 === oResult));
			sinon.mock(oGenerator).expects("checkAllDateTimePatterns")
				.withExactArgs(sUI5Tag, sinon.match((oResult0) => oResult0 === oResult));
			oGeneratorMock.expects("addCalendarWeekTexts")
				.withExactArgs(sinon.match((oResult0) => oResult0 === oResult), sUI5Tag);
			sinon.mock(oGenerator).expects("cleanupFileCacheAndWriteResult")
				.withExactArgs(sUI5Tag, sinon.match((oResult0) => oResult0 === oResult));

			// code under test
			Generator.prototype.generateLocaleFile.call(oGenerator, sUI5Tag);

			assert.deepEqual(Generator.aRTLLocales, aExpectedRTLLocales);
		});
	});

	//*********************************************************************************************
	it("getPropertyPathValue", function () {
		const oData = {
			a: "A",
			b: {
				c: "C",
				d: {
					e: 42,
					f: {
						g: ["G"]
					}
				}
			}
		};
		const oDataCopy = JSON.parse(JSON.stringify(oData));

		// code under test
		assert.strictEqual(Generator.getPropertyPathValue(oData, []), oData);
		assert.strictEqual(Generator.getPropertyPathValue(oData, ["b", "x", "y"]), undefined);
		assert.strictEqual(Generator.getPropertyPathValue(oData, ["a"]), "A");
		assert.strictEqual(Generator.getPropertyPathValue(oData, ["b", "c"]), "C");
		assert.strictEqual(Generator.getPropertyPathValue(oData, ["b", "d"]), oData.b.d);
		assert.strictEqual(Generator.getPropertyPathValue(oData, ["b", "d", "e"]), 42);
		assert.strictEqual(Generator.getPropertyPathValue(oData, ["b", "d", "f", "g"]), oData.b.d.f.g);

		assert.deepEqual(oData, oDataCopy, "source object not modified");
	});

	//*********************************************************************************************
	it("updateAlternatives", function () {
		const oGeneratorMock = sinon.mock(Generator);
		const aFormerData = ["a", "bFormer", ["c", "cFormer"], ["dFormer0", "dFormer1"], ["eFormer0", "e"]];
		oGeneratorMock.expects("getPropertyPathValue")
			.withExactArgs("~oFormerData", "~aPropertyPathNames")
			.returns(aFormerData);
		const aCurrentData = ["a", "b", "c", "d", "e"];
		oGeneratorMock.expects("getPropertyPathValue")
			.withExactArgs("~oData", "~aPropertyPathNames")
			.returns(aCurrentData);

		// code under test
		Generator.updateAlternatives("~oFormerData", "~oData", "~aPropertyPathNames");

		assert.deepEqual(aCurrentData,
			["a", ["b", "bFormer"], ["c", "cFormer"], ["d", "dFormer0", "dFormer1"], ["e", "eFormer0"]]);
	});

	//*********************************************************************************************
	it("updateMonthAbbreviations: no former CLDR data", function () {
		const oGenerator = {_sOutputFolder: "~_sOutputFolder"};
		sinon.mock(fileContent).expects("getContent")
			// join is used to create the platform specific path delimiter
			.withExactArgs(join("~_sOutputFolder/~sUI5Tag.json"))
			.throws(new Error());

		// code under test
		Generator.prototype.updateMonthAbbreviations.call(oGenerator, "~oResult", "~sUI5Tag");
	});

	//*********************************************************************************************
	it("updateMonthAbbreviations: with former CLDR data", function () {
		const oGenerator = {_sOutputFolder: "~_sOutputFolder"};
		sinon.mock(fileContent).expects("getContent")
			// join is used to create the platform specific path delimiter
			.withExactArgs(join("~_sOutputFolder/~sUI5Tag.json"))
			.returns("~oFormerCLDRData");
		const oGeneratorMock = sinon.mock(Generator);
		oGeneratorMock.expects("updateAlternatives")
			.withExactArgs("~oFormerCLDRData", "~oResult", ["ca-gregorian", "months", "format", "abbreviated"]);
		oGeneratorMock.expects("updateAlternatives")
			.withExactArgs("~oFormerCLDRData", "~oResult", ["ca-gregorian", "months", "stand-alone", "abbreviated"]);
		oGeneratorMock.expects("updateAlternatives")
			.withExactArgs("~oFormerCLDRData", "~oResult", ["ca-islamic", "months", "format", "abbreviated"]);
		oGeneratorMock.expects("updateAlternatives")
			.withExactArgs("~oFormerCLDRData", "~oResult", ["ca-islamic", "months", "stand-alone", "abbreviated"]);
		oGeneratorMock.expects("updateAlternatives")
			.withExactArgs("~oFormerCLDRData", "~oResult", ["ca-japanese", "months", "format", "abbreviated"]);
		oGeneratorMock.expects("updateAlternatives")
			.withExactArgs("~oFormerCLDRData", "~oResult", ["ca-japanese", "months", "stand-alone", "abbreviated"]);
		oGeneratorMock.expects("updateAlternatives")
			.withExactArgs("~oFormerCLDRData", "~oResult", ["ca-persian", "months", "format", "abbreviated"]);
		oGeneratorMock.expects("updateAlternatives")
			.withExactArgs("~oFormerCLDRData", "~oResult", ["ca-persian", "months", "stand-alone", "abbreviated"]);
		oGeneratorMock.expects("updateAlternatives")
			.withExactArgs("~oFormerCLDRData", "~oResult", ["ca-buddhist", "months", "format", "abbreviated"]);
		oGeneratorMock.expects("updateAlternatives")
			.withExactArgs("~oFormerCLDRData", "~oResult", ["ca-buddhist", "months", "stand-alone", "abbreviated"]);

		// code under test
		Generator.prototype.updateMonthAbbreviations.call(oGenerator, "~oResult", "~sUI5Tag");
	});

	//*********************************************************************************************
	it("start: success", async function () {
		const oGenerator = {
			_sCLDRVersion: "~_sCLDRVersion",
			_sSourceFolder: "~_sSourceFolder",
			_aTasks: [],
			_oTerritories: {
				writeTerritoriesCache() {}
			},
			_oTimezones: {
				writeTimezonesFiles() {},
				updateTimezones() {}
			},
			emit() {},
			generateLocaleFile() {},
			logUnsupportedDateTimePatterns() {}
		};
		const oGeneratorMock = sinon.mock(oGenerator);
		sinon.mock(util).expects("setSupplePath").withExactArgs(join("~_sSourceFolder/cldr-core/supplemental"));
		sinon.mock(oGenerator._oTimezones).expects("updateTimezones").withExactArgs("~_sCLDRVersion");
		Generator.aUI5Tags.forEach((sUI5LanguageTag) => {
			oGeneratorMock.expects("generateLocaleFile").withExactArgs(sUI5LanguageTag);
		});
		oGeneratorMock.expects("logUnsupportedDateTimePatterns").withExactArgs();
		sinon.mock(oGenerator._oTerritories).expects("writeTerritoriesCache").withExactArgs()
			.returns("~writeTerritoriesCache");
		sinon.mock(oGenerator._oTimezones).expects("writeTimezonesFiles").withExactArgs();
		const oStaticGeneratorMock = sinon.mock(Generator);
		oStaticGeneratorMock.expects("writeLocaleIDsToFile")
			.withExactArgs(sinon.match(/LocaleData.js$/), "A_SUPPORTED_LOCALES = ", Generator.aUI5Tags);
		oStaticGeneratorMock.expects("writeLocaleIDsToFile")
			.withExactArgs(sinon.match(/Localization.js$/), "A_RTL_LOCALES = ", Generator.aRTLLocales);
		oGeneratorMock.expects("emit").withExactArgs("allLocaleJSONReady", [undefined]);

		// code under test
		const oGeneratorResolved = await Generator.prototype.start.call(oGenerator);

		assert.strictEqual(oGeneratorResolved, oGenerator);
	});

	//*********************************************************************************************
	it("start: error", async function () {
		const oError = new Error("~error");
		const oGenerator = {
			_sCLDRVersion: "~_sCLDRVersion",
			_sSourceFolder: "~_sSourceFolder",
			_oTimezones: {
				updateTimezones() {}
			}
		};
		sinon.mock(util).expects("setSupplePath").withExactArgs(join("~_sSourceFolder/cldr-core/supplemental"));
		sinon.mock(oGenerator._oTimezones).expects("updateTimezones").withExactArgs("~_sCLDRVersion").rejects(oError);

		// code under test
		await assert.rejects(async () => {
			await Generator.prototype.start.call(oGenerator);
		}, oError);
	});

	//*********************************************************************************************
	it("start: run tasks in parallel leads to error", async function () {
		const oError = new Error("~error");
		const fnTaskWithError = async () => {
			await Promise.reject(oError);
		};
		const oGenerator = {
			_sCLDRVersion: "~_sCLDRVersion",
			_sSourceFolder: "~_sSourceFolder",
			_aTasks: [fnTaskWithError],
			_oTerritories: {
				writeTerritoriesCache() {}
			},
			_oTimezones: {
				writeTimezonesFiles() {},
				updateTimezones() {}
			},
			emit() {},
			generateLocaleFile() {},
			logUnsupportedDateTimePatterns() {}
		};
		const oGeneratorMock = sinon.mock(oGenerator);
		sinon.mock(util).expects("setSupplePath").withExactArgs(join("~_sSourceFolder/cldr-core/supplemental"));
		sinon.mock(oGenerator._oTimezones).expects("updateTimezones").withExactArgs("~_sCLDRVersion").resolves();
		Generator.aUI5Tags.forEach((sUI5LanguageTag) => {
			oGeneratorMock.expects("generateLocaleFile").withExactArgs(sUI5LanguageTag);
		});
		oGeneratorMock.expects("logUnsupportedDateTimePatterns").withExactArgs();
		sinon.mock(oGenerator._oTerritories).expects("writeTerritoriesCache").withExactArgs()
			.resolves("~writeTerritoriesCache");
		sinon.mock(oGenerator._oTimezones).expects("writeTimezonesFiles").withExactArgs().resolves();
		const oStaticGeneratorMock = sinon.mock(Generator);
		oStaticGeneratorMock.expects("writeLocaleIDsToFile")
			.withExactArgs(sinon.match(/LocaleData.js$/), "A_SUPPORTED_LOCALES = ", Generator.aUI5Tags);
		oStaticGeneratorMock.expects("writeLocaleIDsToFile")
			.withExactArgs(sinon.match(/Localization.js$/), "A_RTL_LOCALES = ", Generator.aRTLLocales);
		oGeneratorMock.expects("emit").withExactArgs("error", oError);

		// code under test
		const oGeneratorResolved = await Generator.prototype.start.call(oGenerator);

		assert.strictEqual(oGeneratorResolved, oGenerator);
	});

	//*********************************************************************************************
	it("logUnsupportedDateTimePatterns: no unsupported patterns found", function () {
		const oGenerator = {_mUnsupportedDateTimePatterns: null};
		sinon.mock(console).expects("log").never();

		// code under test
		return Generator.prototype.logUnsupportedDateTimePatterns.call(oGenerator);
	});

	//*********************************************************************************************
	it("logUnsupportedDateTimePatterns: unsupported patterns", function () {
		const oGenerator = {_mUnsupportedDateTimePatterns: {foo: "~bar", baz: [{}, {}, {}]}};
		sinon.mock(console).expects("log")
			.withExactArgs("ERROR: Unsupported date time patterns found: "
				+ JSON.stringify({foo: "~bar", baz: "3 occurrence(s)"}, undefined, "\t"));

		// code under test
		return Generator.prototype.logUnsupportedDateTimePatterns.call(oGenerator);
	});

	//*********************************************************************************************
	it("checkAllDateTimePatterns", function () {
		const oGenerator = {checkDateTimePatternsForPath() {}};
		const oGeneratorMock = sinon.mock(oGenerator);
		[
			["ca-gregorian", "dateFormats"],
			["ca-gregorian", "timeFormats"],
			["ca-gregorian", "dateTimeFormats", "availableFormats"],
			["ca-gregorian", "dateTimeFormats", "intervalFormats"],
			["ca-islamic", "dateFormats"],
			["ca-islamic", "timeFormats"],
			["ca-islamic", "dateTimeFormats", "availableFormats"],
			["ca-islamic", "dateTimeFormats", "intervalFormats"],
			["ca-japanese", "dateFormats"],
			["ca-japanese", "timeFormats"],
			["ca-japanese", "dateTimeFormats", "availableFormats"],
			["ca-japanese", "dateTimeFormats", "intervalFormats"],
			["ca-persian", "dateFormats"],
			["ca-persian", "timeFormats"],
			["ca-persian", "dateTimeFormats", "availableFormats"],
			["ca-persian", "dateTimeFormats", "intervalFormats"],
			["ca-buddhist", "dateFormats"],
			["ca-buddhist", "timeFormats"],
			["ca-buddhist", "dateTimeFormats", "availableFormats"],
			["ca-buddhist", "dateTimeFormats", "intervalFormats"]
		].forEach((aPropertyPathNames) => {
			oGeneratorMock.expects("checkDateTimePatternsForPath")
				.withExactArgs("~sUI5Tag", "~oResult", aPropertyPathNames);
		});

		// code under test
		Generator.prototype.checkAllDateTimePatterns.call(oGenerator, "~sUI5Tag", "~oResult");
	});

	//*********************************************************************************************
	it("checkDateTimePatternsForPath: recursive call", function () {
		const oGenerator = {checkDateTimePatternsForPath() {}};
		const aPropertyPathNames = ["~foo", "~bar"];
		sinon.mock(Generator).expects("getPropertyPathValue")
			.withExactArgs("~oResult", sinon.match.same(aPropertyPathNames))
			.returns({nestedObject: {}});
		sinon.mock(oGenerator).expects("checkDateTimePatternsForPath")
			.withExactArgs("~sUI5Tag", "~oResult", ["~foo", "~bar", "nestedObject"]);

		// code under test
		Generator.prototype.checkDateTimePatternsForPath.call(oGenerator, "~sUI5Tag", "~oResult", aPropertyPathNames);
	});

	//*********************************************************************************************
	it("checkDateTimePatternsForPath: remember unsupported pattern symbols", function () {
		const oGenerator = {_mUnsupportedDateTimePatterns: null};
		const aPropertyPathNames = ["~foo", "~bar"];
		sinon.mock(Generator).expects("getPropertyPathValue")
			.withExactArgs("~oResult", sinon.match.same(aPropertyPathNames))
			.returns({
				delimiters: "\u002d\u007E\u2010\u2011\u2012\u2013\u2014\ufe58\ufe63\uff0d\uFF5E", // ignored,
				ignoredValues: "0123456789{}[]", // ignored
				intervalFormatFallback: "abcdefghijklmnopqrstuvwxzABCDEFGHIJKLMNOPQRSTUVWXYZ", // ignored
				rtl: "\u061c\u200e\u200f\u202a\u202b\u202c", // ignored
				supportedSymbols: "aBcdDEGhHkKLmMqQusSVwWXyYzZ",
				unsupportedSymbols0: "abcdefghijklmnopqrstuvwxz", // unsupported: "befgijlnoprtvx"
				unsupportedSymbols0copy: "abcdefghijklmnopqrstuvwxz", // unsupported: "befgijlnoprtvx"
				unsupportedSymbols1: "ABCDEFGHIJKLMNOPQRSTUVWXYZ", // unsupported: ACFIJNOPRTU"
				whitespaces: "\u3000\u0020\u1680\u2000\u2002\u2003\u2004\u2005\u2006\u2008\u2009\u200A\u205F\u00A0"
					+ "\u2007\u202F" //ignored
			});

		// code under test
		Generator.prototype.checkDateTimePatternsForPath.call(oGenerator, "~sUI5Tag", "~oResult",
			aPropertyPathNames);

		assert.deepEqual(oGenerator._mUnsupportedDateTimePatterns, {
			befgijlnoprtvx: {
				"~sUI5Tag": [
					"\"abcdefghijklmnopqrstuvwxz\" found in ~foo/~bar/unsupportedSymbols0",
					"\"abcdefghijklmnopqrstuvwxz\" found in ~foo/~bar/unsupportedSymbols0copy"
				]
			},
			ACFIJNOPRTU: {
				"~sUI5Tag": ["\"ABCDEFGHIJKLMNOPQRSTUVWXYZ\" found in ~foo/~bar/unsupportedSymbols1"]
			}
		});
	});

	//*********************************************************************************************
	it("checkDateTimePatternsForPath: print pattern symbol occurrences of e/v in availableFormats", function () {
		const oGenerator = {_mUnsupportedDateTimePatterns: null};
		const aPropertyPathNames = ["~foo", "~bar", "availableFormats"];
		sinon.mock(Generator).expects("getPropertyPathValue")
			.withExactArgs("~oResult", sinon.match.same(aPropertyPathNames))
			.returns({
				foov: "h:mm v", // ignored,
				bare: "h:mm a e", // ignored
				barev: "h:mm a e v", // ignored
				baz: " e",
				foo: " v",
				Fe: "Fe",
				fooe: "h:mm v"
			});

		// code under test
		Generator.prototype.checkDateTimePatternsForPath.call(oGenerator, "~sUI5Tag", "~oResult",
			aPropertyPathNames);

		assert.deepEqual(oGenerator._mUnsupportedDateTimePatterns, {
			e: {
				"~sUI5Tag": ["\" e\" found in ~foo/~bar/availableFormats/baz"]
			},
			F: {
				"~sUI5Tag": ["\"Fe\" found in ~foo/~bar/availableFormats/Fe"]
			},
			v: {
				"~sUI5Tag": [
					"\" v\" found in ~foo/~bar/availableFormats/foo",
					"\"h:mm v\" found in ~foo/~bar/availableFormats/fooe"
				]
			}
		});
	});

	//*********************************************************************************************
	[
		{
			sPatternKey: "hmv",
			oExpectedLog: {
				e: {
					"~sUI5Tag": ["\"h:mm:ss e\" found in ~foo/~bar/intervalFormats/hmv/m"]
				}
			}
		}, {
			sPatternKey: "hme",
			oExpectedLog: {
				v: {
					"~sUI5Tag": ["\"h:mm:ss v\" found in ~foo/~bar/intervalFormats/hme/h"]
				}
			}
		}, {
			sPatternKey: "hm",
			oExpectedLog: {
				v: {
					"~sUI5Tag": ["\"h:mm:ss v\" found in ~foo/~bar/intervalFormats/hm/h"]
				},
				e: {
					"~sUI5Tag": ["\"h:mm:ss e\" found in ~foo/~bar/intervalFormats/hm/m"]
				}
			}
		}
	].forEach((oFixture) => {
		const sTitle = `checkDateTimePatternsForPath: print pattern symbol occurrences of e/v in intervalFormats for`
			+ ` key: ${oFixture.sPatternKey}`;
		it(sTitle, function () {
			const oGenerator = {_mUnsupportedDateTimePatterns: null};
			const aPropertyPathNames = ["~foo", "~bar", "intervalFormats", oFixture.sPatternKey];
			const oGeneratorMock = sinon.mock(Generator);
			oGeneratorMock.expects("getPropertyPathValue")
				.withExactArgs("~oResult", sinon.match.same(aPropertyPathNames))
				.returns({
					h: "h:mm:ss v",
					m: "h:mm:ss e"
				});

			// code under test
			Generator.prototype.checkDateTimePatternsForPath.call(oGenerator, "~sUI5Tag", "~oResult",
				aPropertyPathNames);

			assert.deepEqual(oGenerator._mUnsupportedDateTimePatterns, oFixture.oExpectedLog);
		});
	});

	//*********************************************************************************************
	[{
		sUI5Tag: "ko",
		oExpectedLog: {
			ee: {
				"ko": ["\"e - e\" found in ~foo/~bar/intervalFormats/GyMMMEd/e"]
			}
		}
	}, {
		sUI5Tag: "~sUI5Tag",
		oExpectedLog: {
			ee: {
				"~sUI5Tag": [
					"\"e - e\" found in ~foo/~bar/intervalFormats/GyMMMEd/d",
					"\"e - e\" found in ~foo/~bar/intervalFormats/GyMMMEd/e"
				]
			}
		}
	}].forEach((oFixture) => {
		const sTitle = "checkDateTimePatternsForPath: Exclude the known Korean interval pattern 'GyMMMEd/d'"
			+ " from the output";
		it(sTitle, function () {
			const oGenerator = {_mUnsupportedDateTimePatterns: null};
			const aPropertyPathNames = ["~foo", "~bar", "intervalFormats", "GyMMMEd"];
			sinon.mock(Generator).expects("getPropertyPathValue")
				.withExactArgs("~oResult", sinon.match.same(aPropertyPathNames))
				.returns({
					d: "e - e", // ignored for locale/UI5Tag 'ko'
					e: "e - e"
				});

			// code under test
			Generator.prototype.checkDateTimePatternsForPath.call(oGenerator, oFixture.sUI5Tag, "~oResult",
				aPropertyPathNames);

			assert.deepEqual(oGenerator._mUnsupportedDateTimePatterns, oFixture.oExpectedLog);
		});
	});

	//*********************************************************************************************
	it("addCalendarWeekTexts: success", function () {
		const oResult = {};
		sinon.mock(Generator).expects("getResourceBundle")
			.withExactArgs("~sUI5Tag")
			.returns({"calendarweek.narrow": {text: "~narrow"}, "calendarweek.wide": {text: "~wide"}});

		// code under test
		Generator.addCalendarWeekTexts(oResult, "~sUI5Tag");

		assert.deepEqual(oResult, {"sap-calendarWeek": {narrow: "~narrow", wide: "~wide"}});
	});

	//*********************************************************************************************
	[
		undefined,
		{},
		{"calendarweek.narrow": {text: "~narrow"}},
		{"calendarweek.wide": {text: "~wide"}},
		{"calendarweek.narrow": {text: "~narrow"}, "calendarweek.wide": {text: undefined}},
		{"calendarweek.narrow": {text: undefined}, "calendarweek.wide": {text: "~wide"}}
	].forEach((oResourceBundle) => {
		it("addCalendarWeekTexts: error, " + JSON.stringify(oResourceBundle), function () {
			sinon.mock(Generator).expects("getResourceBundle").withExactArgs("~sUI5Tag").returns(oResourceBundle);

			assert.throws(() => {
				// code under test
				Generator.addCalendarWeekTexts({}, "~sUI5Tag");
			}, new Error("Missing calendar week texts for ~sUI5Tag"));
		});
	});

	//*********************************************************************************************
	it("addMissingLanguageNameForMontenegrin: language name for cnr already exists", function () {
		const oResult = {languages: {cnr: "~cnr"}};
		const oLanguages = oResult.languages;
		sinon.mock(Generator).expects("getResourceBundle").never();

		// code under test
		Generator.addMissingLanguageNameForMontenegrin(oResult, "~sUI5Tag");

		assert.strictEqual(oResult.languages, oLanguages);
		assert.strictEqual(oResult.languages.cnr, "~cnr");
		assert.strictEqual(oResult.languages.cnr_ME, undefined);
	});

	//*********************************************************************************************
	it("addMissingLanguageNameForMontenegrin: reuse sr_ME translation", function () {
		const oResult = {languages: {"c": "~c", "cm": "~cm", "cnra": "~cnra", "sr_ME": "~sr_ME"}};
		const oLanguages = oResult.languages;
		sinon.mock(Generator).expects("getResourceBundle").never();

		// code under test
		Generator.addMissingLanguageNameForMontenegrin(oResult, "~sUI5Tag");

		assert.notStrictEqual(oResult.languages, oLanguages); // languages object has been replaced
		assert.strictEqual(oResult.languages.cnr, "~sr_ME");
		assert.strictEqual(oResult.languages.cnr_ME, undefined);
		assert.strictEqual(oResult.languages["sr_ME"], "~sr_ME");
		assert.deepEqual(Object.keys(oResult.languages), ["c", "cm", "cnr", "cnra", "sr_ME"]);
	});

	//*********************************************************************************************
	it("addMissingLanguageNameForMontenegrin: from resource bundle", function () {
		const oResult = {languages: {"cnra": "~cnra"}};
		const oLanguages = oResult.languages;
		sinon.mock(Generator).expects("getResourceBundle").withExactArgs("~sUI5Tag")
			.returns({"languagename.cnr": {text: "~cnr"}});

		// code under test
		Generator.addMissingLanguageNameForMontenegrin(oResult, "~sUI5Tag");

		assert.notStrictEqual(oResult.languages, oLanguages); // languages object has been replaced
		assert.strictEqual(oResult.languages.cnr, "~cnr");
		assert.strictEqual(oResult.languages.cnr_ME, undefined);
		assert.deepEqual(Object.keys(oResult.languages), ["cnr", "cnra"]);
	});

	//*********************************************************************************************
	[{}, undefined].forEach((vResourceBundle, i) => {
		it("addMissingLanguageNameForMontenegrin: no translation found in resource bundle, #" + i, function () {
			const oResult = {languages: {sr: "~sr"}, territories: {ME: "~ME"}};
			const oLanguages = oResult.languages;
			sinon.mock(Generator).expects("getResourceBundle").withExactArgs("~sUI5Tag")
				.returns(vResourceBundle);

			// code under test
			Generator.addMissingLanguageNameForMontenegrin(oResult, "~sUI5Tag");

			assert.notStrictEqual(oResult.languages, oLanguages); // languages object has been replaced
			assert.strictEqual(oResult.languages.cnr, "~sr (~ME)");
			assert.strictEqual(oResult.languages.cnr_ME, "~sr (~ME)");
		});
	});

	//*********************************************************************************************
	it("getResourceBundle: recursive call", function () {
		const oGeneratorMock = sinon.mock(Generator);
		oGeneratorMock.expects("getResourceBundle").withExactArgs("~a_~b_~c").callThrough();
		sinon.mock(fs).expects("existsSync").withExactArgs(resolve("./lib/i18n/i18n_~a_~b_~c.json")).returns(false);
		oGeneratorMock.expects("getResourceBundle").withExactArgs("~a_~b").returns("~oBundle_~a_~b");

		// code under test
		assert.strictEqual(Generator.getResourceBundle("~a_~b_~c"), "~oBundle_~a_~b");
	});

	//*********************************************************************************************
	it("getResourceBundle: no resource bundle", function () {
		sinon.mock(Generator).expects("getResourceBundle").withExactArgs("~a").callThrough();
		sinon.mock(fs).expects("existsSync").withExactArgs(resolve("./lib/i18n/i18n_~a.json")).returns(false);

		// code under test
		assert.strictEqual(Generator.getResourceBundle("~a"), undefined);
	});

	//*********************************************************************************************
	it("getResourceBundle: load resource bundle and parse", function () {
		sinon.mock(Generator).expects("getResourceBundle").withExactArgs("~s_UI5_Tag").callThrough();
		const sFilename = resolve("./lib/i18n/i18n_~s_UI5_Tag.json");
		sinon.mock(fs).expects("existsSync").withExactArgs(sFilename).returns(true);
		sinon.mock(fileContent).expects("getContent").withExactArgs(sFilename).returns("~oBundle");

		// code under test
		assert.strictEqual(Generator.getResourceBundle("~s_UI5_Tag"), "~oBundle");
	});

	//*********************************************************************************************
	[
		{locale: "fa", fallback: "en"},
		{locale: "he", fallback: "iw"},
		{locale: "nb", fallback: "no"},
		{locale: "sr_Latn", fallback: "sh"},
		{locale: "zh_HK", fallback: "zh_TW"},
		{locale: "zh_SG", fallback: "en"}
	].forEach(({locale, fallback}) => {
		const sFileName = `./lib/i18n/i18n_${fallback}.json`;
		it("getResourceBundle: w/o ancestor fallback logic for locale: " + locale, function () {
			sinon.mock(fs).expects("existsSync")
				.withExactArgs(resolve(sFileName))
				.returns(true);
			sinon.mock(fileContent).expects("getContent")
				.withExactArgs(resolve(sFileName))
				.returns("~fileContent");

			// code under test
			assert.strictEqual(Generator.getResourceBundle(locale), "~fileContent");
		});
	});

	//*********************************************************************************************
	it("writeLocaleIDsToFile", function () {
		const sFileContent = "~aArrayAnchor = [];";
		const oFsPromisesMock = sinon.mock(fs.promises);
		oFsPromisesMock.expects("readFile")
			.withExactArgs("~sFilePath/~LocaleFile.js", "utf8")
			.resolves(sFileContent);
		oFsPromisesMock.expects("writeFile")
			.withExactArgs("~sFilePath/~LocaleFile.js", "~aArrayAnchor = [\"~SomeLocaleIDs\"];")
			.resolves();

		// code under test
		Generator.writeLocaleIDsToFile("~sFilePath/~LocaleFile.js", "aArrayAnchor = ", ["~SomeLocaleIDs"]);
	});
});
