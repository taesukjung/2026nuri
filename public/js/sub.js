$(function(){
    $(".tab1").click(function() {
        $(".tab_info.tab1_sub").css(
         "display", "block");
        $(".tab_info.tab2_sub").css(
         "display", "none");
        $(".tab1").addClass("on");
        $(".tab2").removeClass("on");
    });
    
    $(".tab2").click(function() {
        $(".tab_info.tab2_sub").css(
         "display", "block");
        $(".tab_info.tab1_sub").css(
         "display", "none");
        $(".tab2").addClass("on");
        $(".tab1").removeClass("on");
    });
    
});
$(function() {
     $(".product_menu").click(function() {
        $(".sub_menu").slideToggle("slow");
    });    
});

$( document ).ready( function() {
        $( window ).scroll( function() {
          if ( $( this ).scrollTop() > 200 ) {
            $( '.top' ).fadeIn();
          } else {
            $( '.top' ).fadeOut();
          }
        } );
        $( '.top' ).click( function() {
          $( 'html, body' ).animate( { scrollTop : 0 }, 400 );
          return false;
        } );
      } );