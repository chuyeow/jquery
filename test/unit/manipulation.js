module("manipulation");

var bareObj = function(value) { return value; };
var functionReturningObj = function(value) { return (function() { return value; }); };

test("text()", function() {
	expect(1);
	var expected = "This link has class=\"blog\": Simon Willison's Weblog";
	equals( jQuery('#sap').text(), expected, 'Check for merged text of more then one element.' );
});

var testWrap = function(val) {
	expect(15);
	var defaultText = 'Try them out:'
	var result = jQuery('#first').wrap(val( '<div class="red"><span></span></div>' )).text();
	equals( defaultText, result, 'Check for wrapping of on-the-fly html' );
	ok( jQuery('#first').parent().parent().is('.red'), 'Check if wrapper has class "red"' );

	reset();
	var defaultText = 'Try them out:'
	var result = jQuery('#first').wrap(val( document.getElementById('empty') )).parent();
	ok( result.is('ol'), 'Check for element wrapping' );
	equals( result.text(), defaultText, 'Check for element wrapping' );

	reset();
	jQuery('#check1').click(function() {
		var checkbox = this;
		ok( checkbox.checked, "Checkbox's state is erased after wrap() action, see #769" );
		jQuery(checkbox).wrap(val( '<div id="c1" style="display:none;"></div>' ));
		ok( checkbox.checked, "Checkbox's state is erased after wrap() action, see #769" );
	}).click();

	// using contents will get comments regular, text, and comment nodes
	var j = jQuery("#nonnodes").contents();
	j.wrap(val( "<i></i>" ));
	equals( jQuery("#nonnodes > i").length, 3, "Check node,textnode,comment wraps ok" );
	equals( jQuery("#nonnodes > i").text(), j.text() + j[1].nodeValue, "Check node,textnode,comment wraps doesn't hurt text" );

	// Try wrapping a disconnected node
	j = jQuery("<label/>").wrap(val( "<li/>" ));
	equals( j[0].nodeName.toUpperCase(), "LABEL", "Element is a label" );
	equals( j[0].parentNode.nodeName.toUpperCase(), "LI", "Element has been wrapped" );

	// Wrap an element containing a text node
	j = jQuery("<span/>").wrap("<div>test</div>");
	equals( j[0].previousSibling.nodeType, 3, "Make sure the previous node is a text element" );
	equals( j[0].parentNode.nodeName.toUpperCase(), "DIV", "And that we're in the div element." );

	// Try to wrap an element with multiple elements (should fail)
	j = jQuery("<div><span></span></div>").children().wrap("<p></p><div></div>");
	equals( j[0].parentNode.parentNode.childNodes.length, 1, "There should only be one element wrapping." );
	equals( j.length, 1, "There should only be one element (no cloning)." );
	equals( j[0].parentNode.nodeName.toUpperCase(), "P", "The span should be in the paragraph." );
}

test("wrap(String|Element)", function() {
	testWrap(bareObj);
});

test("wrap(Function)", function() {
	testWrap(functionReturningObj);
})

var testWrapAll = function(val) {
	expect(8);
	var prev = jQuery("#firstp")[0].previousSibling;
	var p = jQuery("#firstp,#first")[0].parentNode;

	var result = jQuery('#firstp,#first').wrapAll(val( '<div class="red"><div class="tmp"></div></div>' ));
	equals( result.parent().length, 1, 'Check for wrapping of on-the-fly html' );
	ok( jQuery('#first').parent().parent().is('.red'), 'Check if wrapper has class "red"' );
	ok( jQuery('#firstp').parent().parent().is('.red'), 'Check if wrapper has class "red"' );
	equals( jQuery("#first").parent().parent()[0].previousSibling, prev, "Correct Previous Sibling" );
	equals( jQuery("#first").parent().parent()[0].parentNode, p, "Correct Parent" );

	reset();
	var prev = jQuery("#firstp")[0].previousSibling;
	var p = jQuery("#first")[0].parentNode;
	var result = jQuery('#firstp,#first').wrapAll(val( document.getElementById('empty') ));
	equals( jQuery("#first").parent()[0], jQuery("#firstp").parent()[0], "Same Parent" );
	equals( jQuery("#first").parent()[0].previousSibling, prev, "Correct Previous Sibling" );
	equals( jQuery("#first").parent()[0].parentNode, p, "Correct Parent" );
}

test("wrapAll(String|Element)", function() {
	testWrapAll(bareObj);
});

// TODO: Figure out why each(wrapAll) is not equivalent to wrapAll
// test("wrapAll(Function)", function() {
// 	testWrapAll(functionReturningObj);
// })

var testWrapInner = function(val) {
	expect(6);
	var num = jQuery("#first").children().length;
	var result = jQuery('#first').wrapInner('<div class="red"><div id="tmp"></div></div>');
	equals( jQuery("#first").children().length, 1, "Only one child" );
	ok( jQuery("#first").children().is(".red"), "Verify Right Element" );
	equals( jQuery("#first").children().children().children().length, num, "Verify Elements Intact" );

	reset();
	var num = jQuery("#first").children().length;
	var result = jQuery('#first').wrapInner(document.getElementById('empty'));
	equals( jQuery("#first").children().length, 1, "Only one child" );
	ok( jQuery("#first").children().is("#empty"), "Verify Right Element" );
	equals( jQuery("#first").children().children().length, num, "Verify Elements Intact" );
}

test("wrapInner(String|Element)", function() {
	testWrapInner(bareObj);
});

// TODO: wrapInner uses wrapAll -- get wrapAll working with Function
// test("wrapInner(Function)", function() {
// 	testWrapInner(functionReturningObj)
// })

var testUnwrap = function() {
	expect(9);

	jQuery("body").append('  <div id="unwrap" style="display: none;"> <div id="unwrap1"> <span class="unwrap">a</span> <span class="unwrap">b</span> </div> <div id="unwrap2"> <span class="unwrap">c</span> <span class="unwrap">d</span> </div> <div id="unwrap3"> <b><span class="unwrap unwrap3">e</span></b> <b><span class="unwrap unwrap3">f</span></b> </div> </div>');

	var abcd = jQuery('#unwrap1 > span, #unwrap2 > span').get(),
		abcdef = jQuery('#unwrap span').get();

	equals( jQuery('#unwrap1 span, #unwrap2 span:first').unwrap().length, 3, 'make #unwrap1 and #unwrap2 go away' );
	same( jQuery('#unwrap > span').get(), abcd, 'all four spans should still exist' );

	same( jQuery('#unwrap3 span').unwrap().get(), jQuery('#unwrap3 > span').get(), 'make all b in #unwrap3 go away' );

	same( jQuery('#unwrap3 span').unwrap().get(), jQuery('#unwrap > span.unwrap3').get(), 'make #unwrap3 go away' );

	same( jQuery('#unwrap').children().get(), abcdef, '#unwrap only contains 6 child spans' );

	same( jQuery('#unwrap > span').unwrap().get(), jQuery('body > span.unwrap').get(), 'make the 6 spans become children of body' );

	same( jQuery('body > span.unwrap').unwrap().get(), jQuery('body > span.unwrap').get(), 'can\'t unwrap children of body' );
	same( jQuery('body > span.unwrap').unwrap().get(), abcdef, 'can\'t unwrap children of body' );

	same( jQuery('body > span.unwrap').get(), abcdef, 'body contains 6 .unwrap child spans' );

	jQuery('body > span.unwrap').remove();
}

test("unwrap()", function() {
	testUnwrap();
});

var testAppend = function(valueObj) {
	expect(21);
	var defaultText = 'Try them out:'
	var result = jQuery('#first').append(valueObj('<b>buga</b>'));
	equals( result.text(), defaultText + 'buga', 'Check if text appending works' );
	equals( jQuery('#select3').append(valueObj('<option value="appendTest">Append Test</option>')).find('option:last-child').attr('value'), 'appendTest', 'Appending html options to select element');

	reset();
	var expected = "This link has class=\"blog\": Simon Willison's WeblogTry them out:";
	jQuery('#sap').append(valueObj(document.getElementById('first')));
	equals( expected, jQuery('#sap').text(), "Check for appending of element" );

	reset();
	expected = "This link has class=\"blog\": Simon Willison's WeblogTry them out:Yahoo";
	jQuery('#sap').append(valueObj([document.getElementById('first'), document.getElementById('yahoo')]));
	equals( expected, jQuery('#sap').text(), "Check for appending of array of elements" );

	reset();
	expected = "This link has class=\"blog\": Simon Willison's WeblogYahooTry them out:";
	jQuery('#sap').append(valueObj(jQuery("#first, #yahoo")));
	equals( expected, jQuery('#sap').text(), "Check for appending of jQuery object" );

	reset();
	jQuery("#sap").append(valueObj( 5 ));
	ok( jQuery("#sap")[0].innerHTML.match( /5$/ ), "Check for appending a number" );

	reset();
	jQuery("#sap").append(valueObj( " text with spaces " ));
	ok( jQuery("#sap")[0].innerHTML.match(/ text with spaces $/), "Check for appending text with spaces" );

	reset();
	ok( jQuery("#sap").append(valueObj( [] )), "Check for appending an empty array." );
	ok( jQuery("#sap").append(valueObj( "" )), "Check for appending an empty string." );
	ok( jQuery("#sap").append(valueObj( document.getElementsByTagName("foo") )), "Check for appending an empty nodelist." );

	reset();
	jQuery("#sap").append(valueObj( document.getElementById('form') ));
	equals( jQuery("#sap>form").size(), 1, "Check for appending a form" ); // Bug #910

	reset();
	var pass = true;
	try {
		jQuery( jQuery("#iframe")[0].contentWindow.document.body ).append(valueObj( "<div>test</div>" ));
	} catch(e) {
		pass = false;
	}

	ok( pass, "Test for appending a DOM node to the contents of an IFrame" );

	reset();
	jQuery('<fieldset/>').appendTo('#form').append(valueObj( '<legend id="legend">test</legend>' ));
	t( 'Append legend', '#legend', ['legend'] );

	reset();
	jQuery('#select1').append(valueObj( '<OPTION>Test</OPTION>' ));
	equals( jQuery('#select1 option:last').text(), "Test", "Appending &lt;OPTION&gt; (all caps)" );

	jQuery('#table').append(valueObj( '<colgroup></colgroup>' ));
	ok( jQuery('#table colgroup').length, "Append colgroup" );

	jQuery('#table colgroup').append(valueObj( '<col/>' ));
	ok( jQuery('#table colgroup col').length, "Append col" );

	reset();
	jQuery('#table').append(valueObj( '<caption></caption>' ));
	ok( jQuery('#table caption').length, "Append caption" );

	reset();
	jQuery('form:last')
		.append(valueObj( '<select id="appendSelect1"></select>' ))
		.append(valueObj( '<select id="appendSelect2"><option>Test</option></select>' ));

	t( "Append Select", "#appendSelect1, #appendSelect2", ["appendSelect1", "appendSelect2"] );

	// using contents will get comments regular, text, and comment nodes
	var j = jQuery("#nonnodes").contents();
	var d = jQuery("<div/>").appendTo("#nonnodes").append(j);
	equals( jQuery("#nonnodes").length, 1, "Check node,textnode,comment append moved leaving just the div" );
	ok( d.contents().length >= 2, "Check node,textnode,comment append works" );
	d.contents().appendTo("#nonnodes");
	d.remove();
	ok( jQuery("#nonnodes").contents().length >= 2, "Check node,textnode,comment append cleanup worked" );
}

test("append(String|Element|Array&lt;Element&gt;|jQuery)", function() {
  testAppend(bareObj);
});

test("append(Function)", function() {
	testAppend(functionReturningObj);
})

test("appendTo(String|Element|Array&lt;Element&gt;|jQuery)", function() {
	expect(12);
	var defaultText = 'Try them out:'
	jQuery('<b>buga</b>').appendTo('#first');
	equals( jQuery("#first").text(), defaultText + 'buga', 'Check if text appending works' );
	equals( jQuery('<option value="appendTest">Append Test</option>').appendTo('#select3').parent().find('option:last-child').attr('value'), 'appendTest', 'Appending html options to select element');

	reset();
	var expected = "This link has class=\"blog\": Simon Willison's WeblogTry them out:";
	jQuery(document.getElementById('first')).appendTo('#sap');
	equals( expected, jQuery('#sap').text(), "Check for appending of element" );

	reset();
	expected = "This link has class=\"blog\": Simon Willison's WeblogTry them out:Yahoo";
	jQuery([document.getElementById('first'), document.getElementById('yahoo')]).appendTo('#sap');
	equals( expected, jQuery('#sap').text(), "Check for appending of array of elements" );

	reset();
	ok( jQuery(document.createElement("script")).appendTo("body").length, "Make sure a disconnected script can be appended." );

	reset();
	expected = "This link has class=\"blog\": Simon Willison's WeblogYahooTry them out:";
	jQuery("#first, #yahoo").appendTo('#sap');
	equals( expected, jQuery('#sap').text(), "Check for appending of jQuery object" );

	reset();
	jQuery('#select1').appendTo('#foo');
	t( 'Append select', '#foo select', ['select1'] );

	reset();
	var div = jQuery("<div/>").click(function(){
		ok(true, "Running a cloned click.");
	});
	div.appendTo("#main, #moretests");

	jQuery("#main div:last").click();
	jQuery("#moretests div:last").click();

	reset();
	var div = jQuery("<div/>").appendTo("#main, #moretests");

	equals( div.length, 2, "appendTo returns the inserted elements" );

	div.addClass("test");

	ok( jQuery("#main div:last").hasClass("test"), "appendTo element was modified after the insertion" );
	ok( jQuery("#moretests div:last").hasClass("test"), "appendTo element was modified after the insertion" );

	reset();
});

var testPrepend = function(val) {
	expect(5);
	var defaultText = 'Try them out:'
	var result = jQuery('#first').prepend(val( '<b>buga</b>' ));
	equals( result.text(), 'buga' + defaultText, 'Check if text prepending works' );
	equals( jQuery('#select3').prepend(val( '<option value="prependTest">Prepend Test</option>' )).find('option:first-child').attr('value'), 'prependTest', 'Prepending html options to select element');

	reset();
	var expected = "Try them out:This link has class=\"blog\": Simon Willison's Weblog";
	jQuery('#sap').prepend(val( document.getElementById('first') ));
	equals( expected, jQuery('#sap').text(), "Check for prepending of element" );

	reset();
	expected = "Try them out:YahooThis link has class=\"blog\": Simon Willison's Weblog";
	jQuery('#sap').prepend(val( [document.getElementById('first'), document.getElementById('yahoo')] ));
	equals( expected, jQuery('#sap').text(), "Check for prepending of array of elements" );

	reset();
	expected = "YahooTry them out:This link has class=\"blog\": Simon Willison's Weblog";
	jQuery('#sap').prepend(val( jQuery("#first, #yahoo") ));
	equals( expected, jQuery('#sap').text(), "Check for prepending of jQuery object" );
}

test("prepend(String|Element|Array&lt;Element&gt;|jQuery)", function() {
	testPrepend(bareObj);
});

test("prepend(Function)", function() {
	testPrepend(functionReturningObj);
})

test("prependTo(String|Element|Array&lt;Element&gt;|jQuery)", function() {
	expect(6);
	var defaultText = 'Try them out:'
	jQuery('<b>buga</b>').prependTo('#first');
	equals( jQuery('#first').text(), 'buga' + defaultText, 'Check if text prepending works' );
	equals( jQuery('<option value="prependTest">Prepend Test</option>').prependTo('#select3').parent().find('option:first-child').attr('value'), 'prependTest', 'Prepending html options to select element');

	reset();
	var expected = "Try them out:This link has class=\"blog\": Simon Willison's Weblog";
	jQuery(document.getElementById('first')).prependTo('#sap');
	equals( expected, jQuery('#sap').text(), "Check for prepending of element" );

	reset();
	expected = "Try them out:YahooThis link has class=\"blog\": Simon Willison's Weblog";
	jQuery([document.getElementById('first'), document.getElementById('yahoo')]).prependTo('#sap');
	equals( expected, jQuery('#sap').text(), "Check for prepending of array of elements" );

	reset();
	expected = "YahooTry them out:This link has class=\"blog\": Simon Willison's Weblog";
	jQuery("#first, #yahoo").prependTo('#sap');
	equals( expected, jQuery('#sap').text(), "Check for prepending of jQuery object" );

	reset();
	jQuery('<select id="prependSelect1"></select>').prependTo('form:last');
	jQuery('<select id="prependSelect2"><option>Test</option></select>').prependTo('form:last');

	t( "Prepend Select", "#prependSelect2, #prependSelect1", ["prependSelect2", "prependSelect1"] );
});

var testBefore = function(val) {
	expect(6);
	var expected = 'This is a normal link: bugaYahoo';
	jQuery('#yahoo').before(val( '<b>buga</b>' ));
	equals( expected, jQuery('#en').text(), 'Insert String before' );

	reset();
	expected = "This is a normal link: Try them out:Yahoo";
	jQuery('#yahoo').before(val( document.getElementById('first') ));
	equals( expected, jQuery('#en').text(), "Insert element before" );

	reset();
	expected = "This is a normal link: Try them out:diveintomarkYahoo";
	jQuery('#yahoo').before(val( [document.getElementById('first'), document.getElementById('mark')] ));
	equals( expected, jQuery('#en').text(), "Insert array of elements before" );

	reset();
	expected = "This is a normal link: diveintomarkTry them out:Yahoo";
	jQuery('#yahoo').before(val( jQuery("#first, #mark") ));
	equals( expected, jQuery('#en').text(), "Insert jQuery before" );

	var set = jQuery("<div/>").before("<span>test</span>");
	equals( set[0].nodeName.toLowerCase(), "span", "Insert the element before the disconnected node." );
	equals( set.length, 2, "Insert the element before the disconnected node." );
}

test("before(String|Element|Array&lt;Element&gt;|jQuery)", function() {
	testBefore(bareObj);
});

test("before(Function)", function() {
	testBefore(functionReturningObj);
})

test("insertBefore(String|Element|Array&lt;Element&gt;|jQuery)", function() {
	expect(4);
	var expected = 'This is a normal link: bugaYahoo';
	jQuery('<b>buga</b>').insertBefore('#yahoo');
	equals( expected, jQuery('#en').text(), 'Insert String before' );

	reset();
	expected = "This is a normal link: Try them out:Yahoo";
	jQuery(document.getElementById('first')).insertBefore('#yahoo');
	equals( expected, jQuery('#en').text(), "Insert element before" );

	reset();
	expected = "This is a normal link: Try them out:diveintomarkYahoo";
	jQuery([document.getElementById('first'), document.getElementById('mark')]).insertBefore('#yahoo');
	equals( expected, jQuery('#en').text(), "Insert array of elements before" );

	reset();
	expected = "This is a normal link: diveintomarkTry them out:Yahoo";
	jQuery("#first, #mark").insertBefore('#yahoo');
	equals( expected, jQuery('#en').text(), "Insert jQuery before" );
});

var testAfter = function(val) {
	expect(6);
	var expected = 'This is a normal link: Yahoobuga';
	jQuery('#yahoo').after(val( '<b>buga</b>' ));
	equals( expected, jQuery('#en').text(), 'Insert String after' );

	reset();
	expected = "This is a normal link: YahooTry them out:";
	jQuery('#yahoo').after(val( document.getElementById('first') ));
	equals( expected, jQuery('#en').text(), "Insert element after" );

	reset();
	expected = "This is a normal link: YahooTry them out:diveintomark";
	jQuery('#yahoo').after(val( [document.getElementById('first'), document.getElementById('mark')] ));
	equals( expected, jQuery('#en').text(), "Insert array of elements after" );

	reset();
	expected = "This is a normal link: YahoodiveintomarkTry them out:";
	jQuery('#yahoo').after(val( jQuery("#first, #mark") ));
	equals( expected, jQuery('#en').text(), "Insert jQuery after" );

	var set = jQuery("<div/>").after("<span>test</span>");
	equals( set[1].nodeName.toLowerCase(), "span", "Insert the element after the disconnected node." );
	equals( set.length, 2, "Insert the element after the disconnected node." );
};

test("after(String|Element|Array&lt;Element&gt;|jQuery)", function() {
	testAfter(bareObj);
});

test("after(Function)", function() {
	testAfter(functionReturningObj);
})

test("insertAfter(String|Element|Array&lt;Element&gt;|jQuery)", function() {
	expect(4);
	var expected = 'This is a normal link: Yahoobuga';
	jQuery('<b>buga</b>').insertAfter('#yahoo');
	equals( expected, jQuery('#en').text(), 'Insert String after' );

	reset();
	expected = "This is a normal link: YahooTry them out:";
	jQuery(document.getElementById('first')).insertAfter('#yahoo');
	equals( expected, jQuery('#en').text(), "Insert element after" );

	reset();
	expected = "This is a normal link: YahooTry them out:diveintomark";
	jQuery([document.getElementById('first'), document.getElementById('mark')]).insertAfter('#yahoo');
	equals( expected, jQuery('#en').text(), "Insert array of elements after" );

	reset();
	expected = "This is a normal link: YahoodiveintomarkTry them out:";
	jQuery("#first, #mark").insertAfter('#yahoo');
	equals( expected, jQuery('#en').text(), "Insert jQuery after" );
});

var testReplaceWith = function(val) {
	expect(12);
	jQuery('#yahoo').replaceWith(val( '<b id="replace">buga</b>' ));
	ok( jQuery("#replace")[0], 'Replace element with string' );
	ok( !jQuery("#yahoo")[0], 'Verify that original element is gone, after string' );

	reset();
	jQuery('#yahoo').replaceWith(val( document.getElementById('first') ));
	ok( jQuery("#first")[0], 'Replace element with element' );
	ok( !jQuery("#yahoo")[0], 'Verify that original element is gone, after element' );

	reset();
	jQuery('#yahoo').replaceWith(val( [document.getElementById('first'), document.getElementById('mark')] ));
	ok( jQuery("#first")[0], 'Replace element with array of elements' );
	ok( jQuery("#mark")[0], 'Replace element with array of elements' );
	ok( !jQuery("#yahoo")[0], 'Verify that original element is gone, after array of elements' );

	reset();
	jQuery('#yahoo').replaceWith(val( jQuery("#first, #mark") ));
	ok( jQuery("#first")[0], 'Replace element with set of elements' );
	ok( jQuery("#mark")[0], 'Replace element with set of elements' );
	ok( !jQuery("#yahoo")[0], 'Verify that original element is gone, after set of elements' );

	var set = jQuery("<div/>").replaceWith(val("<span>test</span>"));
	equals( set[0].nodeName.toLowerCase(), "span", "Replace the disconnected node." );
	equals( set.length, 1, "Replace the disconnected node." );
}

test("replaceWith(String|Element|Array&lt;Element&gt;|jQuery)", function() {
	testReplaceWith(bareObj);
});

test("replaceWith(Function)", function() {
	testReplaceWith(functionReturningObj);
})

test("replaceAll(String|Element|Array&lt;Element&gt;|jQuery)", function() {
	expect(10);
	jQuery('<b id="replace">buga</b>').replaceAll("#yahoo");
	ok( jQuery("#replace")[0], 'Replace element with string' );
	ok( !jQuery("#yahoo")[0], 'Verify that original element is gone, after string' );

	reset();
	jQuery(document.getElementById('first')).replaceAll("#yahoo");
	ok( jQuery("#first")[0], 'Replace element with element' );
	ok( !jQuery("#yahoo")[0], 'Verify that original element is gone, after element' );

	reset();
	jQuery([document.getElementById('first'), document.getElementById('mark')]).replaceAll("#yahoo");
	ok( jQuery("#first")[0], 'Replace element with array of elements' );
	ok( jQuery("#mark")[0], 'Replace element with array of elements' );
	ok( !jQuery("#yahoo")[0], 'Verify that original element is gone, after array of elements' );

	reset();
	jQuery("#first, #mark").replaceAll("#yahoo");
	ok( jQuery("#first")[0], 'Replace element with set of elements' );
	ok( jQuery("#mark")[0], 'Replace element with set of elements' );
	ok( !jQuery("#yahoo")[0], 'Verify that original element is gone, after set of elements' );
});

test("clone()", function() {
	expect(28);
	equals( 'This is a normal link: Yahoo', jQuery('#en').text(), 'Assert text for #en' );
	var clone = jQuery('#yahoo').clone();
	equals( 'Try them out:Yahoo', jQuery('#first').append(clone).text(), 'Check for clone' );
	equals( 'This is a normal link: Yahoo', jQuery('#en').text(), 'Reassert text for #en' );

	var cloneTags = [
		"<table/>", "<tr/>", "<td/>", "<div/>",
		"<button/>", "<ul/>", "<ol/>", "<li/>",
		"<input type='checkbox' />", "<select/>", "<option/>", "<textarea/>",
		"<tbody/>", "<thead/>", "<tfoot/>", "<iframe/>"
	];
	for (var i = 0; i < cloneTags.length; i++) {
		var j = jQuery(cloneTags[i]);
		equals( j[0].tagName, j.clone()[0].tagName, 'Clone a &lt;' + cloneTags[i].substring(1));
	}

	// using contents will get comments regular, text, and comment nodes
	var cl = jQuery("#nonnodes").contents().clone();
	ok( cl.length >= 2, "Check node,textnode,comment clone works (some browsers delete comments on clone)" );

	var div = jQuery("<div><ul><li>test</li></ul></div>").click(function(){
		ok( true, "Bound event still exists." );
	});

	div = div.clone(true).clone(true);
	equals( div.length, 1, "One element cloned" );
	equals( div[0].nodeName.toUpperCase(), "DIV", "DIV element cloned" );
	div.trigger("click");

	div = jQuery("<div/>").append([ document.createElement("table"), document.createElement("table") ]);
	div.find("table").click(function(){
		ok( true, "Bound event still exists." );
	});

	div = div.clone(true);
	equals( div.length, 1, "One element cloned" );
	equals( div[0].nodeName.toUpperCase(), "DIV", "DIV element cloned" );
	div.find("table:last").trigger("click");

	div = jQuery("<div/>").html('<object height="355" width="425">  <param name="movie" value="http://www.youtube.com/v/JikaHBDoV3k&amp;hl=en">  <param name="wmode" value="transparent"> </object>');

	div = div.clone(true);
	equals( div.length, 1, "One element cloned" );
	equals( div[0].nodeName.toUpperCase(), "DIV", "DIV element cloned" );
});

if (!isLocal) {
test("clone() on XML nodes", function() {
	expect(2);
	stop();
	jQuery.get("data/dashboard.xml", function (xml) {
		var root = jQuery(xml.documentElement).clone();
		var origTab = jQuery("tab", xml).eq(0);
		var cloneTab = jQuery("tab", root).eq(0);
		origTab.text("origval");
		cloneTab.text("cloneval");
		equals(origTab.text(), "origval", "Check original XML node was correctly set");
		equals(cloneTab.text(), "cloneval", "Check cloned XML node was correctly set");
		start();
	});
});
}

test("val()", function() {
	expect(9);

	document.getElementById('text1').value = "bla";
	equals( jQuery("#text1").val(), "bla", "Check for modified value of input element" );

	reset();

	equals( jQuery("#text1").val(), "Test", "Check for value of input element" );
	// ticket #1714 this caused a JS error in IE
	equals( jQuery("#first").val(), "", "Check a paragraph element to see if it has a value" );
	ok( jQuery([]).val() === undefined, "Check an empty jQuery object will return undefined from val" );

	equals( jQuery('#select2').val(), '3', 'Call val() on a single="single" select' );

	same( jQuery('#select3').val(), ['1', '2'], 'Call val() on a multiple="multiple" select' );

	equals( jQuery('#option3c').val(), '2', 'Call val() on a option element with value' );

	equals( jQuery('#option3a').val(), '', 'Call val() on a option element with empty value' );

	equals( jQuery('#option3e').val(), 'no value', 'Call val() on a option element with no value attribute' );

});

var testVal = function(valueObj) {
	expect(5);

	jQuery("#text1").val(valueObj( 'test' ));
	equals( document.getElementById('text1').value, "test", "Check for modified (via val(String)) value of input element" );

	jQuery("#text1").val(valueObj( 67 ));
	equals( document.getElementById('text1').value, "67", "Check for modified (via val(Number)) value of input element" );

	jQuery("#select1").val(valueObj( "3" ));
	equals( jQuery("#select1").val(), "3", "Check for modified (via val(String)) value of select element" );

	jQuery("#select1").val(valueObj( 2 ));
	equals( jQuery("#select1").val(), "2", "Check for modified (via val(Number)) value of select element" );

	// using contents will get comments regular, text, and comment nodes
	var j = jQuery("#nonnodes").contents();
	j.val(valueObj( "asdf" ));
	equals( j.val(), "asdf", "Check node,textnode,comment with val()" );
	j.removeAttr("value");
}

test("val(String/Number)", function() {
	testVal(bareObj);
});

test("val(Function)", function() {
	testVal(functionReturningObj);
})

var testHtml = function(valueObj) {
	expect(17);

	window.debug = true;

	jQuery.scriptorder = 0;

	var div = jQuery("#main > div");
	div.html(valueObj("<b>test</b>"));
	var pass = true;
	for ( var i = 0; i < div.size(); i++ ) {
		if ( div.get(i).childNodes.length != 1 ) pass = false;
	}
	ok( pass, "Set HTML" );

	delete window.debug;

	reset();
	// using contents will get comments regular, text, and comment nodes
	var j = jQuery("#nonnodes").contents();
	j.html(valueObj("<b>bold</b>"));

	// this is needed, or the expando added by jQuery unique will yield a different html
	j.find('b').removeData();
	equals( j.html().replace(/ xmlns="[^"]+"/g, "").toLowerCase(), "<b>bold</b>", "Check node,textnode,comment with html()" );

	jQuery("#main").html(valueObj("<select/>"));
	jQuery("#main select").html(valueObj("<option>O1</option><option selected='selected'>O2</option><option>O3</option>"));
	equals( jQuery("#main select").val(), "O2", "Selected option correct" );

	var $div = jQuery('<div />');
	equals( $div.html(valueObj( 5 )).html(), '5', 'Setting a number as html' );
	equals( $div.html(valueObj( 0 )).html(), '0', 'Setting a zero as html' );

	reset();

	jQuery("#main").html(valueObj('<script type="something/else">ok( false, "Non-script evaluated." );</script><script type="text/javascript">ok( true, "text/javascript is evaluated." );</script><script>ok( true, "No type is evaluated." );</script><div><script type="text/javascript">ok( true, "Inner text/javascript is evaluated." );</script><script>ok( true, "Inner No type is evaluated." );</script><script type="something/else">ok( false, "Non-script evaluated." );</script></div>'));

	stop();

	jQuery("#main").html(valueObj('<script type="text/javascript">ok( true, "jQuery().html().evalScripts() Evals Scripts Twice in Firefox, see #975 (1)" );</script>'));

	jQuery("#main").html(valueObj('foo <form><script type="text/javascript">ok( true, "jQuery().html().evalScripts() Evals Scripts Twice in Firefox, see #975 (2)" );</script></form>'));

	// it was decided that waiting to execute ALL scripts makes sense since nested ones have to wait anyway so this test case is changed, see #1959
	jQuery("#main").html(valueObj("<script>equals(jQuery.scriptorder++, 0, 'Script is executed in order');equals(jQuery('#scriptorder').length, 1,'Execute after html (even though appears before)')<\/script><span id='scriptorder'><script>equals(jQuery.scriptorder++, 1, 'Script (nested) is executed in order');equals(jQuery('#scriptorder').length, 1,'Execute after html')<\/script></span><script>equals(jQuery.scriptorder++, 2, 'Script (unnested) is executed in order');equals(jQuery('#scriptorder').length, 1,'Execute after html')<\/script>"));

	setTimeout( start, 100 );
}

test("html(String)", function() {
	testHtml(bareObj);
});

test("html(Function)", function() {
	testHtml(functionReturningObj);
})

var testText = function(valueObj) {
	expect(4);
	equals( jQuery("#foo").text("<div><b>Hello</b> cruel world!</div>")[0].innerHTML.replace(/>/g, "&gt;"), "&lt;div&gt;&lt;b&gt;Hello&lt;/b&gt; cruel world!&lt;/div&gt;", "Check escaped text" );

	// using contents will get comments regular, text, and comment nodes
	var j = jQuery("#nonnodes").contents();
	j.text("hi!");
	equals( jQuery(j[0]).text(), "hi!", "Check node,textnode,comment with text()" );
	equals( j[1].nodeValue, " there ", "Check node,textnode,comment with text()" );
	equals( j[2].nodeType, 8, "Check node,textnode,comment with text()" );
}

test("text(String)", function() {
	testText(bareObj)
});

test("text(Function)", function() {
	testText(functionReturningObj);
})

var testRemove = function(method) {
	expect(9);

	var first = jQuery("#ap").children(":first");
	first.data("foo", "bar");

	jQuery("#ap").children()[method]();
	ok( jQuery("#ap").text().length > 10, "Check text is not removed" );
	equals( jQuery("#ap").children().length, 0, "Check remove" );

	equals( first.data("foo"), method == "remove" ? null : "bar" );

	reset();
	jQuery("#ap").children()[method]("a");
	ok( jQuery("#ap").text().length > 10, "Check text is not removed" );
	equals( jQuery("#ap").children().length, 1, "Check filtered remove" );

	jQuery("#ap").children()[method]("a, code");
	equals( jQuery("#ap").children().length, 0, "Check multi-filtered remove" );

	// using contents will get comments regular, text, and comment nodes
	equals( jQuery("#nonnodes").contents().length, 3, "Check node,textnode,comment remove works" );
	jQuery("#nonnodes").contents()[method]();
	equals( jQuery("#nonnodes").contents().length, 0, "Check node,textnode,comment remove works" );

	reset();

	var count = 0;
	var first = jQuery("#ap").children(":first");
	var cleanUp = first.click(function() { count++ })[method]().appendTo("body").click();
	
	equals( method == "remove" ? 0 : 1, count );
	
	cleanUp.detach();
};

test("remove()", function() {
	testRemove("remove");
});

test("detach()", function() {
	testRemove("detach");
});

test("empty()", function() {
	expect(3);
	equals( jQuery("#ap").children().empty().text().length, 0, "Check text is removed" );
	equals( jQuery("#ap").children().length, 4, "Check elements are not removed" );

	// using contents will get comments regular, text, and comment nodes
	var j = jQuery("#nonnodes").contents();
	j.empty();
	equals( j.html(), "", "Check node,textnode,comment empty works" );
});

