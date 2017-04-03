(function(jQuery, undefined){

    jQuery(function() {
        if (!window.prettyPrint) {
            return;
        }

        jQuery('.showcase').each(function(){

            var jQuerythis = jQuery(that || this),
                text, nodeName, lang, that;

            if (jQuerythis.data('showcaseImport')) {
                jQuerythis = jQuery(jQuerythis.data('showcaseImport'));
                that = jQuerythis.get(0);
            }

            nodeName = (that || this).nodeName.toLowerCase();
            lang = nodeName == 'script'
                ? 'js'
                : (nodeName == 'style' ? 'css' : 'html');

            if (lang == 'html') {
                text = jQuery('<div></div>').append(jQuerythis.clone()).html();
            } else {
                text = jQuerythis.text();
            }

            jQuery('<pre class="prettyprint lang-'+ lang +'"></pre>')
                .text(text)
                .insertBefore(this);

            that && jQuery(this).remove();
        });

        prettyPrint();
    });

})(jQuery);
