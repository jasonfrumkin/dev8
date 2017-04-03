jQuery(function(){




setTimeout(function(){
jQuery(".toolbar-icon-help").click(function(){
    setTimeout(function(){
console.log("Working");
        jQuery(".joyride-next-tip").eq(1).hide();
        jQuery(".joyride-next-tip").eq(2).hide();
        jQuery(".joyride-next-tip").eq(3).hide();
        jQuery(".registrations-yes").click(function(){
            jQuery("#edit-rng-status-value").trigger("click");
            setTimeout(function(){
                jQuery(".joyride-next-tip").eq(1).trigger("click");
            }, 500);
        })
        jQuery(".event-yes").click(function(){
            jQuery("#edit-field-is-reservation-event-value").trigger("click");
            setTimeout(function(){
                jQuery(".joyride-next-tip").eq(2).trigger("click");
            }, 500);
        })
    }, 500);
})
var url_var_title = getParameterByName('title');
if(window.location.href.indexOf('?') != -1){
  if(window.location.href.indexOf('?field_database_subject_target_id=All') == -1){
    jQuery("#block-views-block-databases-block-7").remove();
  }
  if (url_var_title != ""){
    jQuery("#block-views-block-databases-block-7").remove();
  }
}

if(window.location.href.indexOf('room-sign') != -1){
  window.setInterval(function(){
    jQuery(".room-sign .form-submit").trigger("click");
  }, 5000);
}
function getParameterByName(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}


  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //START MOVE POPULAR DATABASES TO CONTENT AREA
    popdatabase = jQuery("#block-views-block-databases-block-7");
    jQuery("#block-views-block-databases-block-7").remove();
    jQuery(".table-responsive").prepend(popdatabase);
    jQuery("#block-views-block-databases-block-7").after('<h2 class="block-title database-h2-offset" >All Databases</h2>');
  //END MOVE POPULAR DATABASES TO CONTENT AREA
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//START CREATE JUMPTO SIDEBAR MENU AND POPULATE
  jQuery.lockfixed("#block-bootstrap-ahml-jumptomenu",{offset: {top: 0, bottom: 100}});
  counter = 0;
  var first_item = jQuery(".page-header").text();
  jQuery("#jump-to-menu").append("<p class='jumpto parent_jumpto_item jump_subject' jump_to='item"+counter+"'>"+first_item+"</p>");
  jQuery(".page-header").addClass('item'+counter);
  counter++;
  jQuery(".views-field-title").each(function(){
    jQuery(this).addClass('item'+counter);
    jQuery("#jump-to-menu").append("<p class='jumpto child_jumpto_item' jump_to='item"+counter+"'>"+jQuery(this).text()+"</p>");
    counter++;
  })
  jQuery(".block-title").each(function(){
    if (jQuery(this).text()!="Jump To Menu" && jQuery(this).text()!="Popular Databases" && jQuery(this).text()!="All Databases"){
        jQuery(this).addClass('item'+counter);
        jQuery("#jump-to-menu").append("<p class='jumpto jump_subject' jump_to='item"+counter+"'>"+jQuery(this).text()+"</p>");
        counter++;
    }
  })
  //END CREATE JUMPTO SIDEBAR MENU AND POPULATE
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //START CLICK SIDE MENU ITEM SCROLL TO
    jQuery(".jumpto").click(function(){
      jumpto = jQuery(this).attr('jump_to');
      thisjump = jQuery(this);
      jQuery(".jumpto").each(function(){
        jQuery(this).removeClass("active");
      })
      thisjump.addClass("active");
      jQuery('html,body').animate({
        scrollTop: jQuery("."+jumpto).offset().top-150},
        //scrollTop: 1100},
      'slow');
      jQuery("."+jumpto).trigger("click");
    })



  //END CLICK SIDE MENU ITEM SCROLL TO
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var current_url = window.location.href;
var image_number_counter=0;
if (current_url=='http://dev8.ahml.info/research/database'){
  jQuery(".views-field-field-image").each(function(){
    image_number_counter++;
    if (jQuery(this).find("img").length == 0) {
      jQuery(this).html("<img src='http://dev8.ahml.info/themes/bootstrap_ahml/templates/images/placeholder_"+image_number_counter+".jpg'>");
    }
  })
}

 }, 200);
var current_url = window.location.href;
if (current_url=='http://dev8.ahml.info/'){
jQuery(".view-header").css("height","0px").css("width","100%").css("float","left");
jQuery(".view-header").prependTo("#views_slideshow_cycle_main_test_video_slideshow-block_1");
jQuery("#views_slideshow_controls_text_pause_test_video_slideshow-block_1").remove();
jQuery("#views_slideshow_controls_text_previous_test_video_slideshow-block_1").html("<a href='#'><img style='width:40px' src='http://dev8.ahml.info/images/left_slider_nav.png'></a>");
jQuery("#views_slideshow_controls_text_next_test_video_slideshow-block_1").html("<a href='#'><img style='width:40px' src='http://dev8.ahml.info/images/right_slider_nav.png'></a>");
jQuery("#views_slideshow_controls_text_next_test_video_slideshow-block_1").appendTo("#right-homepage-slider-nav");
jQuery("#views_slideshow_controls_text_previous_test_video_slideshow-block_1").appendTo("#left-homepage-slider-nav");
}
//DATABASE PAGE TURN "GET THE APP" INTO A BUTTON
jQuery(".additional-info").each(function(){
  if (jQuery(this).text().indexOf("Get the App") >= 0){
    jQuery(this).addClass('get-app-button');
  } else {
    jQuery(this).addClass('force-margin-top');
  }
})




jQuery(".views-field-nothing").each(function(){
  if (jQuery(this).text().length==40){
    //jQuery(this).remove();
  }
})

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //START TOGGLE COLUMN NUMBER CHANGE
  jQuery( ".single_column" ).click(function() {
    jQuery( ".slide_over tr" ).animate({
      width: "100%",
      margin: "0px 0% 0px 0px",
      padding: "25px 1% 25px 1%",
      height: "205px"
    }, 1000, function() {
      jQuery(".table-striped>tbody>tr:nth-of-type(odd)").css("background-color","#f9f9f9");
    });
  });
  jQuery( ".double_column" ).click(function() {
    jQuery( ".slide_over tr" ).animate({
      width: "47%",
      margin: "0px 1% 0px 1%",
      padding: "20px 1% 20px 1%",
      height: "275px"
    }, 1000, function() {
      jQuery(".table-striped>tbody>tr:nth-of-type(odd)").css("background-color","transparent");
    });
  });
  jQuery( ".triple_column" ).click(function() {
    jQuery( ".slide_over tr" ).animate({
      width: "30%",
      margin: "0px 1% 0px 1%",
      padding: "0px 1% 0px 1%",
      height: "355px"
    }, 1000, function() {
      // Animation complete.
    });
  });
  //END TOGGLE COLUMN NUMBER CHANGE
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


});


jQuery(".show-all-on-click").each(function(){
  if (jQuery(this).text().length > 290){
    jQuery(this).hide();
    jQuery(this).append("<span class='hide-all-content'>Close</span>");
  } else {
    jQuery(this).parent().find(".show-all-content").remove();
  }
})
jQuery( document ).on( 'click', '.hide-all-content', function() {
  jQuery(this).parent().slideUp();
  jQuery(this).parent().prev(".show-all-content").show();
});
jQuery( document ).on( 'click', '.show-all-content', function() {
  jQuery(this).hide();
  jQuery(this).next(".show-all-on-click").slideToggle( "slow", function() {
    //complete
  });
});



jQuery(".slide_down_trigger").click(function(){
  jQuery(this).next(".slide-down-info").slideToggle( "slow", function() {
    // Animation complete.
  });
})

if (jQuery("#search_results").width() < 1233 && jQuery("#search_results").width() >= 1126){
jQuery(".border_button").css("padding","8px 10px");
}
if (jQuery("#search_results").width() < 1226 && jQuery("#search_results").width() > 1126){
jQuery(".border_button").css("padding","8px 10px");
}


var container_width = jQuery(".slide_over").width();
var min_div_size = 375;
console.log(container_width/min_div_size);




  jQuery("#db_facet_select").append("<select class='db_facet_select'></select>");
  jQuery("#db_alpha_list").append("<select class='db_alpha_select'></select>");
  jQuery(".database-subject-list a").each(function() {
    jQuery(".db_facet_select").append("<option value=''>"+jQuery(this).text()+"</option>");
    jQuery(this).remove();
  });
  jQuery(".glossary_letter").each(function() {
    jQuery(".db_alpha_select").append("<option value=''>"+jQuery(this).text()+"</option>");
    jQuery(this).remove();
  });
//SCRIPT FOR A-Z - Call .glossary_letter on any letter to have script take you to current url/letter
jQuery(".glossary_letter").click(function(){
  var letter = window.location.protocol + "//" + window.location.host + "/" + window.location.pathname + "/" + jQuery(this).text();
  window.location = letter;
})


jQuery("#openme").hide();
//Test if admin menu at top of page and call stick for sidebar with top offset based on existance of admin menu
/**if(document.getElementById("toolbar-administration") !== null)
{
  jQuery(".region-sidebar-first").sticky({topSpacing:100});
} else {
  jQuery(".region-sidebar-first").sticky({topSpacing:0});
}**/
jQuery(document).ready(function() {

jQuery(".facet_bar_primary").before('<div id="open_sidebar">&#9193;</div>');
jQuery("#open_sidebar").on( "click", function() {
  jQuery("#open_sidebar").fadeOut('slow');
  jQuery( ".col-sm-10.slide_over" ).animate({
    width: "83.33333333%"
  }, 400, function() {
    // Animation complete.
  });
});
  //var stickyTop = jQuery('.region-sidebar-first').offset().top;
  var stickyBottom = jQuery(".footer").outerHeight();

if (!document.getElementById("toolbar-item-administration")) {
  var scroll_offset = 0;
} else {
  var scroll_offset = 78;
}
jQuery("#close_sidebar").click(function(){
  jQuery("#open_sidebar").fadeIn('slow');
  jQuery( ".col-sm-10.slide_over" ).animate({
    width: "100%"
  }, 400, function() {
  });
})
  jQuery(window).scroll(function() {
      var windowTop = jQuery(window).scrollTop();

      if (windowTop > 276 && (jQuery('#jump-to-menu').offset().top + jQuery('#jump-to-menu').height()) < (jQuery(document).height() - jQuery(".footer").outerHeight() + 10)){
        jQuery('.views-exposed-form').css('position', 'fixed').css('width', '100%').css('top', scroll_offset+'px').css('z-index', '500').css('padding', '10px 10px 8px 35px');
        jQuery('.column-selector').css('z-index', '600').css('position', 'fixed').css('top', '0');
        jQuery('.single_column').css('right', '121px');
        jQuery('.double_column').css('right', '73px');
        jQuery('.triple_column').css('right', '25px');
        jQuery('#open_sidebar').css('position','fixed');
        jQuery(".region-sidebar-first").removeAttr("style")
        jQuery('.region-sidebar-first').css('position', 'fixed');
        jQuery('.region-sidebar-first').css('width', '16.66666667%');
        jQuery('.region-sidebar-first').css('top', scroll_offset+'px');
        console.log("1");
      } else if (windowTop < 276 && (jQuery('#jump-to-menu').offset().top + jQuery('#jump-to-menu').height()) < (jQuery(document).height() - jQuery(".footer").outerHeight() + 10)){
        jQuery('.views-exposed-form').removeAttr('style');
        jQuery('.column-selector').removeAttr('style');
        jQuery('.single_column').removeAttr('style');
        jQuery('.double_column').removeAttr('style');
        jQuery('.triple_column').removeAttr('style');
        jQuery('#open_sidebar').css('position','absolute');
        jQuery(".region-sidebar-first").removeAttr("style")
        jQuery('.region-sidebar-first').css('position', 'inherit');
        jQuery('.region-sidebar-first').css('width', '100%');
        console.log("2");
      }

      if ((jQuery('#jump-to-menu').offset().top + jQuery('#jump-to-menu').height()) > (jQuery(document).height() - jQuery(".footer").outerHeight() + 10) ){
        //jQuery("#block-bootstrap-ahml-jumptomenu").outerHeight()+jQuery(".footer").height();
        jQuery(".region-sidebar-first").removeAttr("style");
        jQuery("#block-bootstrap-ahml-jumptomenu").removeAttr("style");
        jQuery('#block-bootstrap-ahml-jumptomenu').css('position', 'absolute');
        jQuery('#block-bootstrap-ahml-jumptomenu').css('bottom', '0px');
        console.log((jQuery('#jump-to-menu').offset().top + jQuery('#jump-to-menu').height())+" AND "+(jQuery(document).height() - jQuery(".footer").outerHeight() + 10));
        return;
      }
  });




    jQuery(".jason-toggle").click(function(){
      jQuery(".slideout-menu").animate({left: '-250px'});
      jQuery('.js-slideout-toggle').css("visibility","visible")
      jQuery(".studio_page").animate({width: '100%'});
    });
      jQuery('.menu-slideout-toggle').click(function(e) {
      e.preventDefault();
      var name = jQuery(this).attr('where');
      var pos = jQuery('a[name='+name+']').offset();
      jQuery('body').animate({ scrollTop: pos.top });
    });
   var screen_width = jQuery(window).width();
   var first_left = screen_width + 250;
   console.log("Screen is: "+screen_width+" wide");

   jQuery(".accord_title").click(function(){
      if (jQuery(this).next().is(":visible")){
        jQuery(this).next().slideUp();
      } else {
        jQuery(this).next().slideDown();
      }
  })

 if (screen_width > 780){
          jQuery(".nav-links").css("display","none !important");
          jQuery('.menu-slideout-toggle').click(function(e) {
              e.preventDefault();
              var name = jQuery(this).attr('where');
              var pos = jQuery('a[name='+name+']').offset();
              jQuery('body').animate({ scrollTop: pos.top });

          });

          jQuery(".studio_page").animate({width: '85%'});

          jQuery(".slideout-menu").animate({left: '0px'});

          jQuery('.js-slideout-toggle').click(function() {
            jQuery(this).css("visibility","hidden")
            jQuery(".studio_page").animate({width: '85%'});
            jQuery(".slideout-menu").animate({left: '0px'});
            //slideout.toggle();
          });

          jQuery('.jason-toggle').click(function() {
            //slideout.toggle();
            jQuery(".slideout-menu").animate({left: '-250px'});
            jQuery('.js-slideout-toggle').css("visibility","visible")
            jQuery(".studio_page").animate({width: '100%'});
          });
          jQuery('.menu').click(function(eve) {
            if (eve.target.nodeName === 'A') { slideout.close(); }
          });
        jQuery(".submenu-back-icon").click(function(event){
          jQuery("#facets_sidebar").animate({
            left: '-21%',
            width:'0px'});
          jQuery("#search_results").animate({width: '100%'});
          jQuery("#facets_pull_tab").show();
        })

jQuery("#facets_pull_tab").click(function(event){
  jQuery("#facets_sidebar").animate({
    left: '0%',
    width:'21%'});
  jQuery("#search_results").animate({width: '75%'});
  jQuery("#facets_pull_tab").show();
})

      jQuery(window).scroll(function(e){
            var jQueryel = jQuery('#facets_sidebar');
            var isPositionFixed = (jQueryel.css('position') == 'fixed');
            if (jQuery(this).scrollTop() > 190 && !isPositionFixed){
              jQuery('#facets_sidebar').css({'position': 'fixed', 'top': '30px'});
            }
            if (jQuery(this).scrollTop() < 190 && isPositionFixed)
            {
              jQuery('#facets_sidebar').css({'position': 'relative', 'top': '0px'});
            }
        });

      jQuery(window).scroll(function(e){
        var jQueryel = jQuery('#facets_pull_tab');
        var isPositionFixed = (jQueryel.css('position') == 'fixed');
        if (jQuery(this).scrollTop() > 190 && !isPositionFixed){
          jQuery('#facets_pull_tab').css({'position': 'fixed', 'top': '30px'});
        }
        if (jQuery(this).scrollTop() < 190 && isPositionFixed)
        {
          jQuery('#facets_pull_tab').css({'position': 'absolute', 'top': '0px'});
        }
    });
  } else {
     jQuery(window).scroll(function(e){
        console.log(jQuery(this).scrollTop());

      var jQueryel = jQuery('.submenu-top');
      var isPositionFixed = (jQueryel.css('position') == 'fixed');
      if (jQuery(this).scrollTop() > 260 && !isPositionFixed){
        jQuery('.submenu-top').css({'position': 'fixed', 'top': '30px'});
        jQuery('#facets_sidebar').css({'top': '80px'});
      }
      if (jQuery(this).scrollTop() < 260 && isPositionFixed)
      {
        jQuery('.submenu-top').css({'position': 'static', 'top': '0px'});
        jQuery('#facets_sidebar').css({'top': '0px'});
      }
    });
    jQuery(".submenu-back-icon").click(function(event){
      if (jQuery("#facets_sidebar").css("height")=="190px"){
        jQuery("#facets_sidebar").animate({
          height: '50px'
        });
        jQuery(".submenu-back-icon").text("v");
        jQuery(".submenu-back-icon").css("padding-top","0px");
        jQuery(".submenu-back-icon").css("padding-left","10px");
        jQuery(".submenu-back-icon").css("font-size","38px");
        jQuery("#facets_sidebar").css("position","absolute","top","0px");
      } else {
        jQuery("#facets_sidebar").animate({
          height: '190px'
        });
        jQuery(".submenu-back-icon").text("^");
        jQuery(".submenu-back-icon").css("padding-top","4px");
        jQuery(".submenu-back-icon").css("padding-left","8px");
        jQuery(".submenu-back-icon").css("font-size","48px");
        jQuery("#facets_sidebar").css("position","fixed","top","80px");
      }
    })
}


  jQuery(".leaf_login").click(function(event){
    event.preventDefault();
    if ( jQuery( "#login-inner" ).is( ":hidden" ) ) {
      jQuery( "#login-inner" ).slideDown( "slow" );
    } else {
      jQuery( "#login-inner" ).slideUp( "slow" );
    }
  })



jQuery("#facets_pull_tab").click(function(event){
  jQuery("#facets_sidebar").animate({
    right: '0%',
    width:'21%'});
  jQuery("#search_results").animate({width: '75%'});
  jQuery("#facets_pull_tab").show();
})
jQuery("#search_results_options").hover(function(){
  jQuery("#search_results_options").animate({width: '230px', height: '65px'});
  jQuery(".result_options_p").hide();
  jQuery(".showing_results").animate({padding: '55px 0px 4px 2.5%'});
}, function() {
    jQuery("#search_results_options").animate({width: '35px', height: '33px'});
    jQuery(".result_options_p").show();
    jQuery(".showing_results").animate({padding: '21px 0px 4px 2.5%'});
  })

})

function resizer(){
  if (jQuery(".search_found_record").width() < 874){
  jQuery(".result_content_center").css("display","none");
  jQuery(".result_content_left").css("width","75%");
  } else {
  jQuery(".result_content_center").css("display","inherit");
  jQuery(".result_content_left").css("width","40%");
  }
}

jQuery(".half_layout").click(function(){
setTimeout(resizer, 400);
jQuery(".search_found_record").animate({
    width:'48%',
    margin: '0px 1% 1% 1%'});
if (jQuery(".search_found_record").width() < 874){
jQuery(".result_content_center").css("display","none");
jQuery("..result_content_left").css("width","75px");
}
})
jQuery(".full_layout").click(function(){
  setTimeout(resizer, 400);
jQuery(".search_found_record").animate({
    width:'95%',
    margin: '0px 2.5% 30px 2.5%'});
})
if (jQuery(window).width() < 767) {
   jQuery('.submenu-back-icon').text("v");
}
jQuery(".thirds_layout").click(function(){
  setTimeout(resizer, 400);

jQuery(".search_found_record").animate({
    width:'31%',
    margin: '0px 1% 1% 1%'});
})
