// ==UserScript==
// @name        CordWipe
// @description Find and delete your own Discord messages using your session. Processed locally; requests only to Discord. Confirm before deletion.
// @version     0.1.0.5
// @author      CordWipe contributors
// @homepageURL https://github.com/avizmarlon/cordwipe
// @supportURL  https://github.com/avizmarlon/cordwipe/issues
// @match       https://discord.com/*
// @match       https://ptb.discord.com/*
// @match       https://canary.discord.com/*
// @license     MIT
// @namespace   https://github.com/avizmarlon/cordwipe
// @run-at      document-idle
// @grant       none
// @updateURL   https://raw.githubusercontent.com/avizmarlon/cordwipe/main/cordwipe.user.js
// @downloadURL https://raw.githubusercontent.com/avizmarlon/cordwipe/main/cordwipe.user.js
// @attribution Derived from Undiscord by victornpb and contributors (https://github.com/victornpb/undiscord)
// ==/UserScript==

/*
MIT License

Copyright (c) 2019-2025 Victornpb and contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

Attribution: Original project (https://github.com/victornpb/undiscord)
Derivatives must keep attribution comments to the original project in the code readme and license.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/
(function () {
	'use strict';

	/* rollup-plugin-baked-env */
	const VERSION = "0.1.0-dev.5";

	var themeCss = "/* cordwipe window */\n#cordwipe.browser { box-shadow: var(--shadow-border), var(--shadow-high); border: 1px solid var(--border-subtle); overflow: hidden; }\n#cordwipe.container,\n#cordwipe .container { background-color: var(--background-surface-high); border-radius: 8px; box-sizing: border-box; cursor: default; flex-direction: column; }\n#cordwipe .header { background-color: var(--background-tertiary); height: 48px; align-items: center; min-height: 48px; padding: 0 16px; display: flex; color: var(--header-secondary); cursor: grab; }\n#cordwipe .header .icon { color: var(--interactive-normal); margin-right: 8px; flex-shrink: 0; width: 24; height: 24; }\n#cordwipe .header .icon:hover { color: var(--interactive-hover); }\n#cordwipe .header h3 { font-size: 16px; line-height: 20px; font-weight: 500; font-family: var(--font-display); color: var(--header-primary); flex-shrink: 0; margin-right: 16px; }\n#cordwipe .spacer { flex-grow: 1; }\n#cordwipe .header .vert-divider { width: 1px; height: 24px; background-color: var(--background-modifier-accent); margin-right: 16px; flex-shrink: 0; }\n#cordwipe legend,\n#cordwipe label { color: var(--header-secondary); font-size: 12px; line-height: 16px; font-weight: 500; text-transform: uppercase; cursor: default; font-family: var(--font-display); margin-bottom: 8px; }\n#cordwipe .multiInput { display: flex; align-items: center; font-size: 16px; box-sizing: border-box; width: 100%; border-radius: 3px; color: var(--text-default); background-color: var(--input-background); border: none; transition: border-color 0.2s ease-in-out 0s; }\n#cordwipe .multiInput :first-child { flex-grow: 1; }\n#cordwipe .multiInput button:last-child { margin-right: 4px; }\n#cordwipe .input { font-size: 16px; width: 100%; transition: border-color 0.2s ease-in-out 0s; padding: 10px; height: 44px; background-color: var(--input-background); border: 1px solid var(--input-border); border-radius: 8px; box-sizing: border-box; color: var(--text-default); }\n#cordwipe fieldset { margin-top: 16px; border: 0; padding: 0; min-width: 0; }\n#cordwipe .input-wrapper { display: flex; align-items: center; font-size: 16px; box-sizing: border-box; width: 100%; border-radius: 3px; color: var(--text-default); background-color: var(--input-background); border: none; transition: border-color 0.2s ease-in-out 0s; }\n#cordwipe input[type=\"text\"],\n#cordwipe input[type=\"search\"],\n#cordwipe input[type=\"password\"],\n#cordwipe input[type=\"datetime-local\"],\n#cordwipe input[type=\"number\"],\n#cordwipe input[type=\"range\"] { background-color: var(--input-background); border: 1px solid var(--input-border); border-radius: 8px; box-sizing: border-box; color: var(--text-default); font-size: 16px; height: 44px; padding: 12px 10px; transition: border-color .2s ease-in-out; width: 100%; }\n#cordwipe .divider,\n#cordwipe hr { border: none; margin-bottom: 24px; padding-bottom: 4px; border-bottom: 1px solid var(--background-modifier-accent); }\n#cordwipe .sectionDescription { margin-bottom: 16px; color: var(--header-secondary); font-size: 14px; line-height: 20px; font-weight: 400; }\n#cordwipe a { color: var(--text-link); text-decoration: none; }\n#cordwipe .btn,\n#cordwipe button { position: relative; display: flex; -webkit-box-pack: center; justify-content: center; -webkit-box-align: center; align-items: center; box-sizing: border-box; background: none; border: none; border-radius: 3px; font-size: 14px; font-weight: 500; line-height: 16px; padding: 2px 16px; user-select: none; /* sizeSmall */     width: 60px; height: 32px; min-width: 60px; min-height: 32px; /* lookFilled colorPrimary */     color: rgb(255, 255, 255); background-color: var(--button-secondary-background); }\n#cordwipe .sizeMedium { width: 96px; height: 38px; min-width: 96px; min-height: 38px; }\n#cordwipe .sizeMedium.icon { width: 38px; min-width: 38px; }\n#cordwipe sup { vertical-align: top; }\n/* lookFilled colorPrimary */\n#cordwipe .accent { background-color: var(--brand-experiment); }\n#cordwipe .danger { background-color: var(--button-danger-background); }\n#cordwipe .positive { background-color: var(--button-positive-background); }\n#cordwipe .info { font-size: 12px; line-height: 16px; padding: 8px 10px; color: var(--text-muted); }\n/* Scrollbar */\n#cordwipe .scroll::-webkit-scrollbar { width: 8px; height: 8px; }\n#cordwipe .scroll::-webkit-scrollbar-corner { background-color: transparent; }\n#cordwipe .scroll::-webkit-scrollbar-thumb { background-clip: padding-box; border: 2px solid transparent; border-radius: 4px; background-color: var(--scrollbar-thin-thumb); min-height: 40px; }\n#cordwipe .scroll::-webkit-scrollbar-track { border-color: var(--scrollbar-thin-track); background-color: var(--scrollbar-thin-track); border: 2px solid var(--scrollbar-thin-track); }\n/* fade scrollbar */\n#cordwipe .scroll::-webkit-scrollbar-thumb,\n#cordwipe .scroll::-webkit-scrollbar-track { visibility: hidden; }\n#cordwipe .scroll:hover::-webkit-scrollbar-thumb,\n#cordwipe .scroll:hover::-webkit-scrollbar-track { visibility: visible; }\n/**** functional classes ****/\n#cordwipe.redact .priv { display: none !important; }\n#cordwipe.redact x:not(:active) { color: transparent !important; background-color: var(--primary-700) !important; cursor: default; user-select: none; }\n#cordwipe.redact x:hover { position: relative; }\n#cordwipe.redact x:hover::after { content: \"Redacted information (Streamer mode: ON)\"; position: absolute; display: inline-block; top: -32px; left: -20px; padding: 4px; width: 150px; font-size: 8pt; text-align: center; white-space: pre-wrap; background-color: var(--background-floating); -webkit-box-shadow: var(--elevation-high); box-shadow: var(--elevation-high); color: var(--text-default); border-radius: 5px; pointer-events: none; }\n#cordwipe.redact [priv] { -webkit-text-security: disc !important; }\n#cordwipe :disabled { opacity: .55; cursor: not-allowed; }\n/**** layout and utility classes ****/\n#cordwipe,\n#cordwipe * { box-sizing: border-box; }\n#cordwipe .col { display: flex; flex-direction: column; }\n#cordwipe .row { display: flex; flex-direction: row; align-items: center; }\n#cordwipe .mb1 { margin-bottom: 8px; }\n#cordwipe .log { margin-bottom: 0.25em; }\n#cordwipe .log-debug { color: inherit; }\n#cordwipe .log-info { color: #00b0f4; }\n#cordwipe .log-verb { color: #72767d; }\n#cordwipe .log-warn { color: #faa61a; }\n#cordwipe .log-error { color: #f04747; }\n#cordwipe .log-success { color: #43b581; }\n";

	var mainCss = "/**** CordWipe Button ****/\n#cordwipe-btn { position: relative; width: auto; height: 24px; margin: 0 8px; cursor: pointer; color: var(--interactive-normal); flex: 0 0 auto; background: transparent; border: 0; padding: 0; border-radius: 6px; color: var(--interactive-normal, #ddd); }\n#cordwipe-btn.cordwipe-floating { position: fixed; z-index: 10000; bottom: 24px; right: 24px; width: 44px; height: 44px; background: #4338ca; color: white; box-shadow: 0 2px 10px #0008; }\n#cordwipe-btn:focus-visible { outline: 2px solid #a5b4fc; outline-offset: 3px; }\n#cordwipe-btn progress { position: absolute; top: 23px; left: -4px; width: 32px; height: 12px; display: none; }\n#cordwipe-btn.running { color: var(--button-danger-background) !important; }\n#cordwipe-btn.running progress { display: block; }\n/**** CordWipe Interface ****/\n#cordwipe { position: fixed; z-index: 10001; top: 58px; right: 10px; display: flex; flex-direction: column; width: 800px; height: 80vh; min-width: min(610px, 100vw); max-width: 100vw; min-height: 448px; max-height: 100vh; color: var(--text-normal); border-radius: 4px; background-color: var(--background-secondary); box-shadow: var(--elevation-stroke), var(--elevation-high); will-change: top, left, width, height; font: 14px/1.4 system-ui, sans-serif; --text-normal: #f3f4f6; --text-default: #f3f4f6; --header-primary: #fff; --header-secondary: #d1d5db; --text-muted: #c0c4ce; --text-link: #a5b4fc; --background-secondary: #24252b; --background-tertiary: #1a1b20; --background-surface-high: #24252b; --background-base-lowest: #1a1b20; --background-base-lower: #24252b; --input-background: #15161b; --input-border: #565963; --button-secondary-background: #454853; --button-danger-background: #b91c1c; --interactive-normal: #d1d5db; --interactive-active: #fff; --font-display: system-ui, sans-serif; }\n#cordwipe .header .icon { cursor: pointer; }\n#cordwipe .window-body { height: calc(100% - 48px); }\n#cordwipe .sidebar { overflow: hidden scroll; overflow-y: auto; width: 270px; min-width: 250px; height: 100%; max-height: 100%; padding: 8px; background: var(--bg-overlay-4, var(--background-base-lowest)); }\n#cordwipe .sidebar legend,\n#cordwipe .sidebar label { display: block; width: 100%; }\n#cordwipe .main { display: flex; max-width: calc(100% - 250px); background-color: var(--bg-overlay-chat, var(--background-base-lower)); flex-grow: 1; min-width: 0; }\n#cordwipe.hide-sidebar .sidebar { display: none; }\n#cordwipe.hide-sidebar .main { max-width: 100%; }\n#cordwipe #logArea { font-family: Consolas, Liberation Mono, Menlo, Courier, monospace; font-size: 0.75rem; overflow: auto; padding: 10px; user-select: text; flex-grow: 1; flex-grow: 1; cursor: auto; white-space: pre-wrap; overflow-wrap: anywhere; }\n#cordwipe .tbar { padding: 8px; background-color: var(--bg-overlay-2, var(--__header-bar-background)); }\n#cordwipe .tbar button { margin-right: 4px; margin-bottom: 4px; }\n#cordwipe .footer { cursor: se-resize; padding-right: 30px; }\n#cordwipe .footer #progressPercent { padding: 0 1em; font-size: small; color: var(--interactive-muted); flex-grow: 1; }\n.resize-handle { position: absolute; bottom: -15px; right: -15px; width: 30px; height: 30px; transform: rotate(-45deg); background: repeating-linear-gradient(0, var(--background-modifier-accent), var(--background-modifier-accent) 1px, transparent 2px, transparent 4px); cursor: nwse-resize; }\n/**** Elements ****/\n#cordwipe summary { font-size: 16px; font-weight: 500; line-height: 20px; position: relative; overflow: hidden; margin-bottom: 2px; padding: 6px 10px; cursor: pointer; white-space: nowrap; text-overflow: ellipsis; color: var(--interactive-normal); border-radius: 4px; flex-shrink: 0; }\n#cordwipe fieldset { padding-left: 8px; }\n#cordwipe legend a { float: right; text-transform: initial; }\n#cordwipe progress { height: 8px; margin-top: 4px; flex-grow: 1; }\n#cordwipe .importJson { display: flex; flex-direction: row; }\n#cordwipe .importJson button { margin-left: 5px; width: fit-content; }\n";

	var dragCss = "[name^=\"grab-\"] { position: absolute; --size: 6px; --corner-size: 16px; --offset: -1px; z-index: 9; }\n[name^=\"grab-\"]:hover{ background: rgba(128,128,128,0.1); }\n[name=\"grab-t\"] { top: 0px; left: var(--corner-size); right: var(--corner-size); height: var(--size); margin-top: var(--offset); cursor: ns-resize; }\n[name=\"grab-r\"] { top: var(--corner-size); bottom: var(--corner-size); right: 0px; width: var(--size); margin-right: var(--offset); \n  cursor: ew-resize; }\n[name=\"grab-b\"] { bottom: 0px; left: var(--corner-size); right: var(--corner-size); height: var(--size); margin-bottom: var(--offset); cursor: ns-resize; }\n[name=\"grab-l\"] { top: var(--corner-size); bottom: var(--corner-size); left: 0px; width: var(--size); margin-left: var(--offset); cursor: ew-resize; }\n[name=\"grab-tl\"] { top: 0px; left: 0px; width: var(--corner-size); height: var(--corner-size); margin-top: var(--offset); margin-left: var(--offset); cursor: nwse-resize; }\n[name=\"grab-tr\"] { top: 0px; right: 0px; width: var(--corner-size); height: var(--corner-size); margin-top: var(--offset); margin-right: var(--offset); cursor: nesw-resize; }\n[name=\"grab-br\"] { bottom: 0px; right: 0px; width: var(--corner-size); height: var(--corner-size); margin-bottom: var(--offset); margin-right: var(--offset); cursor: nwse-resize; }\n[name=\"grab-bl\"] { bottom: 0px; left: 0px; width: var(--corner-size); height: var(--corner-size); margin-bottom: var(--offset); margin-left: var(--offset); cursor: nesw-resize; }";

	var buttonHtml = "<button id=\"cordwipe-btn\" type=\"button\" aria-label=\"Open CordWipe\" aria-controls=\"cordwipe\" aria-expanded=\"false\" title=\"Open CordWipe\">\n    {{CORDWIPE_ICON}}\n    <progress></progress>\n</button>\n";

	var cordwipeTemplate = "<div id=\"cordwipe\" role=\"dialog\" aria-label=\"CordWipe\" class=\"browser container redact\" style=\"display:none;\">\n    <div class=\"header\">\n        {{CORDWIPE_ICON}}\n        <h3>CordWipe</h3>\n        <div class=\"vert-divider\"></div>\n        <span> Bulk delete messages</span>\n        <div class=\"spacer\"></div>\n        <button id=\"hide\" class=\"icon\" aria-label=\"Close\" type=\"button\">\n            <svg aria-hidden=\"false\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\">\n                <path fill=\"currentColor\"\n                    d=\"M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z\">\n                </path>\n            </svg>\n        </button>\n    </div>\n    <div class=\"window-body\" style=\"display: flex; flex-direction: row;\">\n        <div class=\"sidebar scroll\">\n            <details open>\n                <summary>General</summary>\n                <fieldset>\n                    <legend>\n                        Author ID\n                        <a href=\"{{WIKI}}\" title=\"Help\" target=\"_blank\" rel=\"noopener noreferrer\">help</a>\n                    </legend>\n                    <div class=\"multiInput\">\n                        <div class=\"input-wrapper\">\n                            <input class=\"input\" id=\"authorId\" type=\"text\" priv>\n                        </div>\n                        <button id=\"getAuthor\" title=\"Read your account ID from this page\">me</button>\n                    </div>\n                </fieldset>\n                <hr>\n                <fieldset>\n                    <legend>\n                        Server ID\n                        <a href=\"{{WIKI}}\" title=\"Help\" target=\"_blank\" rel=\"noopener noreferrer\">help</a>\n                    </legend>\n                    <div class=\"multiInput\">\n                        <div class=\"input-wrapper\">\n                            <input class=\"input\" id=\"guildId\" type=\"text\" priv>\n                        </div>\n                        <button id=\"getGuild\">current</button>\n                    </div>\n                </fieldset>\n                <fieldset>\n                    <legend>\n                        Channel ID\n                        <a href=\"{{WIKI}}\" title=\"Help\" target=\"_blank\" rel=\"noopener noreferrer\">help</a>\n                    </legend>\n                    <div class=\"multiInput mb1\">\n                        <div class=\"input-wrapper\">\n                            <input class=\"input\" id=\"channelId\" type=\"text\" priv>\n                        </div>\n                        <button id=\"getChannel\">current</button>\n                    </div>\n                    <div class=\"sectionDescription\">\n                        <label class=\"row\"><input id=\"includeNsfw\" type=\"checkbox\">This is a NSFW channel</label>\n                    </div>\n                </fieldset>\n            </details>\n            <hr>\n            <details>\n                <summary>Filter</summary>\n                <fieldset>\n                    <legend>\n                        Search\n                        <a href=\"{{WIKI}}\" title=\"Help\" target=\"_blank\" rel=\"noopener noreferrer\">help</a>\n                    </legend>\n                    <div class=\"input-wrapper\">\n                        <input id=\"search\" type=\"text\" placeholder=\"Containing text\" priv>\n                    </div>\n                    <div class=\"sectionDescription\">\n                        Case-insensitive literal substring; all selected filters must match\n                    </div>\n                    <div class=\"sectionDescription\">\n                        <label><input id=\"hasLink\" type=\"checkbox\">has: link</label>\n                    </div>\n                    <div class=\"sectionDescription\">\n                        <label><input id=\"hasFile\" type=\"checkbox\">has: file</label>\n                    </div>\n                    <div class=\"sectionDescription\">\n                        <label><input id=\"includePinned\" type=\"checkbox\">Include pinned</label>\n                    </div>\n                </fieldset>\n                <hr>\n                <fieldset>\n                    <legend>\n                        Pattern\n                        <a href=\"{{WIKI}}\" title=\"Help\" target=\"_blank\" rel=\"noopener noreferrer\">help</a>\n                    </legend>\n                    <div class=\"sectionDescription\">\n                        Case-insensitive regular expression. Use simple patterns; complex expressions can freeze the page.\n                    </div>\n                    <div class=\"input-wrapper\">\n                        <span class=\"info\">/</span>\n                        <input id=\"pattern\" type=\"text\" placeholder=\"regular expression\" priv>\n                        <span class=\"info\">/</span>\n                    </div>\n                </fieldset>\n            </details>\n            <details>\n                <summary>Messages interval</summary>\n                <fieldset>\n                    <legend>\n                        Interval of messages\n                        <a href=\"{{WIKI}}\" title=\"Help\" target=\"_blank\" rel=\"noopener noreferrer\">help</a>\n                    </legend>\n                    <div class=\"multiInput mb1\">\n                        <div class=\"input-wrapper\">\n                            <input id=\"minId\" type=\"text\" placeholder=\"After a message\" priv>\n                        </div>\n                        <button id=\"pickMessageAfter\">Pick</button>\n                    </div>\n                    <div class=\"multiInput\">\n                        <div class=\"input-wrapper\">\n                            <input id=\"maxId\" type=\"text\" placeholder=\"Before a message\" priv>\n                        </div>\n                        <button id=\"pickMessageBefore\">Pick</button>\n                    </div>\n                    <div class=\"sectionDescription\">\n                        Specify an interval to delete messages.\n                    </div>\n                </fieldset>\n            </details>\n            <details>\n                <summary>Date interval</summary>\n                <fieldset>\n                    <legend>\n                        After date\n                        <a href=\"{{WIKI}}\" title=\"Help\" target=\"_blank\" rel=\"noopener noreferrer\">help</a>\n                    </legend>\n                    <div class=\"input-wrapper mb1\">\n                        <input id=\"minDate\" type=\"datetime-local\" title=\"Messages posted AFTER this date\">\n                    </div>\n                    <legend>\n                        Before date\n                        <a href=\"{{WIKI}}\" title=\"Help\" target=\"_blank\" rel=\"noopener noreferrer\">help</a>\n                    </legend>\n                    <div class=\"input-wrapper\">\n                        <input id=\"maxDate\" type=\"datetime-local\" title=\"Messages posted BEFORE this date\">\n                    </div>\n                    <div class=\"sectionDescription\">\n                        Delete messages that were posted between the two dates.\n                    </div>\n                    <div class=\"sectionDescription\">\n                        Choose either a date interval or a message interval. Boundaries are exclusive.\n                    </div>\n                </fieldset>\n            </details>\n            <hr>\n            <details>\n                <summary>Advanced settings</summary>\n                <fieldset>\n                    <legend>\n                        Search delay\n                        <a href=\"{{WIKI}}\" title=\"Help\" target=\"_blank\" rel=\"noopener noreferrer\">help</a>\n                    </legend>\n                    <div class=\"input-wrapper\">\n                        <input id=\"searchDelay\" type=\"range\" value=\"30000\" step=\"100\" min=\"1000\" max=\"60000\">\n                        <div id=\"searchDelayValue\"></div>\n                    </div>\n                </fieldset>\n                <fieldset>\n                    <legend>\n                        Delete delay\n                        <a href=\"{{WIKI}}\" title=\"Help\" target=\"_blank\" rel=\"noopener noreferrer\">help</a>\n                    </legend>\n                    <div class=\"input-wrapper\">\n                        <input id=\"deleteDelay\" type=\"range\" value=\"1000\" step=\"50\" min=\"1000\" max=\"10000\">\n                        <div id=\"deleteDelayValue\"></div>\n                    </div>\n                    <br>\n                    <div class=\"sectionDescription\">\n                        This will affect the speed in which the messages are deleted.\n                        Use the help link for more information.\n                    </div>\n                </fieldset>\n            </details>\n            <hr>\n            <div></div>\n            <div class=\"info\">\n                CordWipe {{VERSION}}\n                <br><a href=\"{{HOME}}/blob/main/PRIVACY.md\" target=\"_blank\" rel=\"noopener noreferrer\">Privacy policy</a>\n            </div>\n        </div>\n        <div class=\"main col\">\n            <div class=\"tbar col\">\n                <div class=\"row\">\n                    <button id=\"toggleSidebar\" class=\"sizeMedium icon\">☰</button>\n                    <button id=\"start\" class=\"sizeMedium danger\" style=\"width: 150px;\" aria-describedby=\"accessInfo\" title=\"Use your Discord session to find messages and review them before confirming deletion\">▶︎ Find &amp; review</button>\n                    <button id=\"stop\" class=\"sizeMedium\" title=\"Stop the deletion process\" disabled>🛑 Stop</button>\n                    <button id=\"clear\" class=\"sizeMedium\">Clear log</button>\n                    <label class=\"row\" title=\"Hide sensitive information on your screen for taking screenshots\">\n                        <input id=\"redact\" type=\"checkbox\" checked> Streamer mode\n                    </label>\n                </div>\n                <div id=\"accessInfo\" class=\"sectionDescription\">\n                    Find &amp; review uses your Discord session and message history locally; requests go only to Discord. Deletion requires confirmation.\n                </div>\n                <div class=\"row\">\n                    <progress id=\"progressBar\" style=\"display:none;\"></progress>\n                </div>\n            </div>\n            <pre id=\"logArea\" class=\"logarea scroll\"></pre>\n            <div class=\"tbar footer row\">\n                <div id=\"progressPercent\"></div>\n                <span class=\"spacer\"></span>\n                <label>\n                    <input id=\"autoScroll\" type=\"checkbox\" checked> Auto scroll\n                </label>\n                <div class=\"resize-handle\"></div>\n            </div>\n        </div>\n    </div>\n</div>\n";

	var cordwipeIcon = "<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"icon cordwipe-brand-icon\" aria-hidden=\"true\" focusable=\"false\" width=\"24\" height=\"24\" viewBox=\"180 140 900 1000\">\n    <path fill=\"#0b0d1c\" fill-rule=\"evenodd\" d=\"M432 303V280C432 214 474 174 540 174H714C783 174 829 216 829 280V303H924C987 303 1010 337 1035 398C1050 435 1040 465 1012 477V836C1012 941 959 994 854 994H543L384 1098C355 1118 309 1090 316 1056L336 966C278 945 250 900 250 837V479C220 467 204 438 218 405C244 338 259 303 322 303ZM544 296V322H710V296ZM525 560C506 560 494 574 494 593V831C494 851 507 866 525 866S557 851 557 831V593C557 574 544 560 525 560ZM729 560C710 560 698 574 698 593V831C698 851 711 866 729 866S760 851 760 831V593C760 574 748 560 729 560Z\"/>\n    <path fill=\"none\" stroke=\"#f8f9ff\" stroke-width=\"12\" stroke-linejoin=\"round\" d=\"M432 303V280C432 214 474 174 540 174H714C783 174 829 216 829 280V303H924C987 303 1010 337 1035 398C1050 435 1040 465 1012 477V836C1012 941 959 994 854 994H543L384 1098C355 1118 309 1090 316 1056L336 966C278 945 250 900 250 837V479C220 467 204 438 218 405C244 338 259 303 322 303Z\"/>\n    <path fill=\"#473ffa\" fill-rule=\"evenodd\" d=\"M485 358V291C485 254 507 232 542 232H714C748 232 770 254 770 291V358H924C947 358 963 371 975 401L985 422C988 430 982 435 971 435H283C268 435 263 430 269 417L280 391C288 369 302 358 324 358ZM525 323V358H731V323C731 289 720 274 691 274H566C537 274 525 289 525 323Z\"/>\n    <path fill=\"#473ffa\" fill-rule=\"evenodd\" d=\"M304 479H950V835C950 908 921 945 851 945H530L364 1054C355 1060 353 1055 356 1043L383 946C385 939 383 937 376 936C327 928 304 898 304 837ZM525 533C494 533 470 557 470 589V828C470 865 493 889 525 889S580 865 580 828V589C580 557 556 533 525 533ZM729 533C698 533 674 557 674 589V828C674 865 697 889 729 889S784 865 784 828V589C784 557 760 533 729 533Z\"/>\n</svg>\n";

	const log = {
	  debug() { return logFn ? logFn('debug', arguments) : console.debug.apply(console, arguments); },
	  info() { return logFn ? logFn('info', arguments) : console.info.apply(console, arguments); },
	  verb() { return logFn ? logFn('verb', arguments) : console.log.apply(console, arguments); },
	  warn() { return logFn ? logFn('warn', arguments) : console.warn.apply(console, arguments); },
	  error() { return logFn ? logFn('error', arguments) : console.error.apply(console, arguments); },
	  success() { return logFn ? logFn('success', arguments) : console.info.apply(console, arguments); },
	};

	var logFn; // custom console.log function
	const setLogFn = (fn) => logFn = fn;

	// Helpers
	const wait = (ms, signal) => new Promise((resolve, reject) => {
	  const abort = () => { clearTimeout(timer); reject(new DOMException('Stopped', 'AbortError')); };
	  const timer = setTimeout(() => { signal?.removeEventListener('abort', abort); resolve(); }, ms);
	  if (signal?.aborted) abort();
	  else signal?.addEventListener('abort', abort, { once: true });
	});
	const queryString = params => params.filter(p => p[1] !== undefined).map(p => p[0] + '=' + encodeURIComponent(p[1])).join('&');
	const ask = async msg => new Promise(resolve => setTimeout(() => resolve(window.confirm(msg)), 10));
	const toSnowflake = value => {
	  if (/^\d+$/.test(String(value))) return String(value);
	  const ms = new Date(value).getTime();
	  if (!Number.isSafeInteger(ms) || ms <= 1420070400000) throw new Error('Invalid date boundary.');
	  return ((BigInt(ms) - 1420070400000n) << 22n).toString();
	};
	const replaceInterpolations = (str, obj, removeMissing = false) => str.replace(/\{\{([\w_]+)\}\}/g, (m, key) => obj[key] || (removeMissing ? '' : m));

	// Derived from Undiscord, Copyright (c) 2019-2025 Victornpb and contributors.
	// https://github.com/victornpb/undiscord — original attribution retained.

	const HOSTS = ['discord.com', 'ptb.discord.com', 'canary.discord.com'];
	const isId = value => typeof value === 'string' && /^[1-9]\d{16,19}$/.test(value);
	const abortError = () => new DOMException('Stopped', 'AbortError');

	class CordWipeCore {
	  constructor(dependencies = {}) {
	    this.api = (HOSTS.includes(globalThis.location?.hostname) ? globalThis.location.origin : 'https://discord.com') + '/api/v9';
	    this.fetch = dependencies.fetch || globalThis.fetch.bind(globalThis);
	    this.wait = dependencies.wait || wait;
	    this.ask = dependencies.ask || ask;
	    this.options = { searchDelay: 30000, deleteDelay: 1000 };
	    this.resetState();
	  }

	  resetState() {
	    if (this._active || this._batchActive) throw new Error('A run is still active.');
	    this.state = { running: false, status: 'idle', delCount: 0, failCount: 0,
	      missingCount: 0, skippedCount: 0, scannedCount: 0, grandTotal: 0, iterations: 0 };
	    this.stats = { startTime: new Date(), throttledCount: 0, throttledTotalTime: 0, etr: 0 };
	  }

	  validate(options) {
	    const o = { searchDelay: 30000, deleteDelay: 1000, ...options };
	    if (!o.authToken || typeof o.authToken !== 'string') throw new Error('Authorization is required.');
	    if (!isId(o.authorId)) throw new Error('Enter your own numeric Author ID.');
	    if (o.guildId !== '@me' && !isId(o.guildId)) throw new Error('Enter a Server ID, or @me for a DM.');
	    if (o.channelId && !isId(o.channelId)) throw new Error('Invalid Channel ID.');
	    if (o.guildId === '@me' && !isId(o.channelId)) throw new Error('A DM requires a Channel ID.');
	    for (const key of ['minId', 'maxId']) {
	      o[key] = o[key] ? String(toSnowflake(o[key])) : '';
	      if (o[key] && !isId(o[key])) throw new Error('Invalid message/date interval.');
	    }
	    if (o.minId && o.maxId && BigInt(o.minId) >= BigInt(o.maxId)) throw new Error('After must be earlier than Before.');
	    if (!Number.isFinite(o.searchDelay) || o.searchDelay < 1000 || o.searchDelay > 60000 ||
	        !Number.isFinite(o.deleteDelay) || o.deleteDelay < 1000 || o.deleteDelay > 60000) throw new Error('Delays must be between 1000ms and 60000ms.');
	    if (o.pattern && o.pattern.length > 500) throw new Error('Pattern is too long (maximum 500 characters).');
	    // Invalid expressions must stop the run, never silently broaden its scope.
	    try { o.regex = o.pattern ? new RegExp(o.pattern, 'i') : null; }
	    catch { throw new Error('Invalid regular expression. No messages were deleted.'); }
	    return Object.freeze(o);
	  }

	  async runBatch(queue) {
	    if (this._active || this._batchActive) throw new Error('A run is still active.');
	    const jobs = queue.map(job => this.validate({ ...this.options, ...job }));
	    if (!jobs.length) throw new Error('No channels selected.');
	    this._batchActive = true;
	    this._batchStopped = false;
	    const totals = { delCount: 0, missingCount: 0, failCount: 0, scannedCount: 0, skippedCount: 0 };
	    try {
	      for (let i = 0; i < jobs.length && !this._batchStopped; i++) {
	        log.info(`Channel ${i + 1}/${jobs.length}. Each channel needs confirmation.`);
	        await this.run(true, jobs[i]);
	        for (const key of Object.keys(totals)) totals[key] += this.state[key];
	        if (this.state.status !== 'completed') break;
	      }
	    } finally {
	      this._batchActive = false;
	      this.options.authToken = null;
	      Object.assign(this.state, totals);
	      log.info(`Batch ${this.state.status}: ${totals.delCount} deleted, ${totals.missingCount} already absent, ${totals.failCount} failed.`);
	      this.onStop?.(this.state, this.stats);
	    }
	  }

	  async run(isJob = false, jobOptions = null) {
	    if (this._active || (this._batchActive && !isJob)) throw new Error('A run is still active.');
	    // Snapshot before any await: UI edits cannot change a confirmed run.
	    const options = this.validate(jobOptions || this.options);
	    this._active = true;
	    this._controller = new AbortController();
	    this._runOptions = options;
	    this.state = { running: true, status: 'running', delCount: 0, failCount: 0,
	      missingCount: 0, skippedCount: 0, scannedCount: 0, grandTotal: 0, iterations: 0 };
	    this.stats = { startTime: new Date(), throttledCount: 0, throttledTotalTime: 0, etr: 0 };
	    try {
	      this.onStart?.(this.state, this.stats);
	      const user = await this.request('/users/@me');
	      if (!isId(user?.id) || user.id !== options.authorId) throw new Error('Author ID must match the signed-in account.');
	      if (options.guildId === '@me') {
	        const channel = await this.request(`/channels/${options.channelId}`);
	        if (channel?.id !== options.channelId || ![1, 3].includes(channel.type)) throw new Error('The selected channel is not a DM or group DM.');
	      }

	      // Freeze the upper time boundary so messages posted during the run stay out.
	      let cursor = options.maxId || toSnowflake(new Date().toISOString());
	      const upperBound = cursor;
	      let confirmed = false;
	      while (this.state.running) {
	        if (++this.state.iterations > 10000) throw new Error('Page safety limit reached. Narrow the interval and start again.');
	        const { messages, total } = await this.search(cursor);
	        this.checkRunning();
	        this.state.grandTotal = Math.max(this.state.grandTotal, total || 0);
	        if (!messages.length) break;
	        // Apply the same progress guard to DM history as server search. The API's
	        // `before` cursor is a request hint; never trust a repeated or malformed
	        // page enough to delete from it or loop through it again.
	        if (messages.some(m => !isId(m?.id) || BigInt(m.id) >= BigInt(cursor))) {
	          throw new Error('Pagination did not advance. Stopped to avoid repeating a page.');
	        }
	        const nextCursor = messages.reduce((id, m) => BigInt(m.id) < BigInt(id) ? m.id : id, cursor);
	        const unique = [...new Map(messages.map(m => [m.id, m])).values()];
	        this.state.scannedCount += unique.length;
	        const matches = unique.filter(m => this.matches(m));
	        this.state.skippedCount += unique.length - matches.length;
	        if (matches.length && !confirmed) {
	          const target = options.guildId === '@me' ? `DM ${options.channelId}` : `server ${options.guildId}, channel ${options.channelId || 'ALL'}`;
	          const preview = matches.slice(0, 5).map(m => `${m.id}: ${(m.content || '[attachment]').replace(/\s+/g, ' ').slice(0, 180)}`).join('\n');
	          confirmed = await this.ask(`Permanently delete your matching messages in ${target}?\n` +
	            `Text: ${options.content || '(any)'}; pattern: ${options.pattern || '(none)'}\n` +
	            `After: ${options.minId || '(any)'}; before: ${upperBound}\n` +
	            `Links: ${!!options.hasLink}; files: ${!!options.hasFile}; include pinned: ${!!options.includePinned}; include NSFW: ${!!options.includeNsfw}\n` +
	            'There is no undo. Preview of the first matching page (not a final count):\n' + preview);
	          this.checkRunning();
	          if (!confirmed) { this.stop(); break; }
	        }
	        for (const message of matches) {
	          this.checkRunning();
	          // Reapply the immutable scope immediately before every destructive request.
	          if (!this.matches(message)) throw new Error('Message no longer matches the selected scope.');
	          try {
	            const result = await this.request(`/channels/${message.channel_id}/messages/${message.id}`, 'DELETE');
	            if (result === 'deleted') this.state.delCount++;
	            else this.state.missingCount++;
	          } catch (error) {
	            if (error.name !== 'AbortError') this.state.failCount++;
	            throw error;
	          }
	          this.onProgress?.(this.state, this.stats);
	          await this.cooldown(options.deleteDelay);
	        }
	        cursor = nextCursor;
	        this.onProgress?.(this.state, this.stats);
	        if (options.minId && BigInt(cursor) <= BigInt(options.minId)) break;
	        log.info(`Scanned ${this.state.scannedCount}; deleted ${this.state.delCount}. Waiting before the next page.`);
	        await this.cooldown(options.searchDelay);
	      }
	      if (this.state.running) this.state.status = 'completed';
	    } catch (error) {
	      this.state.status = error.name === 'AbortError' && !this.state.running ? 'stopped' : 'failed';
	      if (this.state.status === 'failed') log.error(error.message);
	    } finally {
	      this.state.running = false;
	      this._active = false;
	      this.stats.endTime = new Date();
	      this._runOptions = null;
	      this.options.authToken = null;
	      const summary = `${this.state.status}: ${this.state.delCount} deleted, ${this.state.missingCount} already absent, ${this.state.failCount} failed; ${this.state.skippedCount} skipped.`;
	      log.info(summary);
	      if (this.state.status === 'completed') log.info('Reached the end of the available results in the selected interval. Search indexing may omit server messages.');
	      if (this.state.status === 'stopped') log.warn('Stop cannot undo a deletion already sent to Discord. Counts include confirmed responses only.');
	      if (!isJob) this.onStop?.(this.state, this.stats);
	    }
	    return this.state;
	  }

	  stop() {
	    this._batchStopped = true;
	    this.state.running = false;
	    this.state.status = 'stopped';
	    this._controller?.abort();
	  }

	  checkRunning() {
	    if (!this.state.running || this._controller.signal.aborted) throw abortError();
	  }

	  async cooldown(ms) {
	    this.checkRunning();
	    await this.wait(ms, this._controller.signal);
	    this.checkRunning();
	  }

	  async search(cursor) {
	    const o = this._runOptions;
	    if (o.guildId === '@me') {
	      const data = await this.request(`/channels/${o.channelId}/messages?${queryString([['limit', 100], ['before', cursor]])}`);
	      if (!Array.isArray(data)) throw new Error('Invalid DM history response.');
	      return { messages: data, total: 0 };
	    }
	    const data = await this.request(`/guilds/${o.guildId}/messages/search?${queryString([
      ['author_id', o.authorId], ['channel_id', o.channelId || undefined],
      ['min_id', o.minId || undefined], ['max_id', cursor],
      ['sort_by', 'timestamp'], ['sort_order', 'desc'], ['offset', 0],
      ['has', o.hasLink ? 'link' : undefined], ['has', o.hasFile ? 'file' : undefined],
      ['content', o.content || undefined], ['include_nsfw', !!o.includeNsfw],
    ])}`);
	    if (!data || !Array.isArray(data.messages) || data.messages.some(group => !Array.isArray(group))) throw new Error('Invalid server search response.');
	    const messages = data.messages.flat().filter(m => m?.hit === true);
	    if (data.messages.length && !messages.length) throw new Error('Server search returned no identifiable hits.');
	    return { messages, total: data.total_results };
	  }

	  matches(message) {
	    const o = this._runOptions;
	    if (!isId(message?.id) || !isId(message.channel_id) || message.author?.id !== o.authorId) return false;
	    if (o.channelId && message.channel_id !== o.channelId) return false;
	    if (message.guild_id && message.guild_id !== o.guildId) return false;
	    if (![0, 19].includes(message.type) || (message.pinned && !o.includePinned)) return false;
	    if (o.minId && BigInt(message.id) <= BigInt(o.minId)) return false;
	    if (o.maxId && BigInt(message.id) >= BigInt(o.maxId)) return false;
	    const content = message.content || '';
	    if (o.content && !content.toLowerCase().includes(o.content.toLowerCase())) return false;
	    if (o.hasFile && !message.attachments?.length) return false;
	    if (o.hasLink && !/https?:\/\/\S+/i.test(content) && !message.embeds?.some(e => /^https?:\/\//i.test(e.url || ''))) return false;
	    return !o.regex || o.regex.test(content);
	  }

	  async request(path, method = 'GET') {
	    const o = this._runOptions;
	    // Stop cancels the wait, not Discord's cooldown; it also survives a new run.
	    if (this._cooldownUntil > Date.now()) {
	      const remaining = this._cooldownUntil - Date.now();
	      if (remaining > 86400000) throw new Error('Server cooldown exceeds one day. Retry later.');
	      log.warn('Waiting for the server cooldown before the next request.');
	      await this.cooldown(remaining);
	      this._cooldownUntil = 0;
	    }
	    for (let attempt = 0; attempt < 5; attempt++) {
	      this.checkRunning();
	      const controller = new AbortController();
	      const cancel = () => controller.abort();
	      this._controller.signal.addEventListener('abort', cancel, { once: true });
	      const timeout = setTimeout(cancel, 30000);
	      let response, body;
	      try {
	        response = await this.fetch(this.api + path, { method, headers: { Authorization: o.authToken }, signal: controller.signal, redirect: 'error', credentials: 'omit' });
	        const text = await response.text();
	        try { body = JSON.parse(text); } catch { body = null; }
	      } catch {
	        if (!this.state.running) throw abortError();
	        throw new Error(`${method} request failed or timed out. Its outcome is uncertain; review before restarting.`);
	      } finally {
	        clearTimeout(timeout);
	        this._controller.signal.removeEventListener('abort', cancel);
	      }
	      this.checkRunning();
	      if (response.status === 401) {
	        throw new Error('Discord rejected the current session (HTTP 401). Reload Discord and try again. Never copy or share your token.');
	      }
	      const limited = response.status === 429;
	      const indexing = response.status === 202 && method === 'GET';
	      if (body?.code === 40333 || (limited && !body)) {
	        throw new Error('Discord returned an access/edge block. Stopped without retrying.');
	      }
	      if (limited || indexing) {
	        const retryHeader = response.headers.get('Retry-After');
	        const headerMs = retryHeader === null ? 0 : (/^\d+(\.\d+)?$/.test(retryHeader) ? Number(retryHeader) * 1000 : Date.parse(retryHeader) - Date.now());
	        const bodyMs = Number(body?.retry_after) * 1000;
	        const delay = Math.max(Number.isFinite(headerMs) ? headerMs : 0, Number.isFinite(bodyMs) ? bodyMs : 0, method === 'DELETE' ? o.deleteDelay : o.searchDelay);
	        this._cooldownUntil = Date.now() + delay;
	        if (delay > 86400000) throw new Error('Server requested a cooldown longer than one day. Stop and retry later.');
	        this.stats.throttledCount++;
	        this.stats.throttledTotalTime += delay;
	        log.warn(`${indexing ? 'Search indexing' : 'Rate limit'}: waiting ${Math.ceil(delay / 1000)}s (${attempt + 1}/5). Stop remains available.`);
	        // Even the final rate-limit response establishes a cooldown before any later job.
	        await this.cooldown(delay);
	        this._cooldownUntil = 0;
	        continue;
	      }
	      const resetAfter = Number(response.headers.get('X-RateLimit-Reset-After')) * 1000;
	      if (response.headers.get('X-RateLimit-Remaining') === '0' && Number.isFinite(resetAfter) && resetAfter > 0) {
	        this._cooldownUntil = Math.max(this._cooldownUntil || 0, Date.now() + resetAfter);
	      }
	      if (method === 'DELETE' && response.status === 404 && body?.code === 10008) return 'missing';
	      if (method === 'DELETE' && response.status === 204) return 'deleted';
	      if (!response.ok || method === 'DELETE') throw new Error(`${method} failed (HTTP ${response.status}). Stopped; no success assumed.`);
	      if (!body) throw new Error('Invalid API response. Stopped without assuming success.');
	      return body;
	    }
	    throw new Error('Retry limit reached. Stopped; review the log before restarting.');
	  }
	}

	// Resolve the current visible toolbar again whenever Discord rebuilds its header.
	function findToolbar(doc = document) {
	  const root = doc.querySelector('#app-mount');
	  if (!root) return null;
	  for (const selector of [
	    'section[aria-label="Channel header"] [role="toolbar"]',
	    'section[aria-label="Channel header"] [class*="toolbar_"]',
	    'section [role="toolbar"]',
	    '[class^="toolbar_"], [class*=" toolbar_"], [class^="toolbar-"], [class*="-toolbar"]',
	  ]) {
	    const toolbar = [...root.querySelectorAll(selector)].find(el => el.getClientRects().length);
	    if (toolbar) return toolbar;
	  }
	  return null;
	}

	function mountLauncher(button, panel) {
	  let scheduled = false;
	  const mount = () => {
	    scheduled = false;
	    if (!panel.isConnected) document.body.appendChild(panel);
	    const target = findToolbar() || document.body;
	    const fallback = target === document.body;
	    if (button.classList.contains('cordwipe-floating') !== fallback) button.classList.toggle('cordwipe-floating', fallback);
	    if (button.parentElement !== target) target.appendChild(button);
	  };
	  const observer = new MutationObserver(() => {
	    if (scheduled) return;
	    scheduled = true;
	    queueMicrotask(mount);
	  });
	  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'role', 'aria-label'] });
	  mount();
	  return () => observer.disconnect();
	}

	const MOVE = 0;
	const RESIZE_T = 1;
	const RESIZE_B = 2;
	const RESIZE_L = 4;
	const RESIZE_R = 8;
	const RESIZE_TL = RESIZE_T + RESIZE_L;
	const RESIZE_TR = RESIZE_T + RESIZE_R;
	const RESIZE_BL = RESIZE_B + RESIZE_L;
	const RESIZE_BR = RESIZE_B + RESIZE_R;

	/**
	 * Make an element draggable/resizable
	 * @author Victor N. wwww.vitim.us
	 */
	class DragResize {
	  constructor({ elm, moveHandle, options }) {
	    this.options = defaultArgs({
	      enabledDrag: true,
	      enabledResize: true,
	      minWidth: 200,
	      maxWidth: Infinity,
	      minHeight: 100,
	      maxHeight: Infinity,
	      dragAllowX: true,
	      dragAllowY: true,
	      resizeAllowX: true,
	      resizeAllowY: true,
	      draggingClass: 'drag',
	      useMouseEvents: true,
	      useTouchEvents: true,
	      createHandlers: true,
	    }, options);
	    Object.assign(this, options);
	    options = undefined;

	    elm.style.position = 'fixed';

	    this.drag_m = new Draggable(elm, moveHandle, MOVE, this.options);

	    if (this.options.createHandlers) {
	      this.el_t = createElement('div', { name: 'grab-t' }, elm);
	      this.drag_t = new Draggable(elm, this.el_t, RESIZE_T, this.options);
	      this.el_r = createElement('div', { name: 'grab-r' }, elm);
	      this.drag_r = new Draggable(elm, this.el_r, RESIZE_R, this.options);
	      this.el_b = createElement('div', { name: 'grab-b' }, elm);
	      this.drag_b = new Draggable(elm, this.el_b, RESIZE_B, this.options);
	      this.el_l = createElement('div', { name: 'grab-l' }, elm);
	      this.drag_l = new Draggable(elm, this.el_l, RESIZE_L, this.options);
	      this.el_tl = createElement('div', { name: 'grab-tl' }, elm);
	      this.drag_tl = new Draggable(elm, this.el_tl, RESIZE_TL, this.options);
	      this.el_tr = createElement('div', { name: 'grab-tr' }, elm);
	      this.drag_tr = new Draggable(elm, this.el_tr, RESIZE_TR, this.options);
	      this.el_br = createElement('div', { name: 'grab-br' }, elm);
	      this.drag_br = new Draggable(elm, this.el_br, RESIZE_BR, this.options);
	      this.el_bl = createElement('div', { name: 'grab-bl' }, elm);
	      this.drag_bl = new Draggable(elm, this.el_bl, RESIZE_BL, this.options);
	    }
	  }
	}

	class Draggable {
	  constructor(targetElm, handleElm, op, options) {
	    Object.assign(this, options);
	    options = undefined;

	    this._targetElm = targetElm;
	    this._handleElm = handleElm;

	    let vw = window.innerWidth;
	    let vh = window.innerHeight;
	    let initialX, initialY, initialT, initialL, initialW, initialH;

	    const clamp = (value, min, max) => value < min ? min : value > max ? max : value;

	    const moveOp = (x, y) => {
	      const deltaX = (x - initialX);
	      const deltaY = (y - initialY);
	      const t = clamp(initialT + deltaY, 0, vh - initialH);
	      const l = clamp(initialL + deltaX, 0, vw - initialW);
	      this._targetElm.style.top = t + 'px';
	      this._targetElm.style.left = l + 'px';
	    };

	    const resizeOp = (x, y) => {
	      x = clamp(x, 0, vw);
	      y = clamp(y, 0, vh);
	      const deltaX = (x - initialX);
	      const deltaY = (y - initialY);
	      const resizeDirX = (op & RESIZE_L) ? -1 : 1;
	      const resizeDirY = (op & RESIZE_T) ? -1 : 1;
	      const deltaXMax = (this.maxWidth - initialW);
	      const deltaXMin = (this.minWidth - initialW);
	      const deltaYMax = (this.maxHeight - initialH);
	      const deltaYMin = (this.minHeight - initialH);
	      const t = initialT + clamp(deltaY * resizeDirY, deltaYMin, deltaYMax) * resizeDirY;
	      const l = initialL + clamp(deltaX * resizeDirX, deltaXMin, deltaXMax) * resizeDirX;
	      const w = initialW + clamp(deltaX * resizeDirX, deltaXMin, deltaXMax);
	      const h = initialH + clamp(deltaY * resizeDirY, deltaYMin, deltaYMax);
	      if (op & RESIZE_T) { // resize ↑
	        this._targetElm.style.top = t + 'px';
	        this._targetElm.style.height = h + 'px';
	      }
	      if (op & RESIZE_B) { // resize ↓
	        this._targetElm.style.height = h + 'px';
	      }
	      if (op & RESIZE_L) { // resize ←
	        this._targetElm.style.left = l + 'px';
	        this._targetElm.style.width = w + 'px';
	      }
	      if (op & RESIZE_R) { // resize →
	        this._targetElm.style.width = w + 'px';
	      }
	    };

	    let operation = op === MOVE ? moveOp : resizeOp;

	    function dragStartHandler(e) {
	      const touch = e.type === 'touchstart';
	      if ((e.buttons === 1 || e.which === 1) || touch) {
	        e.preventDefault();
	        const x = touch ? e.touches[0].clientX : e.clientX;
	        const y = touch ? e.touches[0].clientY : e.clientY;
	        initialX = x;
	        initialY = y;
	        vw = window.innerWidth;
	        vh = window.innerHeight;
	        initialT = this._targetElm.offsetTop;
	        initialL = this._targetElm.offsetLeft;
	        initialW = this._targetElm.clientWidth;
	        initialH = this._targetElm.clientHeight;
	        if (this.useMouseEvents) {
	          document.addEventListener('mousemove', this._dragMoveHandler);
	          document.addEventListener('mouseup', this._dragEndHandler);
	        }
	        if (this.useTouchEvents) {
	          document.addEventListener('touchmove', this._dragMoveHandler, { passive: false });
	          document.addEventListener('touchend', this._dragEndHandler);
	        }
	        this._targetElm.classList.add(this.draggingClass);
	      }
	    }

	    function dragMoveHandler(e) {
	      e.preventDefault();
	      let x, y;
	      const touch = e.type === 'touchmove';
	      if (touch) {
	        const t = e.touches[0];
	        x = t.clientX;
	        y = t.clientY;
	      } else { //mouse
	        // If the button is not down, dispatch a "fake" mouse up event, to stop listening to mousemove
	        // This happens when the mouseup is not captured (outside the browser)
	        if ((e.buttons || e.which) !== 1) {
	          this._dragEndHandler();
	          return;
	        }
	        x = e.clientX;
	        y = e.clientY;
	      }
	      // perform drag / resize operation
	      operation(x, y);
	    }

	    function dragEndHandler(e) {
	      if (this.useMouseEvents) {
	        document.removeEventListener('mousemove', this._dragMoveHandler);
	        document.removeEventListener('mouseup', this._dragEndHandler);
	      }
	      if (this.useTouchEvents) {
	        document.removeEventListener('touchmove', this._dragMoveHandler);
	        document.removeEventListener('touchend', this._dragEndHandler);
	      }
	      this._targetElm.classList.remove(this.draggingClass);
	    }

	    // We need to bind the handlers to this instance
	    this._dragStartHandler = dragStartHandler.bind(this);
	    this._dragMoveHandler = dragMoveHandler.bind(this);
	    this._dragEndHandler = dragEndHandler.bind(this);

	    this.enable();
	  }

	  /** Turn on the drag and drop of the instance */
	  enable() {
	    this.destroy(); // prevent events from getting binded twice
	    if (this.useMouseEvents) this._handleElm.addEventListener('mousedown', this._dragStartHandler);
	    if (this.useTouchEvents) this._handleElm.addEventListener('touchstart', this._dragStartHandler, { passive: false });
	  }

	  /** Teardown all events bound to the document and elements. You can resurrect this instance by calling enable() */
	  destroy() {
	    this._targetElm.classList.remove(this.draggingClass);
	    if (this.useMouseEvents) {
	      this._handleElm.removeEventListener('mousedown', this._dragStartHandler);
	      document.removeEventListener('mousemove', this._dragMoveHandler);
	      document.removeEventListener('mouseup', this._dragEndHandler);
	    }
	    if (this.useTouchEvents) {
	      this._handleElm.removeEventListener('touchstart', this._dragStartHandler);
	      document.removeEventListener('touchmove', this._dragMoveHandler);
	      document.removeEventListener('touchend', this._dragEndHandler);
	    }
	  }
	}

	function createElement(tag='div', attrs, parent) {
	  const elm = document.createElement(tag);
	  if (attrs) Object.entries(attrs).forEach(([k, v]) => elm.setAttribute(k, v));
	  if (parent) parent.appendChild(elm);
	  return elm;
	}

	function defaultArgs(defaults, options) {
	  function isObj(x) { return x !== null && typeof x === 'object'; }
	  function hasOwn(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
	  if (isObj(options)) for (let prop in defaults) {
	    if (hasOwn(defaults, prop) && hasOwn(options, prop) && options[prop] !== undefined) {
	      if (isObj(defaults[prop])) defaultArgs(defaults[prop], options[prop]);
	      else defaults[prop] = options[prop];
	    }
	  }
	  return defaults;
	}

	function createElm(html) {
	  const temp = document.createElement('div');
	  temp.innerHTML = html;
	  return temp.removeChild(temp.firstElementChild);
	}

	function insertCss(css) {
	  const style = document.createElement('style');
	  style.appendChild(document.createTextNode(css));
	  document.head.appendChild(style);
	  return style;
	}

	const messagePickerCss = `
body.cordwipe-pick-message [data-list-id="chat-messages"] {
  background-color: var(--background-secondary-alt);
  box-shadow: inset 0 0 0px 2px var(--button-outline-brand-border);
}

body.cordwipe-pick-message [id^="message-content-"]:hover {
  cursor: pointer;
  cursor: cell;
  background: var(--background-message-automod-hover);
}
body.cordwipe-pick-message [id^="message-content-"]:hover::after {
  position: absolute;
  top: calc(50% - 11px);
  left: 4px;
  z-index: 1;
  width: 65px;
  height: 22px;
  line-height: 22px;
  font-family: var(--font-display);
  background-color: var(--button-secondary-background);
  color: var(--header-secondary);
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  text-align: center;
  border-radius: 3px;
  content: 'This 👉';
}
body.cordwipe-pick-message.before [id^="message-content-"]:hover::after {
  content: 'Before 👆';
}
body.cordwipe-pick-message.after [id^="message-content-"]:hover::after {
  content: 'After 👇';
}
`;

	const messagePicker = {
	  init() {
	    insertCss(messagePickerCss);
	  },
	  grab(auxiliary) {
	    return new Promise(resolve => {
	      document.body.classList.add('cordwipe-pick-message');
	      if (auxiliary) document.body.classList.add(auxiliary);
	      function cleanup() {
	        if (auxiliary) document.body.classList.remove(auxiliary);
	        document.body.classList.remove('cordwipe-pick-message');
	        document.removeEventListener('click', clickHandler, true);
	        document.removeEventListener('keydown', keyHandler, true);
	      }
	      function keyHandler(e) {
	        if (e.key === 'Escape') { e.stopPropagation(); cleanup(); resolve(null); }
	      }
	      function clickHandler(e) {
	        const message = e.target.closest('[id^="message-content-"]');
	        if (message) {
	          e.preventDefault();
	          e.stopPropagation();
	          e.stopImmediatePropagation();
	          cleanup();
	          try {
	            resolve(message.id.match(/message-content-(\d+)/)[1]);
	          } catch (e) {
	            resolve(null);
	          }
	        }
	      }
	      document.addEventListener('click', clickHandler, true);
	      document.addEventListener('keydown', keyHandler, true);
	    });
	  }
	};

	// Derived from Undiscord (victornpb and contributors); see LICENSE.

	function readStored(key) {
	  const frame = document.createElement('iframe');
	  frame.hidden = true;
	  document.body.appendChild(frame);
	  try { return JSON.parse(frame.contentWindow.localStorage.getItem(key)); }
	  catch { return null; }
	  finally { frame.remove(); }
	}

	function fromModules(pick) {
	  const chunks = window.webpackChunkdiscord_app;
	  if (!chunks || typeof chunks.push !== 'function') return null;
	  let found = null;
	  const chunk = [[Symbol('cordwipe')], {}, runtime => {
	    for (const module of Object.values(runtime.c || {})) {
	      try {
	        const exports = module?.exports;
	        for (const candidate of [exports, exports?.default]) {
	          const value = candidate && pick(candidate);
	          if (value) { found = value; return; }
	        }
	      } catch { /* Module getters may throw. Never log their contents. */ }
	    }
	  }];
	  try { chunks.push(chunk); }
	  catch { /* An unsupported client must fail without exposing module contents. */ }
	  finally {
	    // Remove only our own entry; another chunk may have been appended meanwhile.
	    const index = chunks.indexOf(chunk);
	    if (index >= 0) chunks.splice(index, 1);
	  }
	  return found;
	}

	const usableToken = value => typeof value === 'string' && value.length > 0 && !value.startsWith('dQw4w9WgXcQ:');

	// Invoked only by Find & review after scope validation, never by initialization.
	function getToken() {
	  const stored = readStored('token');
	  if (usableToken(stored)) return stored;
	  return fromModules(source => {
	    const token = typeof source.getToken === 'function' && source.getToken();
	    return usableToken(token) ? token : null;
	  });
	}

	function getAuthorId() {
	  const cached = readStored('user_id_cache');
	  if (typeof cached === 'string' && /^\d{17,20}$/.test(cached)) return cached;
	  const id = fromModules(source => {
	    const user = typeof source.getCurrentUser === 'function' && source.getCurrentUser();
	    return user?.id;
	  });
	  if (typeof id === 'string' && /^\d{17,20}$/.test(id)) return id;
	  log.error('Could not find your Author ID. Enter your numeric user ID manually.');
	  return '';
	}

	function currentRoute() {
	  const match = location.pathname.match(/^\/channels\/(@me|\d+)\/(\d+)/);
	  if (!match) { log.error('Open a channel or DM first.'); return null; }
	  return { guildId: match[1], channelId: match[2] };
	}
	const getGuildId = () => currentRoute()?.guildId || '';
	const getChannelId = () => currentRoute()?.channelId || '';
	function fillToken() {
	  try {
	    const token = getToken();
	    if (token) return token;
	  } catch { /* Do not expose credential-bearing errors. */ }
	  log.error('Could not access the current Discord session. Reload Discord and try again. This client version may not be supported; never copy or share your token.');
	  return '';
	}

	// Derived from Undiscord, Copyright (c) 2019-2025 Victornpb and contributors.
	// https://github.com/victornpb/undiscord - see LICENSE.


	// -------------------------- User interface ------------------------------- //

	// links
	const HOME = 'https://github.com/avizmarlon/cordwipe';
	const WIKI = HOME + '/blob/main/README.md#how-to-use';

	const cordwipeCore = new CordWipeCore();


	const ui = {
	  cordwipeWindow: null,
	  cordwipeBtn: null,
	  logArea: null,
	  autoScroll: null,

	  // progress handler
	  progressMain: null,
	  progressIcon: null,
	  percent: null,
	};
	const $ = s => ui.cordwipeWindow.querySelector(s);

	function initUI() {
	  if (document.getElementById('cordwipe')) return;
	  messagePicker.init();

	  insertCss(themeCss);
	  insertCss(mainCss);
	  insertCss(dragCss);

	  // create cordwipe window
	  const cordwipeUI = replaceInterpolations(cordwipeTemplate, {
	    VERSION,
	    HOME,
	    WIKI,
	    CORDWIPE_ICON: cordwipeIcon,
	  });
	  ui.cordwipeWindow = createElm(cordwipeUI);
	  document.body.appendChild(ui.cordwipeWindow);

	  // enable drag and resize on cordwipe window
	  new DragResize({ elm: ui.cordwipeWindow, moveHandle: $('.header') });

	  ui.cordwipeBtn = createElm(replaceInterpolations(buttonHtml, { CORDWIPE_ICON: cordwipeIcon }));
	  ui.cordwipeBtn.onclick = toggleWindow;
	  mountLauncher(ui.cordwipeBtn, ui.cordwipeWindow);

	  function toggleWindow() {
	    if (ui.cordwipeWindow.style.display !== 'none') {
	      ui.cordwipeWindow.style.display = 'none';
	      ui.cordwipeBtn.setAttribute('aria-expanded', 'false');
	      ui.cordwipeBtn.focus();

	    }
	    else {
	      ui.cordwipeWindow.style.display = '';
	      ui.cordwipeBtn.setAttribute('aria-expanded', 'true');
	      $('#hide').focus();

	    }
	  }

	  // cached elements
	  ui.logArea = $('#logArea');
	  ui.autoScroll = $('#autoScroll');
	  ui.progressMain = $('#progressBar');
	  ui.progressIcon = ui.cordwipeBtn.querySelector('progress');
	  ui.percent = $('#progressPercent');

	  // register event listeners
	  $('#hide').onclick = toggleWindow;
	  document.addEventListener('keydown', e => {
	    if (e.key === 'Escape' && ui.cordwipeWindow.style.display !== 'none') toggleWindow();
	  });
	  $('#toggleSidebar').onclick = ()=> ui.cordwipeWindow.classList.toggle('hide-sidebar');
	  $('button#start').onclick = startAction;
	  $('button#stop').onclick = stopAction;
	  $('button#clear').onclick = () => ui.logArea.innerHTML = '';
	  $('button#getAuthor').onclick = () => {
	    $('input#authorId').value = getAuthorId();
	  };
	  $('button#getGuild').onclick = () => {
	    const guildId = $('input#guildId').value = getGuildId();
	    if (guildId === '@me') $('input#channelId').value = getChannelId();
	  };
	  $('button#getChannel').onclick = () => {
	    $('input#channelId').value = getChannelId();
	    $('input#guildId').value = getGuildId();
	  };
	  $('#redact').onchange = () => {
	    const b = ui.cordwipeWindow.classList.toggle('redact');
	    if (b) alert('This mode will attempt to hide personal information, so you can screen share / take screenshots.\nAlways double check you are not sharing sensitive information!');
	  };
	  $('#pickMessageAfter').onclick = async () => {
	    alert('Select the exclusive lower message boundary. Press Escape to cancel.');
	    toggleWindow();
	    const id = await messagePicker.grab('after');
	    if (id) $('input#minId').value = id;
	    toggleWindow();
	  };
	  $('#pickMessageBefore').onclick = async () => {
	    alert('Select the exclusive upper message boundary. Press Escape to cancel.');
	    toggleWindow();
	    const id = await messagePicker.grab('before');
	    if (id) $('input#maxId').value = id;
	    toggleWindow();
	  };
	  for (const name of ['searchDelay', 'deleteDelay']) {
	    const input = $('input#' + name);
	    const sync = () => $('div#' + name + 'Value').textContent = input.value + 'ms';
	    input.addEventListener('input', sync);
	    sync();
	  }

	  // redirect console logs to inside the window after setting up the UI
	  setLogFn(printLog);

	  setupCordWipeCore();
	}

	function printLog(type = '', args) {
	  const line = document.createElement('div');
	  line.className = 'log log-' + type;
	  line.textContent = Array.from(args).join('\t');
	  ui.logArea.appendChild(line);
	  while (ui.logArea.children.length > 1000) ui.logArea.firstElementChild.remove();
	  if (ui.autoScroll.checked) line.scrollIntoView?.(false);
	}

	function setupCordWipeCore() {

	  cordwipeCore.onStart = (state, stats) => {
	    for (const control of ui.cordwipeWindow.querySelectorAll('.sidebar input, .sidebar button')) control.disabled = true;
	    $('#start').disabled = true;
	    $('#stop').disabled = false;

	    ui.cordwipeBtn.classList.add('running');
	    ui.progressMain.style.display = 'block';
	    ui.percent.style.display = 'block';
	  };

	  cordwipeCore.onProgress = state => {
	    // Search totals include skipped hits and shrink during deletion; they are not a denominator.
	    ui.percent.textContent = `Scanned: ${state.scannedCount}; deleted: ${state.delCount}; already absent: ${state.missingCount}; failed: ${state.failCount}`;
	    ui.progressIcon.removeAttribute('value');
	    ui.progressMain.removeAttribute('value');
	  };

	  cordwipeCore.onStop = (state, stats) => {
	    for (const control of ui.cordwipeWindow.querySelectorAll('.sidebar input, .sidebar button')) control.disabled = false;
	    ui.percent.textContent = `${state.status}: ${state.delCount} deleted, ${state.missingCount} already absent, ${state.failCount} failed; ${state.skippedCount} skipped`;
	    $('#start').disabled = false;
	    $('#stop').disabled = true;
	    ui.cordwipeBtn.classList.remove('running');
	    ui.progressMain.style.display = 'none';
	    ui.percent.style.display = 'block';
	  };
	}

	async function startAction() {
	  if (cordwipeCore._active || cordwipeCore._batchActive) return;
	  const read = id => $('#' + id).value.trim();
	  const checked = id => $('#' + id).checked;
	  const channelIds = [...new Set(read('channelId').split(/\s*,\s*/))];
	  if (channelIds.length > 1 && channelIds.some(id => !id)) return log.error('Remove empty Channel IDs.');
	  if ((read('minId') || read('maxId')) && (read('minDate') || read('maxDate'))) {
	    return log.error('Choose either a message interval or a date interval, not both.');
	  }
	  const options = {
	    authorId: read('authorId'), guildId: read('guildId'),
	    channelId: channelIds[0], content: read('search'), pattern: read('pattern'),
	    minId: read('minId') || read('minDate'), maxId: read('maxId') || read('maxDate'),
	    hasLink: checked('hasLink'), hasFile: checked('hasFile'),
	    includePinned: checked('includePinned'), includeNsfw: checked('includeNsfw'),
	    searchDelay: Number(read('searchDelay')), deleteDelay: Number(read('deleteDelay')),
	  };
	  // Validate every target before attempting credential retrieval or network access.
	  try {
	    for (const channelId of channelIds) cordwipeCore.validate({ ...options, channelId, authToken: 'validation-only' });
	  } catch (error) { return log.error(error.message); }
	  const authToken = fillToken();
	  if (!authToken) return;
	  ui.logArea.textContent = '';
	  cordwipeCore.resetState();
	  cordwipeCore.options = { ...options, authToken };
	  try {
	    if (channelIds.length > 1) await cordwipeCore.runBatch(channelIds.map(channelId => ({ channelId })));
	    else await cordwipeCore.run();
	  } catch { log.error('Could not start. Check the selected fields and try again.'); }
	  finally { cordwipeCore.options.authToken = null; }
	}

	function stopAction() {

	  cordwipeCore.stop();
	}

	// ---- END CordWipe ----

	// Discord can enter channels through SPA navigation from /app or /login.
	// Wait for the channel view; never read session data on an entry/login page.
	function start() {
	  const observer = new MutationObserver(tryInit);
	  function tryInit() {
	    if (!/^\/channels\/(?:@me|\d+)(?:\/|$)/.test(location.pathname)) return;
	    observer.disconnect();
	    removeEventListener('popstate', tryInit);
	    initUI();
	  }
	  observer.observe(document.documentElement, { childList: true, subtree: true });
	  addEventListener('popstate', tryInit);
	  tryInit();
	}
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
	else start();

})();
