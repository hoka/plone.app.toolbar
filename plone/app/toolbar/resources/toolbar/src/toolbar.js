$(document).ready(function() {
    // Stretch iframe to height of parent doc
    function stretch(){
        var parent_doc = window.parent.document;
        $('#plone-toolbar', parent_doc).height(
            $(parent_doc).height());
    }

    // Shrink iframe back to css determined size.
    function shrink(){
        $('#plone-toolbar', window.parent.document).css({'height': ''});
    }

    // Shrink the iframe back down after closing a menu
    $(document).mousedown(function (event) {
        if (jQuery(event.target).parents('.actionMenu:first').length) {
            // target is part of the menu, so just return and do the default
            return true;
        }
        if ($('#toolbar-overlay').hasClass('in')){
            // Overlay is visible, don't shrink
            return true;
        }
        shrink();
    });

    // we stretch iframe over whole top frame which should
    // be marked as transparent so user wont see it
    $('dl.actionMenu dt.actionMenuHeader a').click(function (event) {
        stretch();
    });

    // # overlay {{{
    function overlay(e) {
        var el = $(e.target),
            href = el.closest('a').attr('href'),
            modal = $('#toolbar-overlay'),
            body = $('.modal-body', modal);

        if(href === undefined){
            return;
        }

        // Clean up the url, set toolbar skin
        href = (href.match(/^([^#]+)/)||[])[1];

        body.empty().load(href + ' #portal-column-content',
            function(response, error){
                function setupOverlay(){
                    // Keep all links inside the overlay
                    $('a', body).on('click', overlay);

                    $(document).trigger('setupOverlay',
                        [modal, response, error]);

                    // Init plone forms if they exist
                    if ($.fn.ploneTabInit) {
                        body.ploneTabInit();
                    }

                    // Tinymce editable areas inside overlay
                    $('textarea.mce_editable', body).each(function() {
                        var config = new TinyMCEConfig($(this).attr('id'));
                        config.init();
                    });

                }
                setupOverlay();
                stretch();
                // Shring iframe when the overlay is closed
                modal.on('hidden', function(e){ shrink(); });
                modal.modal('show');
            }
        );
        e.preventDefault();
    }
    // }}}

    // capture all clicks on iframe
    $(document).on('click', {
        self: self, document: document
    }, function(e) {
        if (e.which === 1) {
            var self = e.data.self,
                el = $(e.target);

            if (!$.nodeName(e.target, 'a')) {
                el = el.closest('a');
            }

            // Buttons default to an overlay but if they
            // have the '_parent' link target, just load them in
            // the window
            if (el.attr('target') == '_parent') {
                return true;
            } else {
                overlay(e);
            }

            return e.preventDefault();
        }
    });

});
