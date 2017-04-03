jQuery(function(){


jQuery(".glossary_letter").click(function(){
var letter = window.location.protocol + "//" + window.location.host + "/" + window.location.pathname + "/" + jQuery(this).text();
window.location = letter;
console.log(letter);
})


console.log("hi");

if (jQuery("#search_results").width() < 1233 && jQuery("#search_results").width() >= 1126){
  jQuery(".border_button").css("padding","8px 10px");
}
if (jQuery("#search_results").width() < 1226 && jQuery("#search_results").width() > 1126){
  jQuery(".border_button").css("padding","8px 10px");
}



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
