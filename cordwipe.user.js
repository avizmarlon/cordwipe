// ==UserScript==
// @name        CordWipe [Development]
// @description Delete your own matching Discord messages with explicit scope and confirmation.
// @version     0.1.0-dev.1
// @author      CordWipe contributors
// @homepageURL https://github.com/avizmarlon/cordwipe
// @supportURL  https://github.com/avizmarlon/cordwipe/issues
// @match       https://discord.com/channels/*
// @match       https://ptb.discord.com/channels/*
// @match       https://canary.discord.com/channels/*
// @license     MIT
// @namespace   https://github.com/avizmarlon/cordwipe
// @run-at      document-idle
// @grant       none
// @updateURL   none
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
	const VERSION = "0.1.0-dev.1";

	var themeCss = "/* cordwipe window */\r#cordwipe.browser {\r    box-shadow: var(--shadow-border), var(--shadow-high);\r        border: 1px solid var(--border-subtle);\r    overflow: hidden;\r}\r#cordwipe.container,\r#cordwipe .container {\r    background-color: var(--background-surface-high);\r    border-radius: 8px;\r    box-sizing: border-box;\r    cursor: default;\r    flex-direction: column;\r}\r#cordwipe .header {\r    background-color: var(--background-tertiary);\r    height: 48px;\r    align-items: center;\r    min-height: 48px;\r    padding: 0 16px;\r    display: flex;\r    color: var(--header-secondary);\r    cursor: grab;\r}\r#cordwipe .header .icon {\r    color: var(--interactive-normal);\r    margin-right: 8px;\r    flex-shrink: 0;\r    width: 24;\r    height: 24;\r}\r#cordwipe .header .icon:hover {\r    color: var(--interactive-hover);\r}\r#cordwipe .header h3 {\r    font-size: 16px;\r    line-height: 20px;\r    font-weight: 500;\r    font-family: var(--font-display);\r    color: var(--header-primary);\r    flex-shrink: 0;\r    margin-right: 16px;\r}\r#cordwipe .spacer {\r    flex-grow: 1;\r}\r#cordwipe .header .vert-divider {\r    width: 1px;\r    height: 24px;\r    background-color: var(--background-modifier-accent);\r    margin-right: 16px;\r    flex-shrink: 0;\r}\r#cordwipe legend,\r#cordwipe label {\r    color: var(--header-secondary);\r    font-size: 12px;\r    line-height: 16px;\r    font-weight: 500;\r    text-transform: uppercase;\r    cursor: default;\r    font-family: var(--font-display);\r    margin-bottom: 8px;\r}\r#cordwipe .multiInput {\r    display: flex;\r    align-items: center;\r    font-size: 16px;\r    box-sizing: border-box;\r    width: 100%;\r    border-radius: 3px;\r    color: var(--text-default);\r    background-color: var(--input-background);\r    border: none;\r    transition: border-color 0.2s ease-in-out 0s;\r}\r#cordwipe .multiInput :first-child {\r    flex-grow: 1;\r}\r#cordwipe .multiInput button:last-child {\r    margin-right: 4px;\r}\r#cordwipe .input {\r    font-size: 16px;\r    width: 100%;\r    transition: border-color 0.2s ease-in-out 0s;\r    padding: 10px;\r    height: 44px;\r    background-color: var(--input-background);\r    border: 1px solid var(--input-border);\r    border-radius: 8px;\r    box-sizing: border-box;\r    color: var(--text-default);\r}\r#cordwipe fieldset {\r    margin-top: 16px;\r    border: 0;\r    padding: 0;\r    min-width: 0;\r}\r#cordwipe .input-wrapper {\r    display: flex;\r    align-items: center;\r    font-size: 16px;\r    box-sizing: border-box;\r    width: 100%;\r    border-radius: 3px;\r    color: var(--text-default);\r    background-color: var(--input-background);\r    border: none;\r    transition: border-color 0.2s ease-in-out 0s;\r}\r#cordwipe input[type=\"text\"],\r#cordwipe input[type=\"search\"],\r#cordwipe input[type=\"password\"],\r#cordwipe input[type=\"datetime-local\"],\r#cordwipe input[type=\"number\"],\r#cordwipe input[type=\"range\"] {\r    background-color: var(--input-background);\r    border: 1px solid var(--input-border);\r    border-radius: 8px;\r    box-sizing: border-box;\r    color: var(--text-default);\r    font-size: 16px;\r    height: 44px;\r    padding: 12px 10px;\r    transition: border-color .2s ease-in-out;\r    width: 100%;\r}\r#cordwipe .divider,\r#cordwipe hr {\r    border: none;\r    margin-bottom: 24px;\r    padding-bottom: 4px;\r    border-bottom: 1px solid var(--background-modifier-accent);\r}\r#cordwipe .sectionDescription {\r    margin-bottom: 16px;\r    color: var(--header-secondary);\r    font-size: 14px;\r    line-height: 20px;\r    font-weight: 400;\r}\r#cordwipe a {\r    color: var(--text-link);\r    text-decoration: none;\r}\r#cordwipe .btn,\r#cordwipe button {\r    position: relative;\r    display: flex;\r    -webkit-box-pack: center;\r    justify-content: center;\r    -webkit-box-align: center;\r    align-items: center;\r    box-sizing: border-box;\r    background: none;\r    border: none;\r    border-radius: 3px;\r    font-size: 14px;\r    font-weight: 500;\r    line-height: 16px;\r    padding: 2px 16px;\r    user-select: none;\r    /* sizeSmall */\r    width: 60px;\r    height: 32px;\r    min-width: 60px;\r    min-height: 32px;\r    /* lookFilled colorPrimary */\r    color: rgb(255, 255, 255);\r    background-color: var(--button-secondary-background);\r}\r#cordwipe .sizeMedium {\r    width: 96px;\r    height: 38px;\r    min-width: 96px;\r    min-height: 38px;\r}\r#cordwipe .sizeMedium.icon {\r    width: 38px;\r    min-width: 38px;\r}\r#cordwipe sup {\r    vertical-align: top;\r}\r/* lookFilled colorPrimary */\r#cordwipe .accent {\r    background-color: var(--brand-experiment);\r}\r#cordwipe .danger {\r    background-color: var(--button-danger-background);\r}\r#cordwipe .positive {\r    background-color: var(--button-positive-background);\r}\r#cordwipe .info {\r    font-size: 12px;\r    line-height: 16px;\r    padding: 8px 10px;\r    color: var(--text-muted);\r}\r/* Scrollbar */\r#cordwipe .scroll::-webkit-scrollbar {\r    width: 8px;\r    height: 8px;\r}\r#cordwipe .scroll::-webkit-scrollbar-corner {\r    background-color: transparent;\r}\r#cordwipe .scroll::-webkit-scrollbar-thumb {\r    background-clip: padding-box;\r    border: 2px solid transparent;\r    border-radius: 4px;\r    background-color: var(--scrollbar-thin-thumb);\r    min-height: 40px;\r}\r#cordwipe .scroll::-webkit-scrollbar-track {\r    border-color: var(--scrollbar-thin-track);\r    background-color: var(--scrollbar-thin-track);\r    border: 2px solid var(--scrollbar-thin-track);\r}\r/* fade scrollbar */\r#cordwipe .scroll::-webkit-scrollbar-thumb,\r#cordwipe .scroll::-webkit-scrollbar-track {\r    visibility: hidden;\r}\r#cordwipe .scroll:hover::-webkit-scrollbar-thumb,\r#cordwipe .scroll:hover::-webkit-scrollbar-track {\r    visibility: visible;\r}\r/**** functional classes ****/\r#cordwipe.redact .priv {\r    display: none !important;\r}\r#cordwipe.redact x:not(:active) {\r    color: transparent !important;\r    background-color: var(--primary-700) !important;\r    cursor: default;\r    user-select: none;\r}\r#cordwipe.redact x:hover {\r    position: relative;\r}\r#cordwipe.redact x:hover::after {\r    content: \"Redacted information (Streamer mode: ON)\";\r    position: absolute;\r    display: inline-block;\r    top: -32px;\r    left: -20px;\r    padding: 4px;\r    width: 150px;\r    font-size: 8pt;\r    text-align: center;\r    white-space: pre-wrap;\r    background-color: var(--background-floating);\r    -webkit-box-shadow: var(--elevation-high);\r    box-shadow: var(--elevation-high);\r    color: var(--text-default);\r    border-radius: 5px;\r    pointer-events: none;\r}\r#cordwipe.redact [priv] {\r    -webkit-text-security: disc !important;\r}\r#cordwipe :disabled {\r    opacity: .55;\r    cursor: not-allowed;\r}\r/**** layout and utility classes ****/\r#cordwipe,\r#cordwipe * {\r    box-sizing: border-box;\r}\r#cordwipe .col {\r    display: flex;\r    flex-direction: column;\r}\r#cordwipe .row {\r    display: flex;\r    flex-direction: row;\r    align-items: center;\r}\r#cordwipe .mb1 {\r    margin-bottom: 8px;\r}\r#cordwipe .log {\r    margin-bottom: 0.25em;\r}\r#cordwipe .log-debug {\r    color: inherit;\r}\r#cordwipe .log-info {\r    color: #00b0f4;\r}\r#cordwipe .log-verb {\r    color: #72767d;\r}\r#cordwipe .log-warn {\r    color: #faa61a;\r}\r#cordwipe .log-error {\r    color: #f04747;\r}\r#cordwipe .log-success {\r    color: #43b581;\r}\r";

	var mainCss = "/**** CordWipe Button ****/\r#cordwipe-btn {\r    position: relative;\r    width: auto;\r    height: 24px;\r    margin: 0 8px;\r    cursor: pointer;\r    color: var(--interactive-normal);\r    flex: 0 0 auto;\r    background: transparent;\r    border: 0;\r    padding: 0;\r    border-radius: 6px;\r    color: var(--interactive-normal, #ddd);\r}\r#cordwipe-btn.cordwipe-floating {\r    position: fixed;\r    z-index: 10000;\r    bottom: 24px;\r    right: 24px;\r    width: 44px;\r    height: 44px;\r    background: #4338ca;\r    color: white;\r    box-shadow: 0 2px 10px #0008;\r}\r#cordwipe-btn:focus-visible { outline: 2px solid #a5b4fc; outline-offset: 3px; }\r#cordwipe-btn progress {\r    position: absolute;\r    top: 23px;\r    left: -4px;\r    width: 32px;\r    height: 12px;\r    display: none;\r}\r#cordwipe-btn.running {\r    color: var(--button-danger-background) !important;\r}\r#cordwipe-btn.running progress {\r    display: block;\r}\r/**** CordWipe Interface ****/\r#cordwipe {\r    position: fixed;\r    z-index: 10001;\r    top: 58px;\r    right: 10px;\r    display: flex;\r    flex-direction: column;\r    width: 800px;\r    height: 80vh;\r    min-width: min(610px, 100vw);\r    max-width: 100vw;\r    min-height: 448px;\r    max-height: 100vh;\r    color: var(--text-normal);\r    border-radius: 4px;\r    background-color: var(--background-secondary);\r    box-shadow: var(--elevation-stroke), var(--elevation-high);\r    will-change: top, left, width, height;\r    font: 14px/1.4 system-ui, sans-serif;\r    --text-normal: #f3f4f6;\r    --text-default: #f3f4f6;\r    --header-primary: #fff;\r    --header-secondary: #d1d5db;\r    --text-muted: #c0c4ce;\r    --text-link: #a5b4fc;\r    --background-secondary: #24252b;\r    --background-tertiary: #1a1b20;\r    --background-surface-high: #24252b;\r    --background-base-lowest: #1a1b20;\r    --background-base-lower: #24252b;\r    --input-background: #15161b;\r    --input-border: #565963;\r    --button-secondary-background: #454853;\r    --button-danger-background: #b91c1c;\r    --interactive-normal: #d1d5db;\r    --interactive-active: #fff;\r    --font-display: system-ui, sans-serif;\r}\r#cordwipe .header .icon {\r    cursor: pointer;\r}\r#cordwipe .window-body {\r    height: calc(100% - 48px);\r}\r#cordwipe .sidebar {\r    overflow: hidden scroll;\r    overflow-y: auto;\r    width: 270px;\r    min-width: 250px;\r    height: 100%;\r    max-height: 100%;\r    padding: 8px;\r    background: var(--bg-overlay-4, var(--background-base-lowest));\r}\r#cordwipe .sidebar legend,\r#cordwipe .sidebar label {\r    display: block;\r    width: 100%;\r}\r#cordwipe .main {\r    display: flex;\r    max-width: calc(100% - 250px);\r    background-color: var(--bg-overlay-chat, var(--background-base-lower));\r    flex-grow: 1;\r    min-width: 0;\r}\r#cordwipe.hide-sidebar .sidebar {\r    display: none;\r}\r#cordwipe.hide-sidebar .main {\r    max-width: 100%;\r}\r#cordwipe #logArea {\r    font-family: Consolas, Liberation Mono, Menlo, Courier, monospace;\r    font-size: 0.75rem;\r    overflow: auto;\r    padding: 10px;\r    user-select: text;\r    flex-grow: 1;\r    flex-grow: 1;\r    cursor: auto;\r    white-space: pre-wrap;\r    overflow-wrap: anywhere;\r}\r#cordwipe .tbar {\r    padding: 8px;\r    background-color: var(--bg-overlay-2, var(--__header-bar-background));\r}\r#cordwipe .tbar button {\r    margin-right: 4px;\r    margin-bottom: 4px;\r}\r#cordwipe .footer {\r    cursor: se-resize;\r    padding-right: 30px;\r}\r#cordwipe .footer #progressPercent {\r    padding: 0 1em;\r    font-size: small;\r    color: var(--interactive-muted);\r    flex-grow: 1;\r}\r.resize-handle {\r    position: absolute;\r    bottom: -15px;\r    right: -15px;\r    width: 30px;\r    height: 30px;\r    transform: rotate(-45deg);\r    background: repeating-linear-gradient(0, var(--background-modifier-accent), var(--background-modifier-accent) 1px, transparent 2px, transparent 4px);\r    cursor: nwse-resize;\r}\r/**** Elements ****/\r#cordwipe summary {\r    font-size: 16px;\r    font-weight: 500;\r    line-height: 20px;\r    position: relative;\r    overflow: hidden;\r    margin-bottom: 2px;\r    padding: 6px 10px;\r    cursor: pointer;\r    white-space: nowrap;\r    text-overflow: ellipsis;\r    color: var(--interactive-normal);\r    border-radius: 4px;\r    flex-shrink: 0;\r}\r#cordwipe fieldset {\r    padding-left: 8px;\r}\r#cordwipe legend a {\r    float: right;\r    text-transform: initial;\r}\r#cordwipe progress {\r    height: 8px;\r    margin-top: 4px;\r    flex-grow: 1;\r}\r#cordwipe .importJson {\r    display: flex;\r    flex-direction: row;\r}\r#cordwipe .importJson button {\r    margin-left: 5px;\r    width: fit-content;\r}\r";

	var dragCss = "[name^=\"grab-\"] {\r  position: absolute;\r  --size: 6px;\r  --corner-size: 16px;\r  --offset: -1px;\r  z-index: 9;\r}\r[name^=\"grab-\"]:hover{\r    background: rgba(128,128,128,0.1);\r}\r[name=\"grab-t\"] {\r  top: 0px;\r  left: var(--corner-size);\r  right: var(--corner-size);\r  height: var(--size);\r  margin-top: var(--offset);\r  cursor: ns-resize;\r}\r[name=\"grab-r\"] {\r  top: var(--corner-size);\r  bottom: var(--corner-size);\r  right: 0px;\r  width: var(--size);\r  margin-right: var(--offset); \r  cursor: ew-resize;\r}\r[name=\"grab-b\"] {\r  bottom: 0px;\r  left: var(--corner-size);\r  right: var(--corner-size);\r  height: var(--size);\r  margin-bottom: var(--offset);\r  cursor: ns-resize;\r}\r[name=\"grab-l\"] {\r  top: var(--corner-size);\r  bottom: var(--corner-size);\r  left: 0px;\r  width: var(--size);\r  margin-left: var(--offset);\r  cursor: ew-resize;\r}\r[name=\"grab-tl\"] {\r  top: 0px;\r  left: 0px;\r  width: var(--corner-size);\r  height: var(--corner-size);\r  margin-top: var(--offset);\r  margin-left: var(--offset);\r  cursor: nwse-resize;\r}\r[name=\"grab-tr\"] {\r  top: 0px;\r  right: 0px;\r  width: var(--corner-size);\r  height: var(--corner-size);\r  margin-top: var(--offset);\r  margin-right: var(--offset);\r  cursor: nesw-resize;\r}\r[name=\"grab-br\"] {\r  bottom: 0px;\r  right: 0px;\r  width: var(--corner-size);\r  height: var(--corner-size);\r  margin-bottom: var(--offset);\r  margin-right: var(--offset);\r  cursor: nwse-resize;\r}\r[name=\"grab-bl\"] {\r  bottom: 0px;\r  left: 0px;\r  width: var(--corner-size);\r  height: var(--corner-size);\r  margin-bottom: var(--offset);\r  margin-left: var(--offset);\r  cursor: nesw-resize;\r}";

	var buttonHtml = "<button id=\"cordwipe-btn\" type=\"button\" aria-label=\"Open CordWipe\" aria-controls=\"cordwipe\" aria-expanded=\"false\" title=\"Open CordWipe\">\r\n    <svg aria-hidden=\"false\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\">\r\n        <path fill=\"currentColor\" d=\"M15 3.999V2H9V3.999H3V5.999H21V3.999H15Z\"></path>\r\n        <path fill=\"currentColor\" d=\"M5 6.99902V18.999C5 20.101 5.897 20.999 7 20.999H17C18.103 20.999 19 20.101 19 18.999V6.99902H5ZM11 17H9V11H11V17ZM15 17H13V11H15V17Z\"></path>\r\n    </svg>\r\n    <progress></progress>\r\n</button>";

	var cordwipeTemplate = "<div id=\"cordwipe\" role=\"dialog\" aria-label=\"CordWipe\" class=\"browser container redact\" style=\"display:none;\">\r\n    <div class=\"header\">\r\n        <svg class=\"icon\" aria-hidden=\"false\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\">\r\n            <path fill=\"currentColor\" d=\"M15 3.999V2H9V3.999H3V5.999H21V3.999H15Z\"></path>\r\n            <path fill=\"currentColor\"\r\n                d=\"M5 6.99902V18.999C5 20.101 5.897 20.999 7 20.999H17C18.103 20.999 19 20.101 19 18.999V6.99902H5ZM11 17H9V11H11V17ZM15 17H13V11H15V17Z\">\r\n            </path>\r\n        </svg>\r\n        <h3>CordWipe</h3>\r\n        <div class=\"vert-divider\"></div>\r\n        <span> Bulk delete messages</span>\r\n        <div class=\"spacer\"></div>\r\n        <button id=\"hide\" class=\"icon\" aria-label=\"Close\" type=\"button\">\r\n            <svg aria-hidden=\"false\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\">\r\n                <path fill=\"currentColor\"\r\n                    d=\"M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z\">\r\n                </path>\r\n            </svg>\r\n        </button>\r\n    </div>\r\n    <div class=\"window-body\" style=\"display: flex; flex-direction: row;\">\r\n        <div class=\"sidebar scroll\">\r\n            <details open>\r\n                <summary>General</summary>\r\n                <fieldset>\r\n                    <legend>\r\n                        Author ID\r\n                        <a href=\"{{WIKI}}\" title=\"Help\" target=\"_blank\" rel=\"noopener noreferrer\">help</a>\r\n                    </legend>\r\n                    <div class=\"multiInput\">\r\n                        <div class=\"input-wrapper\">\r\n                            <input class=\"input\" id=\"authorId\" type=\"text\" priv>\r\n                        </div>\r\n                        <button id=\"getAuthor\">me</button>\r\n                    </div>\r\n                </fieldset>\r\n                <hr>\r\n                <fieldset>\r\n                    <legend>\r\n                        Server ID\r\n                        <a href=\"{{WIKI}}\" title=\"Help\" target=\"_blank\" rel=\"noopener noreferrer\">help</a>\r\n                    </legend>\r\n                    <div class=\"multiInput\">\r\n                        <div class=\"input-wrapper\">\r\n                            <input class=\"input\" id=\"guildId\" type=\"text\" priv>\r\n                        </div>\r\n                        <button id=\"getGuild\">current</button>\r\n                    </div>\r\n                </fieldset>\r\n                <fieldset>\r\n                    <legend>\r\n                        Channel ID\r\n                        <a href=\"{{WIKI}}\" title=\"Help\" target=\"_blank\" rel=\"noopener noreferrer\">help</a>\r\n                    </legend>\r\n                    <div class=\"multiInput mb1\">\r\n                        <div class=\"input-wrapper\">\r\n                            <input class=\"input\" id=\"channelId\" type=\"text\" priv>\r\n                        </div>\r\n                        <button id=\"getChannel\">current</button>\r\n                    </div>\r\n                    <div class=\"sectionDescription\">\r\n                        <label class=\"row\"><input id=\"includeNsfw\" type=\"checkbox\">This is a NSFW channel</label>\r\n                    </div>\r\n                </fieldset>\r\n            </details>\r\n            <hr>\r\n            <details>\r\n                <summary>Filter</summary>\r\n                <fieldset>\r\n                    <legend>\r\n                        Search\r\n                        <a href=\"{{WIKI}}\" title=\"Help\" target=\"_blank\" rel=\"noopener noreferrer\">help</a>\r\n                    </legend>\r\n                    <div class=\"input-wrapper\">\r\n                        <input id=\"search\" type=\"text\" placeholder=\"Containing text\" priv>\r\n                    </div>\r\n                    <div class=\"sectionDescription\">\r\n                        Case-insensitive literal substring; all selected filters must match\r\n                    </div>\r\n                    <div class=\"sectionDescription\">\r\n                        <label><input id=\"hasLink\" type=\"checkbox\">has: link</label>\r\n                    </div>\r\n                    <div class=\"sectionDescription\">\r\n                        <label><input id=\"hasFile\" type=\"checkbox\">has: file</label>\r\n                    </div>\r\n                    <div class=\"sectionDescription\">\r\n                        <label><input id=\"includePinned\" type=\"checkbox\">Include pinned</label>\r\n                    </div>\r\n                </fieldset>\r\n                <hr>\r\n                <fieldset>\r\n                    <legend>\r\n                        Pattern\r\n                        <a href=\"{{WIKI}}\" title=\"Help\" target=\"_blank\" rel=\"noopener noreferrer\">help</a>\r\n                    </legend>\r\n                    <div class=\"sectionDescription\">\r\n                        Case-insensitive regular expression; invalid patterns stop the run\r\n                    </div>\r\n                    <div class=\"input-wrapper\">\r\n                        <span class=\"info\">/</span>\r\n                        <input id=\"pattern\" type=\"text\" placeholder=\"regular expression\" priv>\r\n                        <span class=\"info\">/</span>\r\n                    </div>\r\n                </fieldset>\r\n            </details>\r\n            <details>\r\n                <summary>Messages interval</summary>\r\n                <fieldset>\r\n                    <legend>\r\n                        Interval of messages\r\n                        <a href=\"{{WIKI}}\" title=\"Help\" target=\"_blank\" rel=\"noopener noreferrer\">help</a>\r\n                    </legend>\r\n                    <div class=\"multiInput mb1\">\r\n                        <div class=\"input-wrapper\">\r\n                            <input id=\"minId\" type=\"text\" placeholder=\"After a message\" priv>\r\n                        </div>\r\n                        <button id=\"pickMessageAfter\">Pick</button>\r\n                    </div>\r\n                    <div class=\"multiInput\">\r\n                        <div class=\"input-wrapper\">\r\n                            <input id=\"maxId\" type=\"text\" placeholder=\"Before a message\" priv>\r\n                        </div>\r\n                        <button id=\"pickMessageBefore\">Pick</button>\r\n                    </div>\r\n                    <div class=\"sectionDescription\">\r\n                        Specify an interval to delete messages.\r\n                    </div>\r\n                </fieldset>\r\n            </details>\r\n            <details>\r\n                <summary>Date interval</summary>\r\n                <fieldset>\r\n                    <legend>\r\n                        After date\r\n                        <a href=\"{{WIKI}}\" title=\"Help\" target=\"_blank\" rel=\"noopener noreferrer\">help</a>\r\n                    </legend>\r\n                    <div class=\"input-wrapper mb1\">\r\n                        <input id=\"minDate\" type=\"datetime-local\" title=\"Messages posted AFTER this date\">\r\n                    </div>\r\n                    <legend>\r\n                        Before date\r\n                        <a href=\"{{WIKI}}\" title=\"Help\" target=\"_blank\" rel=\"noopener noreferrer\">help</a>\r\n                    </legend>\r\n                    <div class=\"input-wrapper\">\r\n                        <input id=\"maxDate\" type=\"datetime-local\" title=\"Messages posted BEFORE this date\">\r\n                    </div>\r\n                    <div class=\"sectionDescription\">\r\n                        Delete messages that were posted between the two dates.\r\n                    </div>\r\n                    <div class=\"sectionDescription\">\r\n                        Choose either a date interval or a message interval. Boundaries are exclusive.\r\n                    </div>\r\n                </fieldset>\r\n            </details>\r\n            <hr>\r\n            <details>\r\n                <summary>Advanced settings</summary>\r\n                <fieldset>\r\n                    <legend>\r\n                        Search delay\r\n                        <a href=\"{{WIKI}}\" title=\"Help\" target=\"_blank\" rel=\"noopener noreferrer\">help</a>\r\n                    </legend>\r\n                    <div class=\"input-wrapper\">\r\n                        <input id=\"searchDelay\" type=\"range\" value=\"30000\" step=\"100\" min=\"1000\" max=\"60000\">\r\n                        <div id=\"searchDelayValue\"></div>\r\n                    </div>\r\n                </fieldset>\r\n                <fieldset>\r\n                    <legend>\r\n                        Delete delay\r\n                        <a href=\"{{WIKI}}\" title=\"Help\" target=\"_blank\" rel=\"noopener noreferrer\">help</a>\r\n                    </legend>\r\n                    <div class=\"input-wrapper\">\r\n                        <input id=\"deleteDelay\" type=\"range\" value=\"1000\" step=\"50\" min=\"1000\" max=\"10000\">\r\n                        <div id=\"deleteDelayValue\"></div>\r\n                    </div>\r\n                    <br>\r\n                    <div class=\"sectionDescription\">\r\n                        This will affect the speed in which the messages are deleted.\r\n                        Use the help link for more information.\r\n                    </div>\r\n                </fieldset>\r\n                <hr>\r\n                <fieldset>\r\n                    <legend>\r\n                        Authorization Token\r\n                        <a href=\"{{WIKI}}\" title=\"Help\" target=\"_blank\" rel=\"noopener noreferrer\">help</a>\r\n                    </legend>\r\n                    <div class=\"multiInput\">\r\n                        <div class=\"input-wrapper\">\r\n                            <input class=\"input\" id=\"token\" type=\"password\" autocomplete=\"off\" spellcheck=\"false\" priv>\r\n                        </div>\r\n                        <button id=\"getToken\">fill</button>\r\n                    </div>\r\n                </fieldset>\r\n            </details>\r\n            <hr>\r\n            <div></div>\r\n            <div class=\"info\">\r\n                CordWipe {{VERSION}}\r\n                <br> Based on Undiscord by victornpb and contributors\r\n            </div>\r\n        </div>\r\n        <div class=\"main col\">\r\n            <div class=\"tbar col\">\r\n                <div class=\"row\">\r\n                    <button id=\"toggleSidebar\" class=\"sizeMedium icon\">☰</button>\r\n                    <button id=\"start\" class=\"sizeMedium danger\" style=\"width: 150px;\" title=\"Start the deletion process\">▶︎ Delete</button>\r\n                    <button id=\"stop\" class=\"sizeMedium\" title=\"Stop the deletion process\" disabled>🛑 Stop</button>\r\n                    <button id=\"clear\" class=\"sizeMedium\">Clear log</button>\r\n                    <label class=\"row\" title=\"Hide sensitive information on your screen for taking screenshots\">\r\n                        <input id=\"redact\" type=\"checkbox\" checked> Streamer mode\r\n                    </label>\r\n                </div>\r\n                <div class=\"row\">\r\n                    <progress id=\"progressBar\" style=\"display:none;\"></progress>\r\n                </div>\r\n            </div>\r\n            <pre id=\"logArea\" class=\"logarea scroll\">\r\n                <div>Development build. Deletion is irreversible and account automation may violate Discord terms. Review your scope before confirming.</div>\r\n                <center>\r\n                    <div><a href=\"{{HOME}}\" target=\"_blank\" rel=\"noopener noreferrer\">CordWipe source and installation guide</a></div>\r\n                    <div><a href=\"{{HOME}}/issues\" target=\"_blank\" rel=\"noopener noreferrer\">Issues or help</a></div>\r\n                </center>\r\n            </pre>\r\n            <div class=\"tbar footer row\">\r\n                <div id=\"progressPercent\"></div>\r\n                <span class=\"spacer\"></span>\r\n                <label>\r\n                    <input id=\"autoScroll\" type=\"checkbox\" checked> Auto scroll\r\n                </label>\r\n                <div class=\"resize-handle\"></div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n";

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
	// DM history and cursor strategy informed by feelmypain/PurgeCord; see docs/investigation.md.

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
	          const preview = matches.slice(0, 5).map(m => `${m.id}: ${(m.content || '[attachment]').slice(0, 180)}`).join('\n');
	          confirmed = await this.ask(`Permanently delete your matching messages in ${target}?\n` +
	            `Text: ${options.content || '(any)'}; pattern: ${options.pattern || '(none)'}\n` +
	            `After: ${options.minId || '(any)'}; before: ${upperBound}\n` +
	            `Links: ${!!options.hasLink}; files: ${!!options.hasFile}; include pinned: ${!!options.includePinned}\n` +
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

	// Selector strategy informed by PurgeCord and Undiscord PR #769.
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
	  catch { /* Unsupported client: explicit manual entry remains available. */ }
	  finally {
	    // Remove only our own entry; another chunk may have been appended meanwhile.
	    const index = chunks.indexOf(chunk);
	    if (index >= 0) chunks.splice(index, 1);
	  }
	  return found;
	}

	const usableToken = value => typeof value === 'string' && value.length > 0 && !value.startsWith('dQw4w9WgXcQ:');

	// Invoked only by an explicit Fill/Delete action, never by initialization.
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
	  log.error('Authorization could not be detected. See the README security section.');
	  return '';
	}

	// Derived from Undiscord, Copyright (c) 2019-2025 Victornpb and contributors.
	// https://github.com/victornpb/undiscord - see LICENSE.


	// -------------------------- User interface ------------------------------- //

	// links
	const HOME = 'https://github.com/avizmarlon/cordwipe';
	const WIKI = HOME + '/blob/codex/cordwipe-first-functional/README.md#usage';

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
	  });
	  ui.cordwipeWindow = createElm(cordwipeUI);
	  document.body.appendChild(ui.cordwipeWindow);

	  // enable drag and resize on cordwipe window
	  new DragResize({ elm: ui.cordwipeWindow, moveHandle: $('.header') });

	  // create cordwipe Trash icon
	  ui.cordwipeBtn = createElm(buttonHtml);
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
	  $('button#getAuthor').onclick = () => $('input#authorId').value = getAuthorId();
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
	  $('button#getToken').onclick = () => $('input#token').value = fillToken();

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
	    $('input#token').value = '';
	    ui.percent.textContent = `${state.status}: ${state.delCount} deleted, ${state.failCount} failed`;
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
	  const authToken = read('token') || fillToken();
	  if (!authToken) return;
	  $('input#token').value = '';
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

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initUI, { once: true });
	else initUI();

})();
