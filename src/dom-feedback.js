/** @preserve
 *
 * DOM Feedback Tool
 *
 * @version 0.1
 * @author Jan Kuca <jan@jankuca.com>, http://jankuca.com
 * @license Creative Commons 3.0 Attribution/Share-alike Licence
 *
 */


(function (global) {
	"use strict";


	/**
	 * @interface
	 */
	function IDOMFeedback() {}
	IDOMFeedback.prototype.init = function () {}


	/**
	 * The feedback tool
	 *
	 * @constructor
	 * @implements IDOMFeedback
	 */
	var DOMFeedback = function () {
	};

	/**
	 * Initializes the tool
	 */
	DOMFeedback.prototype['init'] = function () {
		this._width = document.documentElement.scrollWidth;
		this._height = Math.max(
			window.innerHeight,
			document.documentElement.scrollHeight
		);
	
		this._cuts = [];

		this._takeDOMSnapshot();
		this._buildEditorWindow();
		this._buildMask();
		this._buildCopy();
	};


	DOMFeedback.prototype._takeDOMSnapshot = function () {
		var dir = location.href.replace(/\/[^\/]+$/,'/');
	
		var snapshot = document.documentElement.innerHTML;
		snapshot = snapshot.replace(/\s(type|href)="?(\.\.?|\/)/gi, function (a) {
			var m = a.match(/(\s)(type|href)=("?)(\.\.?|\/)/i);
			return [m[1], m[2], '=', m[3], dir, m[4]].join('');
		});
		snapshot = snapshot.replace(/<script[^>]*?>[\s\S]*<\/script>/gim, '');
		this._snapshot = snapshot;
	};

	DOMFeedback.prototype._buildEditorWindow = function () {
		var editor = document.createElement('div');
		editor.style.position = 'absolute';
		editor.style.top = editor.style.left = '0';
		editor.style.width = this._width + 'px';
		editor.style.height = this._height + 'px';
		document.body.appendChild(editor);
		this._editor = editor;
	};

	DOMFeedback.prototype._buildMask = function () {
		var canvas = document.createElement('canvas');
		canvas.width = this._width;
		canvas.height = this._height;
		this._editor.appendChild(canvas);
		this._mask = canvas;
		this._mask_ctx = canvas.getContext('2d');
		this._restoreMask();
	};

	DOMFeedback.prototype._cutMask = function (x, y, w, h) {
		var ctx = this._mask_ctx;
		ctx.globalCompositeOperation = 'destination-out';
		ctx.fillStyle = '#FFFFFF';
		ctx.fillRect(x, y, w, h);
		this._cuts.push([x, y, w, h]);
	};
	DOMFeedback.prototype._tempCutMask = function (x, y, w, h) {
		var ctx = this._mask_ctx;
		ctx.globalCompositeOperation = 'source-over';
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
		ctx.strokeRect(x, y, w, h);
	};
	DOMFeedback.prototype._restoreMask = function () {
		var ctx = this._mask_ctx;
		ctx.globalCompositeOperation = 'destination-out';
		ctx.fillStyle = '#FFFFFF';
		ctx.fillRect(0, 0, this._width, this._height);
		ctx.globalCompositeOperation = 'source-over';
		ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
		ctx.fillRect(0, 0, this._width, this._height);
		ctx.globalCompositeOperation = 'destination-out';
		ctx.fillStyle = '#FFFFFF';

		this._cuts.forEach(function (cut) {
			ctx.fillRect.apply(ctx, cut);
		}, this);
	};

	DOMFeedback.prototype._buildCopy = function () {
		var snapshot = this._snapshot;
	
		var iframe = document.createElement('iframe');
		iframe.style.display = 'none';
		iframe.style.position = 'absolute';
		iframe.style.top = iframe.style.left = '0';
		iframe.style.width = this._width + 'px';
		iframe.style.height = this._height + 'px';
		iframe.style.border = 'none';
		iframe.style.opacity = '0';
		document.body.appendChild(iframe);
		iframe.src = './dom-feedback-copy.html';
		this._copy = iframe;
		iframe.onload = function () {
			iframe.contentWindow.document.documentElement.innerHTML = snapshot;
			this._addMessageListener();
			this._showEditor();
		}.bind(this);
	};

	DOMFeedback.prototype._addMessageListener = function () {
		window.addEventListener('message', function (e) {
			var data = e.data;
			if (data.tagName !== 'BODY') {
				if (data.type === 'click') {
					this._cutMask(
						data.offsetX - 5,
						data.offsetY - 5,
						data.width + 10,
						data.height + 10,
						true
					);
				} else if (data.type === 'mouseover') {
					this._restoreMask();
					this._tempCutMask(
						data.offsetX - 5,
						data.offsetY - 5,
						data.width + 10,
						data.height + 10
					);
				}
			}
		}.bind(this), false);
	};

	DOMFeedback.prototype._showEditor = function () {
		this._copy.style.display = 'block';
	};


	global['DOMFeedback'] = DOMFeedback;

}(window));
