/*
* jQuery pager plugin
* Version 1.0 (12/22/2008)
* @requires jQuery v1.2.6 or later
*
* Example at: http://jonpauldavies.github.com/JQuery/Pager/PagerDemo.html
*
* Copyright (c) 2008-2009 Jon Paul Davies
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
* 
* Read the related blog post and contact the author at http://www.j-dee.com/2008/12/22/jquery-pager-plugin/
*
* This version is far from perfect and doesn't manage it's own state, therefore contributions are more than welcome!
*
* Usage: .pager({ pagenumber: 1, pagecount: 15, buttonClickCallback: PagerClickTest });
*
* Where pagenumber is the visible page number
*       pagecount is the total number of pages to display
*       buttonClickCallback is the method to fire when a pager button is clicked.
*
* buttonClickCallback signiture is PagerClickTest = function(pageclickednumber) 
* Where pageclickednumber is the number of the page clicked in the control.
*
* The included Pager.CSS file is a dependancy but can obviously tweaked to your wishes
* Tested in IE6 IE7 Firefox & Safari. Any browser strangeness, please report.
*
* Extended Usage:
*        .pager({
*           pagenumber: 1,                          // current page
*           pagecount: 50,                          // overall pages available
*           show_first_and_last: false,             // turn on or off 'first' and 'last'-buttons
*           number_of_pages: 7,                     // number pages shown at once
*           min_page_digits: 1,                     // 2 will prepend a '0' for page numbers < 10, e. g. '01' intead of '1'
*           buttonClickCallback: PageClickFunction, // the callback function that is called when clicked on a button or page
*           button_label_first: 'First',            // button labels can be set
*           button_label_last: 'Last',
*           button_label_prev: '&lt;&nbsp;Back',
*           button_label_next: 'Next&nbsp;&gt;',
*           page_seperator: '|'
*        });
*
*/
(function($) {

    $.fn.pager = function(options) {

        var opts = $.extend({}, $.fn.pager.defaults, options);

        return this.each(function() {
            // empty out the destination element and then render out the pager with the supplied options
            $(this).empty().append(renderpager(parseInt(opts.pagenumber), parseInt(opts.pagecount), opts.buttonClickCallback, opts.show_first_and_last, parseInt(opts.number_of_pages), parseInt(opts.min_page_digits), opts.button_label_first, opts.button_label_last, opts.button_label_prev, opts.button_label_next, opts.page_seperator));
        });
    };

    // render and return the pager with the supplied options
    function renderpager(pagenumber, pagecount, buttonClickCallback, show_first_and_last, number_of_pages, min_page_digits, button_label_first, button_label_last, button_label_prev, button_label_next, page_seperator) {

        // setup $pager to hold render
        var $pager = $('<ul class="pages"></ul>');

        // add in the previous and next buttons
        if (show_first_and_last) {
            $pager.append(renderButton('first', button_label_first, pagenumber, pagecount, buttonClickCallback));
        }
        $pager.append(renderButton('prev', button_label_prev, pagenumber, pagecount, buttonClickCallback));

        var startPoint = 1;
        var endPoint = number_of_pages;

        var number_of_pages_half = Math.floor(number_of_pages/2);

        if (pagenumber > number_of_pages_half) {
            startPoint = pagenumber - number_of_pages_half;
            endPoint = pagenumber + number_of_pages_half;
        }

        if (endPoint > pagecount) {
            startPoint = pagecount - (number_of_pages - 1);
            endPoint = pagecount;
        }

        if (startPoint < 1) {
            startPoint = 1;
        }

        // loop thru visible pages and render buttons
        for (var page = startPoint; page <= endPoint; page++) {

            if (page < 10 && min_page_digits == 2) {
                var currentButton = $('<li class="page-number">0' + (page) + '</li>');
            } else {
                var currentButton = $('<li class="page-number">' + (page) + '</li>');
            }

            page == pagenumber ? currentButton.addClass('pgCurrent') : currentButton.click(function() { buttonClickCallback(this.firstChild.data); });
            currentButton.appendTo($pager);

            if (page != endPoint && page_seperator) {
                var seperator = $('<li class="pgSeperator">' + page_seperator + '</li>');
                seperator.appendTo($pager);
            }
        }

        // render in the next and last buttons before returning the whole rendered control back.
        $pager.append(renderButton('next', button_label_next, pagenumber, pagecount, buttonClickCallback));
        if (show_first_and_last) {
            $pager.append(renderButton('last', button_label_last, pagenumber, pagecount, buttonClickCallback));
        }

        return $pager;
    }

    // renders and returns a 'specialized' button, ie 'next', 'previous' etc. rather than a page number button
    function renderButton(buttonType, buttonLabel, pagenumber, pagecount, buttonClickCallback) {

        var $Button = $('<li class="pgNext">' + buttonLabel + '</li>');

        if (buttonType == "prev") {
            $Button.addClass("pgPrev");
        }

        var destPage = 1;

        // work out destination page for required button type
        switch (buttonType) {
            case "first":
                destPage = 1;
                break;
            case "prev":
                destPage = pagenumber - 1;
                break;
            case "next":
                destPage = pagenumber + 1;
                break;
            case "last":
                destPage = pagecount;
                break;
        }

        // disable and 'grey' out buttons if not needed.
        if (buttonType == "first" || buttonType == "prev") {
            pagenumber <= 1 ? $Button.addClass('pgEmpty') : $Button.click(function() { buttonClickCallback(destPage); });
        }
        else {
            pagenumber >= pagecount ? $Button.addClass('pgEmpty') : $Button.click(function() { buttonClickCallback(destPage); });
        }

        return $Button;
    }

    // pager defaults.
    $.fn.pager.defaults = {
        pagenumber: 1,
        pagecount: 1,
        show_first_and_last: true,
        number_of_pages: 10,
        min_page_digits: 1,
        button_label_first: 'First',
        button_label_last: 'Last',
        button_label_prev: 'Back',
        button_label_next: 'Next',
        page_seperator: null
    };

})(jQuery);

