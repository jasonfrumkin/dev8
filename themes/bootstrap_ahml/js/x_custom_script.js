(function($) {
  $.lockfixed("#block-bootstrap-ahml-jumptomenu",{offset: {top: 0, bottom: 100}});
  counter = 0;
  var first_item = jQuery(".page-header").text();
  jQuery("#jump-to-menu").append("<p class='jumpto jump_subject' jump_to='item"+counter+"'>"+first_item+"</p>");
  jQuery(".page-header").addClass('item'+counter);
  counter++;
  jQuery(".views-field-title").each(function(){
    jQuery(this).addClass('item'+counter);
    jQuery("#jump-to-menu").append("<p class='jumpto' jump_to='item"+counter+"'>"+jQuery(this).text()+"</p>");
    counter++;
  })
  jQuery(".block-title").each(function(){
    if (jQuery(this).text()!="Jump To Menu"){
        jQuery(this).addClass('item'+counter);
        jQuery("#jump-to-menu").append("<p class='jumpto jump_subject' jump_to='item"+counter+"'>"+jQuery(this).text()+"</p>");
    }
  })
  $(".jumpto").click(function(){
    jumpto = $(this).attr('jump_to');
    $('html,body').animate({
      scrollTop: $("."+jumpto).offset().top},
    'slow');
  })
  jQuery(".slide_down_trigger").click(function(){
    jQuery(this).next(".slide-down-info").slideToggle( "slow", function() {
      // Animation complete.
    });
  })
})(jQuery);
