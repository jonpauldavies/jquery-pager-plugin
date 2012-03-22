/*
* jQuery pager plugin
* Version 2.0 (03/21/2012)
* @requires jQuery v1.2.6 or later
*
* Copyright (c) 2008-2009 Jon Paul Davies
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
* 
* Read the related blog post and contact the author at http://www.j-dee.com/2008/12/22/jquery-pager-plugin/
*
* This version is far from perfect, therefore contributions are more than welcome!
*
* Usage: .pager({ pagenumber: 1, pagecount: 15, buttonClickCallback: PagerClickTest });
*
* Where pagenumber is the visible page number
*       pagecount is the total number of pages to display
*       buttonClickCallback is the method to fire when a pager button is clicked.
*
* buttonClickCallback signiture is PagerClickTest = function(pageclickednumber, previousPage) 
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
*           page_separator: '|'
*        });
*
* The following public methods are also available:
*    setCurrentPage - takes one argument, the page to go to.
*    currentPage    - takes no arguments, returns the current page.
*
* Example:
*      $('#yourpager').pager({ pagecount: 10 });   // Initialize it
*      $('#yourpager').pager('setCurrentPage', 3); // go to page 3.
*      $('#yourpager').pager('currentPage);        // returns 3
*/

function JqueryPager(target, options) {
    this.target = target;

    this.current_start_page = 0;
    this.current_end_page   = 0;

    this.current_page = parseInt(options.pagenumber);
    options.pagenumber=undefined; // Just a reminder to no longer use this.

    options.number_of_pages = parseInt(options.number_of_pages);
    options.pagecount = parseInt(options.pagecount);
    options.min_page_digits = parseInt(options.min_page_digits);

    // Backwards compatibility for a typo.
    if (typeof options.page_seperator != "undefined") {
        options.page_separator = options.page_seperator;
        options.page_seperator = undefined;
    }

    this.opt = options;

    var _init = function($this) {
        return $this.target.each(function() {
            // empty out the destination element and then render out the pager with the supplied options
            $(this).empty().append( _render_pager($this) );
            $(this).append( $('<div style="clear:both"></div>') );
        });
    };

    var _set_current_page = function($this, pageNum) {
        var prevCurrentPage = $this.current_page;

        $this.current_page = parseInt(pageNum);

        $(".pgCurrent", $this.target).removeClass('pgCurrent');
        $("li[rel='" + $this.current_page +"']", $this.target).addClass('pgCurrent');

        // Does the new page require us to shift our numbered page
        // buttons, and re-render them?
        var endpoints = _calculate_endpoints($this);
        if (endpoints[0] != $this.current_start_page
            || endpoints[1] != $this.current_end_page)
        {
            // wipe out the old ones
            $("li.page-number", $this.target).remove();
            $("li.pgSeparator", $this.target).remove();
            // and re-render them.
            var pageButtons = _render_number_buttons($this);
            for (var i = pageButtons.length - 1; i >= 0; i--) {
                $(".pgPrev").after(pageButtons[i]);
            }

            $this.current_start_page = endpoints[0];
            $this.current_end_page   = endpoints[1];
        }

        // Enable or disable the prev/first/next/last buttons
        if (prevCurrentPage == 1 && $this.current_page != 1) {
            $(".pgPrev").removeClass("pgEmpty");
            $(".pgFirst").removeClass("pgEmpty");
        }
        if (prevCurrentPage == $this.opt.pagecount
            && $this.current_page != $this.opt.pagecount)
        {
            $(".pgNext").removeClass("pgEmpty");
            $(".pgLast").removeClass("pgEmpty");
        }
        if ($this.current_page == $this.opt.pagecount) {
            $(".pgNext").addClass("pgEmpty");
            $(".pgLast").addClass("pgEmpty");
        }
        if ($this.current_page == 1) {
            $(".pgPrev").addClass("pgEmpty");
            $(".pgFirst").addClass("pgEmpty");
        }
    };

    // Returns [ startPoint, endPoint ] indicating what the range
    // of the page numbers should be, for the given $this.current_page.
    var _calculate_endpoints = function($this) {
        var startPoint = 1;
        var endPoint = $this.opt.number_of_pages;

        var number_of_pages_half = Math.floor($this.opt.number_of_pages / 2);

        if ($this.current_page > number_of_pages_half) {
            startPoint = $this.current_page - number_of_pages_half;
            endPoint = $this.current_page + number_of_pages_half;
        }

        if (endPoint > $this.opt.pagecount) {
            startPoint = $this.opt.pagecount - ($this.opt.number_of_pages - 1);
            endPoint = $this.opt.pagecount;
        }

        if (startPoint < 1) {
            startPoint = 1;
        }

        // For even numbers of pages
        if ((endPoint - startPoint + 1) > $this.opt.number_of_pages) {
            startPoint++;
        }

        return [ startPoint, endPoint ];
    };

    var _do_button_callback = function($this, button) {
        if (button.hasClass('pgCurrent') || button.hasClass('pgEmpty')) {
            return false;
        }

        var pageNum;
        if (button.hasClass('pgFirst')) {
            pageNum = 1;
        } else if (button.hasClass('pgPrev')) {
            pageNum = $this.current_page - 1;
            if (pageNum < 1) {
                pageNum = 1;
            }
        } else if (button.hasClass('pgNext')) {
            pageNum = $this.current_page + 1;
            if (pageNum > $this.opt.pagecount) {
                pageNum = $this.opt.pagecount;
            }
        } else if (button.hasClass('pgLast')) {
            pageNum = $this.opt.pagecount;
        } else {
            pageNum = button.attr('rel');
        }

        var prevPageNum = $this.current_page;
        _set_current_page($this, pageNum);

        if (typeof $this.opt.buttonClickCallback == "function") {
            return $this.opt.buttonClickCallback(pageNum, prevPageNum);
        }

        return false;
    };

    // render and return the pager with the supplied options
    var _render_pager = function($this) {

        // setup $pager to hold render
        var $pager = $('<ul class="pages"></ul>');

        // render the first and previous buttons
        if ($this.opt.show_first_and_last) {
            $pager.append( _render_button($this, 'first') );
        }
        $pager.append( _render_button($this, 'prev') );

        // Render numbered buttons and add them to the pager.
        var pageButtons = _render_number_buttons($this);
        for (var i = 0; i < pageButtons.length; i++) {
            pageButtons[i].appendTo($pager);
        }

        // render the next and last buttons
        $pager.append( _render_button($this, 'next') );
        if ($this.opt.show_first_and_last) {
            $pager.append( _render_button($this, 'last') );
        }

        return $pager;
    };

    // Returns array of rendered button objs and separators
    var _render_number_buttons = function($this) {
        var rv = new Array();
        var endpoints = _calculate_endpoints($this);
        $this.current_start_page = endpoints[0];
        $this.current_end_page   = endpoints[1];

        // loop thru visible pages and render buttons
        for (var page = $this.current_start_page; page <= $this.current_end_page; page++) {

            var pageDisplay = zeroPad(page, $this.opt.min_page_digits);
            var currentButton = $('<li class="page-number" rel="' + page + '">' + pageDisplay + '</li>');

            if (page == $this.current_page) {
                currentButton.addClass('pgCurrent');
            }

            currentButton.click(function() { _do_button_callback($this, $(this)); });

            rv.push(currentButton);

            if (page != $this.current_end_page && $this.opt.page_separator) {
                var separator = $('<li class="pgSeparator">' + $this.opt.page_separator + '</li>');
                rv.push(separator);
            }
        }

        return rv;
    };

    // renders and returns a 'specialized' button, ie 'next', 'previous' etc.
    // rather than a page number button
    var _render_button = function($this, buttonType) {
        var buttonLabel = '';

        switch (buttonType) {
            case "first":
                buttonLabel = $this.opt.button_label_first;
                break;
            case "prev":
                buttonLabel = $this.opt.button_label_prev;
                break;
            case "next":
                buttonLabel = $this.opt.button_label_next;
                break;
            case "last":
                buttonLabel = $this.opt.button_label_last;
                break;
        }

        var className = 'pg' + buttonType.charAt(0).toUpperCase() + buttonType.slice(1);// e.g. pgFirst, pgPrev, pgNext, pgLast
        var $button = $('<li class="' + className + '">' + buttonLabel + '</li>');

        // disable and 'grey' out buttons if not needed.
        if (buttonType == "first" || buttonType == "prev") {
            if ($this.current_page <= 1) {
                $button.addClass('pgEmpty');
            }
        } else if (buttonType == "last" || buttonType == "next") {
            if ($this.current_page >= $this.opt.pagecount) {
                $button.addClass('pgEmpty');
            }
        }

        $button.click(function() { _do_button_callback($this, $button); });

        return $button;
    };

    function zeroPad(num,count) {
        var numZeropad = num + '';
        while(numZeropad.length < count) {
            numZeropad = "0" + numZeropad;
        }
        return numZeropad;
    }

    /* Public methods */

    JqueryPager.prototype.currentPage = function() {
        return this.current_page;
    };
    JqueryPager.prototype.setCurrentPage = function(pageNum) {
        _set_current_page(this, pageNum);
    };

    _init(this);
}

(function($) {
    $.fn.pager = function(method) {
        var args = arguments;
        var rv = undefined;
        var all = this.each(function() {
            var obj = $(this).data('pager');
            if (typeof method == 'object' || ! method || ! obj) {
                // TODO: why was it like this, rather than just
                //       a simple if(!obj) {...}
                var options = $.extend({}, $.fn.pager.defaults, method || {});
                if (! obj) {
                    obj = new JqueryPager($(this), options);
                    $(this).data('pager', obj);
                }
            } else {
                if (typeof JqueryPager.prototype[method] == "function") {
                    rv = JqueryPager.prototype[method].apply(obj, Array.prototype.slice.call(args, 1));
                    return rv;
                } else {
                    $.error('Method ' +  method + ' does not exist in pager plugin');
                }
            }
        });
        if (rv == undefined) {
            return all;
        } else {
            return rv;
        }
    };

    // pager defaults.
    $.fn.pager.defaults = {
        buttonClickCallback : function() {},
        pagenumber: 1,
        pagecount: 1,
        show_first_and_last: true,
        number_of_pages: 10,
        min_page_digits: 1,
        button_label_first: 'First',
        button_label_last: 'Last',
        button_label_prev: 'Back',
        button_label_next: 'Next',
        page_separator: null
    };

})(jQuery);

