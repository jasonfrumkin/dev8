(function(jQuery, Drupal) {
    Drupal.behaviors.merciAvailabilityGrid = {
        'attach': function(context) {
    		jQuery("#edit-selection-fieldset-group-entity input").change(function () {
                jQuery('[id^=edit-selection-fieldset-merci-item-nid]').each(function(){
                    jQuery(this).prop('checked', false);
                });
    			var allVals = [];
    			jQuery(this).closest('#edit-selection-fieldset-group-entity').each(function(){
    				jQuery(this).find(':checked').each(function(){
    					allVals.push(jQuery(this).val());
    				});
    			});
    			var myUrl = '/merci/grid/checkboxes/' + allVals.join(',');
				jQuery.ajax({
        			url: myUrl,
        			success: function(result){
        				var data = jQuery.parseJSON(result);
        				jQuery.each(data, function(){
        					jQuery('#edit-selection-fieldset-merci-item-nid-' + this).each(function(){
								jQuery(this).prop('checked', true);
    						});
        				});
        			}
        		});
    		});
        }
    }
})(jQuery, Drupal);

(function(jQuery, Drupal){
    Drupal.behaviors.merciAvailabilityGrid = {
      'attach': function(context) {
        jQuery.contextMenu({
            selector: ".ui-draggable",
            items: {
                Extend: {name: "Extend Reservation by 15 Minutes", callback: function(key, opt){ alert("Extended!"); }},
                Cancel: {name: "Cancel Reservation", callback: function(key, opt){ alert("Cancelled!"); }},
                CheckOut: {name: "Check-Out Room", callback: function(key, opt){ alert("Checked Out!"); }},
                CheckIn: {name: "Check-In Room", callback: function(key, opt){ alert("Checked In!"); }}
            }
        });

        jQuery(".notAvailable_checkout").hover(
            function(){
                usepart=jQuery(this).attr("partof");
                jQuery(".notAvailable_checkout[partof="+usepart+"]").css("background-color","#F00 !important");
            },
            function(){
                usepart=jQuery(this).attr("partof");
                jQuery(".notAvailable_checkout[partof="+usepart+"]").css("background-color","#C55B5B !important");
            }
        );

        parts = [];
        jQuery('div[partof]').each(function(){
            var val = jQuery(this).attr("partof");
            if(jQuery.inArray(val, parts) < 0){
                parts.push(val);
            }
        });
        jQuery(".Cell .Available").droppable({
            accept: ".Cell",
            drop: function( event, ui ) {
                var nid = jQuery(event.toElement).attr("partof");
                var count = jQuery('div[partof='+nid+']').length;
                var item = jQuery(event.toElement).attr("data-id");
                var newItem = jQuery(event.target).attr("data-id");
                var start = jQuery(event.target).attr("data-start");
                var date = jQuery(event.target).attr("data-date");
                var end = jQuery(event.target).attr("data-end");
                jQuery.get("/merci/availabilitygrid/modify?nid="+nid+"&start="+start+"&end="+end+"&date="+date+"&item="+item+"&newItem="+newItem+"&count="+count, function(data, status){
                    location.reload();
                });
            }
        });
        jQuery("#extensionArea").droppable({
            accept: ".Cell",
            hoverClass: "hovering",
            drop: function( event, ui ) {
                var nid = jQuery(event.toElement).attr("partof");
                var count = jQuery('div[partof='+nid+']').length;
                var item = jQuery(event.toElement).attr("data-id");
                var newItem = jQuery(event.toElement).attr("data-id");
                var start = jQuery(event.toElement).attr("data-start");
                var date = jQuery(event.toElement).attr("data-date");
                var end = jQuery(event.toElement).attr("data-end");
                jQuery.get("/merci/availabilitygrid/extend?nid="+nid+"&start="+start+"&end="+end+"&date="+date+"&item="+item+"&newItem="+newItem+"&count="+count, function(data, status){
                    location.reload();
                });
            }
        });
        jQuery("#cancelArea").droppable({
            accept: ".Cell",
            hoverClass: "hovering",
            drop: function( event, ui ) {
                var nid = jQuery(event.toElement).attr("partof");
                var count = jQuery('div[partof='+nid+']').length;
                var item = jQuery(event.toElement).attr("data-id");
                var newItem = jQuery(event.toElement).attr("data-id");
                var start = jQuery(event.toElement).attr("data-start");
                var date = jQuery(event.toElement).attr("data-date");
                var end = jQuery(event.toElement).attr("data-end");
                jQuery.get("/merci/availabilitygrid/cancel?nid="+nid+"&start="+start+"&end="+end+"&date="+date+"&item="+item+"&newItem="+newItem+"&count="+count, function(data, status){
                    location.reload();
                });
            }
        });
        jQuery("#checkInArea").droppable({
            accept: ".Cell",
            hoverClass: "hovering",
            drop: function( event, ui ) {
                var nid = jQuery(event.toElement).attr("partof");
                var count = jQuery('div[partof='+nid+']').length;
                var item = jQuery(event.toElement).attr("data-id");
                var newItem = jQuery(event.toElement).attr("data-id");
                var start = jQuery(event.toElement).attr("data-start");
                var date = jQuery(event.toElement).attr("data-date");
                var end = jQuery(event.toElement).attr("data-end");
                jQuery.get("/merci/availabilitygrid/checkin?nid="+nid+"&start="+start+"&end="+end+"&date="+date+"&item="+item+"&newItem="+newItem+"&count="+count, function(data, status){
                    location.reload();
                });
            }
        });
        jQuery("#checkOutArea").droppable({
            accept: ".Cell",
            hoverClass: "hovering",
            drop: function( event, ui ) {
                var nid = jQuery(event.toElement).attr("partof");
                var count = jQuery('div[partof='+nid+']').length;
                var item = jQuery(event.toElement).attr("data-id");
                var newItem = jQuery(event.toElement).attr("data-id");
                var start = jQuery(event.toElement).attr("data-start");
                var date = jQuery(event.toElement).attr("data-date");
                var end = jQuery(event.toElement).attr("data-end");
                jQuery.get("/merci/availabilitygrid/checkout?nid="+nid+"&start="+start+"&end="+end+"&date="+date+"&item="+item+"&newItem="+newItem+"&count="+count, function(data, status){
                    location.reload();
                });
            }
        });
        jQuery("[class^='notAvailable']").closest('.Cell').draggable({
            cursor: "pointer",
            snap: true,
            snapMode: ".Cell",
            snapTolerance: 8,
            stack: ".Cell",
            stop: function(event, ui) {
                var nid = jQuery(this).find('div[partof]').attr("partof");
                var start = jQuery('div[partof="'+nid+'"]').first().attr("data-start");
                var end = jQuery('div[partof="'+nid+'"]').last().attr("data-end");
            },
            start: function(event, ui) {
                var nid = jQuery(this).find('div[partof]').attr("partof");
                var size = jQuery('div[partof="'+nid+'"]').size();
                jQuery(this).find('div[partof]').addClass('moving'+size);
            }
        });

        jQuery( "#selectable .Row" ).selectable({
          filter: ".Available",
        });
        arr = [];
        jQuery( "#selectable .Row" ).on( "selectableselected", function( event, ui ) {
          arr.push(ui);
        });
        jQuery( "#selectable .Row" ).on( "selectablestop", function( event, ui ) {
          if (arr[0]) {
            var index;
            var date = arr[0].selected.getAttribute('data-date');
            var last = ((arr.length) - 1);
            var node = arr[0].selected.getAttribute('data-id');
            var start = arr[0].selected.getAttribute('data-start');
            if(arr[1]){
              var end = arr[last].selected.getAttribute('data-end');
            }
            else {
              var end ="";
            }
            window.location.href = "/node/add/merci_reservation/?nid="+node+"&date="+date+"&time="+start+"&time2="+end;
          }
          else{
            //do nothing for now
          }

        });
      }
    }
})(jQuery, Drupal);
