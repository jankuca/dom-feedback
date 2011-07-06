DOM Feedback
============

DOM Feedback aims to be a little tool similar to the Google Feedback tool (mostly noticed on Google+) you can implement in your own web app.

Currently, it can only select/highlight DOM elements and does not send any actual data to your server.

Usage
-----

    var domFeedback = new DOMFeedback();

    var button = document.createElement('span');
    button.className = 'dom-feedback-button';
    button.innerHTML = 'Feedback';
    button.onclick = function () {
      document.body.removeChild(button);
      domFeedback.init();
    };
    document.body.appendChild(button);

Demo
----

A demo (running `example/`) can be viewed [here](http://jankuca.github.com/dom-feedback).
