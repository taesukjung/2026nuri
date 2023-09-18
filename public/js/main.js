/* 메인배너 */
$(function(){
	var gnbTextOnColor = '#000000',
		gnbTextOffColor = '#ffffff',
		gnbDelay = 300,
		gnbEtcImgOnSrc,
		gnbEtcImgOffSrc,
		mainGnbSts,
		window_width = window.innerWidth,
		window_height = $(window).innerHeight(),
		main_content01_height = $('.main_content01').height(),
		main_video_width = $('.main_video img').width(),
		main_video_height = $('.main_video img').height(),
		main_visual_height = $('.main_visual').height();

	if(window_width>1217){
		$('.gnb_1depth > li > h3 > a').bind('mouseenter', function() {
			$('.header_wrap').stop().animate({backgroundColor:'rgba(255,255,255,1)'},gnbDelay);
			$('.gnb_1depth > li > h3 a').stop().animate({color:gnbTextOnColor},gnbDelay);
			$('.gnb_etc_language > a').stop().animate({color:gnbTextOnColor,borderColor:gnbTextOnColor},gnbDelay);
			$('.gnb_etc_language').addClass('on');
			for (var i=0; i<3; i++){
				gnbEtcImgOnSrc = $('.gnb_etc ul li').eq(i).find('a').find('img').attr('src');
				gnbEtcImgOnSrc = gnbEtcImgOnSrc.replace('_off','_on');
				$('.gnb_etc ul li').eq(i).find('a').find('img').attr('src',gnbEtcImgOnSrc);
				$('.gnb_etc ul .gnb_etc_btn').eq(i).addClass('active');
			}
			$('.gnb_etc ul li').find('a').fadeIn(gnbDelay);

			
		});

		$('#gnb').bind('mouseleave', function() {
			$('.header_wrap').stop().animate({backgroundColor:'rgba(0,0,0,0.35)'},gnbDelay);
			$('.gnb_1depth > li > h3 a').stop().animate({color:gnbTextOffColor},gnbDelay);
			$('.gnb_etc_language > a').stop().animate(gnbDelay);
			$('.gnb_etc_language').removeClass('on');
			for (var i=0; i<3; i++){
				gnbEtcImgOffSrc = $('.gnb_etc ul li').eq(i).find('a').find('img').attr('src');
				gnbEtcImgOffSrc = gnbEtcImgOffSrc.replace('_on','_off');
				$('.gnb_etc ul li').eq(i).find('a').find('img').attr('src',gnbEtcImgOffSrc);
				$('.gnb_etc ul .gnb_etc_btn').eq(i).removeClass('active');
			}
			$('.gnb_etc ul li').find('a').fadeIn(gnbDelay);
			
			
		});

		mainGnbSts=0;
	}
	else if(window_width<=1217) {
		$('.gnb_1depth > li > h3 > a').unbind('mouseenter');
		$('#gnb').unbind('mouseleave');

		$('.header_wrap').attr('style','');
		$('.gnb_1depth > li > h3 a').attr('style','');
		$('.gnb_etc_language > a').attr('style','');

		for (var i=0; i<3; i++){
			gnbEtcImgOnSrc = $('.gnb_etc ul li').eq(i).find('a').find('img').attr('src');
			gnbEtcImgOnSrc = gnbEtcImgOnSrc.replace('_off','_on');
			$('.gnb_etc ul li').eq(i).find('a').find('img').attr('src',gnbEtcImgOnSrc);
			$('.gnb_etc ul .gnb_etc_btn').eq(i).addClass('active');
		}
		$('.gnb_etc_language').addClass('on');

		mainGnbSts=1;
	}

	$(window).resize(function(){
		var window_gnb_resize_width = window.innerWidth;
		if(window_gnb_resize_width>1217&&mainGnbSts==1){
			$('.gnb_1depth > li > h3 > a').bind('mouseenter', function() {
				$('.header_wrap').stop().animate({backgroundColor:'rgba(255,255,255,1)'},gnbDelay);
				$('.gnb_1depth > li > h3 a').stop().animate({color:gnbTextOnColor},gnbDelay);
				$('.gnb_etc_language > a').stop().animate(gnbDelay);
				$('.gnb_etc_language').addClass('on');
				for (var i=0; i<3; i++){
					gnbEtcImgOnSrc = $('.gnb_etc ul li').eq(i).find('a').find('img').attr('src');
					gnbEtcImgOnSrc = gnbEtcImgOnSrc.replace('_off','_on');
					$('.gnb_etc ul li').eq(i).find('a').find('img').attr('src',gnbEtcImgOnSrc);
					$('.gnb_etc ul .gnb_etc_btn').eq(i).addClass('active');
				}
				$('.gnb_etc ul li').find('a').fadeIn(gnbDelay);

				
			});

			$('#gnb').bind('mouseleave', function() {
				$('.header_wrap').stop().animate({backgroundColor:'rgba(0,0,0,0.35)'},gnbDelay);
				$('.gnb_1depth > li > h3 a').stop().animate({color:gnbTextOffColor},gnbDelay);
				$('.gnb_etc_language > a').stop().animate({color:gnbTextOffColor,borderColor:gnbTextOffColor},gnbDelay);
				$('.gnb_etc_language').removeClass('on');
				for (var i=0; i<3; i++){
					gnbEtcImgOffSrc = $('.gnb_etc ul li').eq(i).find('a').find('img').attr('src');
					gnbEtcImgOffSrc = gnbEtcImgOffSrc.replace('_on','_off');
					$('.gnb_etc ul li').eq(i).find('a').find('img').attr('src',gnbEtcImgOffSrc);
					$('.gnb_etc ul .gnb_etc_btn').eq(i).removeClass('active');
				}
				$('.gnb_etc ul li').find('a').fadeIn(gnbDelay);
				
				
			});
			$('.gnb_etc_language').removeClass('on');

			for (var i=0; i<3; i++){
				gnbEtcImgOffSrc = $('.gnb_etc ul li').eq(i).find('a').find('img').attr('src');
				gnbEtcImgOffSrc = gnbEtcImgOffSrc.replace('_on','_off');
				$('.gnb_etc ul li').eq(i).find('a').find('img').attr('src',gnbEtcImgOffSrc);
				$('.gnb_etc ul .gnb_etc_btn').eq(i).removeClass('active');
			}
			
			mainGnbSts=0;
		}
		else if(window_gnb_resize_width<=1217&&mainGnbSts==0){
			$('.gnb_1depth > li > h3 > a').unbind('mouseenter');
			$('#gnb').unbind('mouseleave');

			$('.header_wrap').attr('style','');
			$('.gnb_1depth > li > h3 a').attr('style','');
			$('.gnb_etc_language > a').attr('style','');
			$('.gnb_etc_language').addClass('on');

			for (var i=0; i<3; i++){
				gnbEtcImgOnSrc = $('.gnb_etc ul li').eq(i).find('a').find('img').attr('src');
				gnbEtcImgOnSrc = gnbEtcImgOnSrc.replace('_off','_on');
				$('.gnb_etc ul li').eq(i).find('a').find('img').attr('src',gnbEtcImgOnSrc);
				$('.gnb_etc ul .gnb_etc_btn').eq(i).addClass('active');
			}

			mainGnbSts=1;
		}
	});

	


	if(window_width>1217){
		if(window_height>900){
			$('.main_visual').css({height:window_height});
			$('.main_video').css({height:window_height});
			$('.main_content01').css({height:window_height});
		}
		else if(window_height<900){
			$('.main_visual').css({height:'900px'});
			$('.main_video').css({height:'900px'});
			$('.main_content01').css({height:'900px'});
		}
	}
	else if(window_width<=1217){
		$('.main_visual').attr('style','');
		// $('.main_video').css({height:window_height,width:'100%'});
		$('.main_content01').attr('style','');
	}
	
	// if(window_width>1217){
	// 	if(window_width>window_height){//가로가 길때
	// 		$('.main_video img').css({width:'140%',height:'auto'});
	// 		main_video_width = $('.main_video img').width(),
	// 		main_video_height = $('.main_video img').height();
	
	// 		if(window_width>main_video_width){
	// 			$('.main_video img').css({marginLeft:0});
	// 		}
	// 		else{
	// 			var main_video_margin_left = main_video_width - window_width;
	// 			main_video_margin_left = parseInt(main_video_margin_left/2);
	// 			$('.main_video img').css({marginLeft:-main_video_margin_left});
	// 		}
	
	// 		if(window_height>main_video_height){
	// 			$('.main_video img').css({marginTop:0});
	// 		}
	// 		else{
	// 			var main_video_margin_top = main_video_height - window_height;
	// 			main_video_margin_top = parseInt(main_video_margin_top/2);
	// 			$('.main_video img').css({marginTop:-main_video_margin_top,});
	// 		}
	// 	}
	// 	else if(window_height>window_width){//세로가 길때
	// 		$('.main_video img').css({height:window_height,width:'auto'});
	// 		main_video_width = $('.main_video img').width();
	// 		main_video_height = $('.main_video img').height();
	
	// 		if(window_width>main_video_width){
	// 			$('.main_video img').css({marginLeft:0});
	// 		}
	// 		else{
	// 			var main_video_margin_left = main_video_width - window_width;
	// 			main_video_margin_left = parseInt(main_video_margin_left/2);
	// 			$('.main_video img').css({marginLeft:-main_video_margin_left});
	// 		}
	
	// 		if(window_height>main_video_height){
	// 			$('.main_video img').css({marginTop:0});
	// 		}
	// 		else{
	// 			var main_video_margin_top = main_video_height - window_height;
	// 			main_video_margin_top = parseInt(main_video_margin_top/2);
	// 			$('.main_video img').css({marginTop:-main_video_margin_top,});
	// 		}
	// 	}
	// }
	// else if(window_width<=1217){
	// 	if(window_width>window_height){//가로가 길때
	// 		$('.main_video img').css({width:'220%',height:'auto'});
	// 		main_video_width = $('.main_video img').width(),
	// 		main_video_height = $('.main_video img').height();
	
	// 		if(window_width>main_video_width){
	// 			$('.main_video img').css({marginLeft:0});
	// 		}
	// 		else{
	// 			var main_video_margin_left = main_video_width - window_width;
	// 			main_video_margin_left = parseInt(main_video_margin_left/2);
	// 			$('.main_video img').css({marginLeft:-main_video_margin_left});
	// 		}
	
	// 		if(window_height>main_video_height){
	// 			$('.main_video img').css({marginTop:0});
	// 		}
	// 		else{
	// 			var main_video_margin_top = main_video_height - window_height;
	// 			main_video_margin_top = parseInt(main_video_margin_top/2);
	// 			$('.main_video img').css({marginTop:-main_video_margin_top,});
	// 		}
	// 	}
	// 	else if(window_height>window_width){//세로가 길때
	// 		$('.main_video img').css({height:window_height,width:'auto'});
	// 		main_video_width = $('.main_video img').width();
	// 		main_video_height = $('.main_video img').height();
	
	// 		if(window_width>main_video_width){
	// 			$('.main_video img').css({marginLeft:0});
	// 		}
	// 		else{
	// 			var main_video_margin_left = main_video_width - window_width;
	// 			main_video_margin_left = parseInt(main_video_margin_left/2);
	// 			$('.main_video img').css({marginLeft:-main_video_margin_left});
	// 		}
	
	// 		if(window_height>main_video_height){
	// 			$('.main_video img').css({marginTop:0});
	// 		}
	// 		else{
	// 			var main_video_margin_top = main_video_height - window_height;
	// 			main_video_margin_top = parseInt(main_video_margin_top/2);
	// 			$('.main_video img').css({marginTop:-main_video_margin_top,});
	// 		}
	// 	}
	// }
	

	$(window).resize(function(){
		var window_resize_width = window.innerWidth,
		window_resize_height = $(window).innerHeight(),
		main_video_resize_width = $('.main_video img').width(),
		main_video_resize_height = $('.main_video img').height(),
		main_visual_resize_height = $('.main_visual').height();

		if(window_resize_width>1217){
			if(window_resize_height>900){
				$('.main_visual').css({height:window_resize_height});
				$('.main_video').css({height:window_resize_height});
				$('.main_content01').css({height:window_resize_height});	

				
			}
			else if(window_resize_height<900){
				$('.main_visual').css({height:'900px'});
				$('.main_video').css({height:'900px'});
				$('.main_content01').css({height:'900px'});

			}
		}
		else if(window_resize_width<=1217){
			$('.main_visual').attr('style','');
			// $('.main_video').css({height:main_visual_resize_height,width:'100%'});
			$('.main_content01').attr('style','');
		}

		// if(window_resize_width>1217){

		// 	if(window_resize_width>window_resize_height){//가로가 길때
		// 		$('.main_video img').css({width:'140%',height:'auto'});
		// 		main_video_resize_width = $('.main_video img').width(),
		// 		main_video_resize_height = $('.main_video img').height();
				
		// 		if(window_resize_width>main_video_resize_width){
		// 			$('.main_video img').css({marginLeft:0});
		// 		}
		// 		else{
		// 			var main_video_resize_margin_left = main_video_resize_width - window_resize_width;
		// 			main_video_resize_margin_left = parseInt(main_video_resize_margin_left/2);
		// 			$('.main_video img').css({marginLeft:-main_video_resize_margin_left});
		// 		}

		// 		if(window_resize_height>main_video_resize_height){
		// 			$('.main_video img').css({marginTop:0});
		// 		}
		// 		else{
		// 			var main_video_resize_margin_top = main_video_resize_height - window_resize_height;
		// 			main_video_resize_margin_top = parseInt(main_video_resize_margin_top/2);
		// 			$('.main_video img').css({marginTop:-main_video_resize_margin_top});
		// 		}
		// 	}
		// 	else if(window_resize_height>window_resize_width){//세로가 길때
		// 		$('.main_video img').css({height:window_resize_height,width:'auto'});
		// 		main_video_resize_width = $('.main_video img').width(),
		// 		main_video_resize_height = $('.main_video img').height();
				
		// 		if(window_resize_width>main_video_resize_width){
		// 			$('.main_video img').css({marginLeft:0});
		// 		}
		// 		else{
		// 			var main_video_resize_margin_left = main_video_resize_width - window_resize_width;
		// 			main_video_resize_margin_left = parseInt(main_video_resize_margin_left/2);
		// 			$('.main_video img').css({marginLeft:-main_video_resize_margin_left});
		// 		}

		// 		if(window_resize_height>main_video_resize_height){
		// 			$('.main_video img').css({marginTop:0});
		// 		}
		// 		else{
		// 			var main_video_resize_margin_top = main_video_resize_height - window_resize_height;
		// 			main_video_resize_margin_top = parseInt(main_video_resize_margin_top/2);
		// 			$('.main_video img').css({marginTop:-main_video_resize_margin_top});
		// 		}
		// 	}
		// }

		// else if(window_resize_width<=1217){

		// 	if(window_resize_width>window_resize_height){//가로가 길때
		// 		$('.main_video img').css({width:'220%',height:'auto'});
		// 		main_video_resize_width = $('.main_video img').width(),
		// 		main_video_resize_height = $('.main_video img').height();
				
		// 		if(window_resize_width>main_video_resize_width){
		// 			$('.main_video img').css({marginLeft:0});
		// 		}
		// 		else{
		// 			var main_video_resize_margin_left = main_video_resize_width - window_resize_width;
		// 			main_video_resize_margin_left = parseInt(main_video_resize_margin_left/2);
		// 			$('.main_video img').css({marginLeft:-main_video_resize_margin_left});
		// 		}

		// 		if(window_resize_height>main_video_resize_height){
		// 			$('.main_video img').css({marginTop:0});
		// 		}
		// 		else{
		// 			var main_video_resize_margin_top = main_video_resize_height - window_resize_height;
		// 			main_video_resize_margin_top = parseInt(main_video_resize_margin_top/2);
		// 			$('.main_video img').css({marginTop:-main_video_resize_margin_top});
		// 		}
		// 	}
		// 	else if(window_resize_height>window_resize_width){//세로가 길때
		// 		$('.main_video img').css({height:window_resize_height,width:'auto'});
		// 		main_video_resize_width = $('.main_video img').width(),
		// 		main_video_resize_height = $('.main_video img').height();
				
		// 		if(window_resize_width>main_video_resize_width){
		// 			$('.main_video img').css({marginLeft:0});
		// 		}
		// 		else{
		// 			var main_video_resize_margin_left = main_video_resize_width - window_resize_width;
		// 			main_video_resize_margin_left = parseInt(main_video_resize_margin_left/2);
		// 			$('.main_video img').css({marginLeft:-main_video_resize_margin_left});
		// 		}

		// 		if(window_resize_height>main_video_resize_height){
		// 			$('.main_video img').css({marginTop:0});
		// 		}
		// 		else{
		// 			var main_video_resize_margin_top = main_video_resize_height - window_resize_height;
		// 			main_video_resize_margin_top = parseInt(main_video_resize_margin_top/2);
		// 			$('.main_video img').css({marginTop:-main_video_resize_margin_top});
		// 		}
		// 	}
		// }
	});


	function cusMouseenterEvent(e) {
		e.parent().siblings().removeClass('active');
		e.parent().addClass('active');
	}
	function cusMouseleaveEvent(e) {
		e.parent().removeClass('active');
	}

	var main_content01_list_sts = 0;
	if(window_width>1217){
		$('.main_content01_list li a').bind('mouseenter focusin', function(e){
			var target = $(e.currentTarget);
			cusMouseenterEvent(target);
			
			$(this).find('.list_hidden_text').stop().animate({opacity:1,left:0},500);
			$(this).find('.list_arrow').stop().animate({opacity:1,left:0},500);
		});

		$('.main_content01_list li a').bind('mouseleave focusout', function(e){
			var target = $(e.currentTarget);
			cusMouseleaveEvent(target);

			$(this).find('.list_hidden_text').stop().animate({left:-100,opacity:0},500);
			$(this).find('.list_arrow').stop().animate({left:-100,opacity:0},500);
		});
		main_content01_list_sts = 0;
	}
	else if(window_width<=1217) {
		$('.main_content01_list li a').unbind('mouseenter mouseleave focusin focusout');
		main_content01_list_sts = 1;
	}

	$(window).resize(function(){
		var content01WindowRwidth = window.innerWidth;
		if(content01WindowRwidth>1217 && main_content01_list_sts==1){
			$('.main_content01_list li a').bind('mouseenter focusin', function(e){
			var target = $(e.currentTarget);
				cusMouseenterEvent(target);
				
				$(this).find('.list_hidden_text').stop().animate({opacity:1,left:0},500);
				$(this).find('.list_arrow').stop().animate({opacity:1,left:0},500);
			});

			$('.main_content01_list li a').bind('mouseleave focusout', function(e){
				var target = $(e.currentTarget);
				cusMouseleaveEvent(target);

				$(this).find('.list_hidden_text').stop().animate({left:-100,opacity:0},500);
				$(this).find('.list_arrow').stop().animate({left:-100,opacity:0},500);
			});
			main_content01_list_sts = 0;
		}
		else if(content01WindowRwidth<=1217 && main_content01_list_sts==0){
			$('.main_content01_list li a').unbind('mouseenter mouseleave focusin focusout');
			$('.main_content01_list li a').find('.list_hidden_text').attr('style','');
			$('.main_content01_list li a').find('.list_arrow').attr('style','');
			$('.main_content01_list li').removeClass('active');
			main_content01_list_sts = 1;
		}
	});

	$('.main_content04 .main_notice_content01 a').bind('mouseenter focusin', function(e){
		$('.main_content04 .main_notice_content01').addClass('active');
	});
	$('.main_content04 .main_notice_content01 .main_notice_more').bind('mouseenter focusin', function(e){
		$('.main_content04 .main_notice_content01').removeClass('active');
	});
	$('.main_content04 .main_notice_content01 a').bind('mouseleave focusout', function(e){
		$('.main_content04 .main_notice_content01').removeClass('active');
	});

	$('.main_content04 .main_notice_content02 a').bind('mouseenter focusin', function(e){
		var target = $(e.currentTarget);
		cusMouseenterEvent(target);
	});
	$('.main_content04 .main_notice_content02 a').bind('mouseleave focusout', function(e){
		var target = $(e.currentTarget);
		cusMouseleaveEvent(target);
	});

	$('.main_event_wrap a').bind('mouseenter focusin', function(e){
		var target = $(e.currentTarget);
		cusMouseenterEvent(target);
	});
	$('.main_event_wrap a').bind('mouseleave focusout', function(e){
		var target = $(e.currentTarget);
		cusMouseleaveEvent(target);
	});
	
});

/**/
$(function(){
	var myWheel = new wheelEvent(),
	myWheelSts = false;
	function wheelEvent() {

		var delta,
			isComplete = false;

		addEvent();

		this.delta = function() {
			return delta;
		}

		this.addEvent = function() {
			enableScroll();
			addEvent();
		}

		this.removeEvent = function() {
			disableScroll();
		}
		
		function addEvent() {
			$("html, body").bind('mousewheel DOMMouseScroll', scrollUpdate);
		}

		function removeEvent() {
			$("html, body").off('mousewheel DOMMouseScroll', scrollUpdate);
		}

		function scrollUpdate(e) {
			
			var E = e.originalEvent;
			delta = 0;
			if (E.detail) {
				delta = E.detail * -40;
			} else {
				delta = E.wheelDelta;
			};

			var scrollTop = $(window).scrollTop();
			var wHeight = window.innerHeight;
			var targetPos = scrollTop - delta;
			
			if( wHeight <= 900)wHeight = 900;
			
			if(0<targetPos && targetPos < wHeight){
				disableScroll();
				removeEvent();
				isComplete = false;
				
				if (delta > 0) {
					targetPos = 0;
				} else if (delta < 0) {
					targetPos = wHeight;
				}
				
				$("html, body").stop().animate({
					"scrollTop" : targetPos
				}, 300, function() {
					if(isComplete == false){
						addEvent();
						enableScroll();
						isComplete = true;
					}
				});
			}
		}

		//var keys = {37 : 1,	38 : 1,	39 : 1,	40 : 1};

		function preventDefault(e) {
			e = e || window.event;
			if (e.preventDefault)
				e.preventDefault();
			e.returnValue = false;
		}

		function preventDefaultForScrollKeys(e) {
			// if (keys[e.keyCode]) {
			// 	preventDefault(e);
			// 	return false;
			// }
		}

		function disableScroll() {
			if (window.addEventListener)// older FF
				window.addEventListener('DOMMouseScroll', preventDefault, false);
			window.onwheel = preventDefault;// modern standard
			window.onmousewheel = document.onmousewheel = preventDefault;// older browsers, IE
			window.ontouchmove = preventDefault;// mobile
			document.onkeydown = preventDefaultForScrollKeys;
		}

		function enableScroll() {
			if (window.removeEventListener)
				window.removeEventListener('DOMMouseScroll', preventDefault, false);
			window.onmousewheel = document.onmousewheel = null;
			window.onwheel = null;
			window.ontouchmove = null;
			document.onkeydown = null;
		}

	}
	if(window.innerWidth>1217){
		$("html, body").bind('mousewheel DOMMouseScroll');
	}
	else if(window.innerWidth<=1217){
		$("html, body").unbind('mousewheel DOMMouseScroll');
		myWheelSts = true;
	}
	$(window).resize(function(){
		if(window.innerWidth>1217 && myWheelSts==true){
			$("html, body").bind('mousewheel DOMMouseScroll');
			wheelEvent();
			myWheelSts = false;
		}
		else if(window.innerWidth<=1217 && myWheelSts==false){
			$("html, body").unbind('mousewheel DOMMouseScroll');
			myWheelSts = true;
		}
	});
});

/* 메인 동영상 팝업 영역 */


/* 메인 비주얼  슬라이드 스크립트 */

$(function(){
	var mainSlider = $(".main_visual_tit_list").bxSlider({
		auto: true,
		controls : true,
		autoControlsSelector: '.main_visual_auto_controls',
		pager: true,
		pagerSelector :'.main_visual_pager',	
		pause: 5000,
		speed: 1000,
		onSliderLoad: function(currentIndex){
		    var itemSize = $('.main_content02_list li').not('.bx-clone').length;
		    $('.main_content02_list').find('.bx-clone').find('a').attr('tabindex', -1);
		    $('.main_content02_list').find('li').not('.bx-clone').eq( currentIndex ).find('a').attr('tabindex', 0);
		    $(".main_visual_tit_list").css("transform", "translate3d("+($(".main_visual_tit_list li:eq(0)").width()*-1)+"px, 0px, 0px)");

		    $('.main_visual .bx-controls-direction a').bind('click',function(){
				mainSlider.startAuto();
				$(".main_visual .bx-stop").css('display','inline-block');
				$(".main_visual .bx-start").css('display','none');
			});
			$(document).on('click','.bx-pager-link',function() {
				mainSlider.stopAuto();
			    mainSlider.startAuto();
			    $(".main_visual .bx-stop").css('display','inline-block');
				$(".main_visual .bx-start").css('display','none');
			});
			$('.main_visual .bx-start').bind('click',function(){
				mainSlider.startAuto();
				$(this).css('display','none');
				$(".main_visual .bx-stop").css({display:'inline-block',opacity:'0.5'});
			});
			$('.main_visual .bx-stop').bind('click',function(){
				mainSlider.stopAuto();
				$(this).css('display','none');
				$(".main_visual .bx-start").css({display:'inline-block',opacity:'0.5'});
			});
			$('.main_visual_auto_controls a').bind('mouseenter focusin',function(){
				$(this).stop().animate({opacity:'0.5'},300);
			});
			$('.main_visual_auto_controls a').bind('mouseleave focusout',function(){
				$(this).stop().animate({opacity:'1'},300);
			});

			var visual_load_height = $('.main_visual').height();
			$('.main_video').css({height:visual_load_height,width:'100%'});


		},
		onSlideBefore: function($slideElement, oldIndex, newIndex){
		    $('.main_content02_list').find('.bx-clone').find('a').attr('tabindex', -1);
		    $('.main_content02_list').find('li').not('.bx-clone').eq( newIndex ).find('a').attr('tabindex', 0);

		 //    $('.main_video img').eq(oldIndex).fadeOut(1000).css({zIndex:'2'});
			// $('.main_video img').eq(newIndex).css({display:'block',zIndex:'1'});
			$('.main_video div').eq(oldIndex).css({zIndex:'2'}).fadeOut(1000);
			$('.main_video div').eq(newIndex).css({display:'block',zIndex:'1'});

		}
	});

	var main_visual_tit_list_sts;
	if(window.innerWidth>1217){
		main_visual_tit_list_sts=0;
	}
	else if(window.innerWidth<=1217&&window.innerWidth>640){
		main_visual_tit_list_sts=1;
	}
	else if(window.innerWidth<=640){
		main_visual_tit_list_sts=2;
	}
	console.log(main_visual_tit_list_sts);

	$(window).resize(function(){
		if(window.innerWidth>1217 && (main_visual_tit_list_sts == 1 ||  main_visual_tit_list_sts == 2)){
			main_visual_tit_list_sts=0;
			mainSlider.reloadSlider();
			// $('.main_video img').css({display:'none'});
			// $('.main_video img').eq(0).css({display:'block'});
			$('.main_video div').css({display:'none'});
			$('.main_video div').eq(0).css({display:'block'});
			console.log(main_visual_tit_list_sts);
		}
		else if((window.innerWidth<=1217 && window.innerWidth>640) && (main_visual_tit_list_sts == 2 ||  main_visual_tit_list_sts == 0)){
			main_visual_tit_list_sts=1;
			mainSlider.reloadSlider();
			// $('.main_video img').css({display:'none'});
			// $('.main_video img').eq(0).css({display:'block'});
			$('.main_video div').css({display:'none'});
			$('.main_video div').eq(0).css({display:'block'});
			console.log(main_visual_tit_list_sts);
		}
		else if(window.innerWidth<=640 && (main_visual_tit_list_sts == 1 ||  main_visual_tit_list_sts == 0)){
			main_visual_tit_list_sts=2;
			mainSlider.reloadSlider();
			// $('.main_video img').css({display:'none'});
			// $('.main_video img').eq(0).css({display:'block'});
			$('.main_video div').css({display:'none'});
			$('.main_video div').eq(0).css({display:'block'});
			console.log(main_visual_tit_list_sts);
		}
		
	});
	
	

	var mainControlSts = false;

	$(window).scroll(function() {
		if($(this).scrollTop() > 0 && mainControlSts==false) {

			$('.main_visual_controls_box').removeClass('fixed');
			mainSlider.stopAuto();
			mainControlSts = true;
		} 
		else if($(this).scrollTop() == 0 && mainControlSts == true) {

			$('.main_visual_controls_box').addClass('fixed');
			mainSlider.startAuto();
			mainControlSts = false;
		}
			
	});

	

	
});



/* 비디오  슬라이드 스크립트 */

$(function(){
	var mainContent02Slider = $(".main_content02_list").bxSlider({
		auto: true,	 
		controls : true,		
		pager: true,
		pagerType : 'short',
		pause: 6000,
		onSliderLoad: function(currentIndex){
		    var itemSize = $('.main_content02_list li').not('.bx-clone').length;
		    $('.main_content02_list').find('.bx-clone').find('ul').find('li').find('a').attr('tabindex', -1);
		    $('.main_content02_list').find('li').not('.bx-clone').eq( currentIndex ).find('ul').find('li').find('a').attr('tabindex', 0);
		    $(".main_content02_list").css("transform", "translate3d("+($(".main_content02_list li:eq(0)").width()*-1)+"px, 0px, 0px)");

		    $(".main_content02 .bx-controls-direction a").bind('click',function(){
				mainContent02Slider.startAuto();
			});

			
		},
		onSlideBefore: function($slideElement, oldIndex, newIndex){
		    $('.main_content02_list').find('.bx-clone').find('ul').find('li').find('a').attr('tabindex', -1);
		    $('.main_content02_list').find('li').not('.bx-clone').eq( newIndex ).find('ul').find('li').find('a').attr('tabindex', 0);
		}
	});

	var main_content02_list_sts;
	if(window.innerWidth>1217){
		main_content02_list_sts=0;
	}
	else if(window.innerWidth<=1217&&window.innerWidth>640){
		main_content02_list_sts=1;
	}
	else if(window.innerWidth<=640){
		main_content02_list_sts=2;
	}

	$(window).resize(function(){
		if(window.innerWidth>1217 && main_content02_list_sts!==0){
			mainContent02Slider.reloadSlider();
			main_content02_list_sts=0;
		}
		else if(window.innerWidth<=1217 && window.innerWidth>640 && main_content02_list_sts!==1){
			mainContent02Slider.reloadSlider();
			main_content02_list_sts=1;
		}
		else if(window.innerWidth<=640 && main_content02_list_sts!==2){
			mainContent02Slider.reloadSlider();
			main_content02_list_sts=2;
		}
	});
	

	var youtubeSts = false;
	function cusYoutubePopEvent(e) {
		youtubeSts = true;
		var eidx = e.parent().parent().parent().index()-1;

		var youtubeWrapBgHeight = $('body').height(),
		youtubeWrapHeight = $('.youtube_wrap').height(),
		youtubeWrapWidth = $('.youtube_wrap').width(),
		youtubeWrapMargin,
		youtubeWrapMargin2,
		youtubeWrapPos = $('.main_content02').offset().top,
		mainContent02Height = $('.main_content02').height(),
		youtubeSrc = e.attr('href');

		youtubeWrapHeight = mainContent02Height-youtubeWrapHeight;
		youtubeWrapHeight = parseInt(youtubeWrapHeight/2);
		youtubeWrapWidth = parseInt(youtubeWrapWidth/2);
		youtubeWrapMargin = youtubeWrapWidth;
		youtubeWrapMargin2 = parseInt($('.youtube_wrap').height()/2);
		youtubeWrapPos = youtubeWrapPos+youtubeWrapHeight;
		
		$('.youtube_wrap_bg').css({height:youtubeWrapBgHeight}).fadeIn(300);
		// $('.youtube_wrap').eq(eidx).css({top:youtubeWrapPos,marginLeft:-youtubeWrapMargin}).fadeIn(300);
		$('.youtube_wrap').eq(eidx).css({marginLeft:-youtubeWrapMargin,marginTop:-youtubeWrapMargin2}).fadeIn(300);
	}

	// var main_content02_list_sts;
	// if(window.innerWidth>1217){
	// 	main_content02_list_sts=false;
	// }
	// else if(window.innerWidth<=1217){
	// 	main_content02_list_sts=true;
	// }

	$(window).resize(function(){
		// if(window.innerWidth>1217 && main_content02_list_sts==true){
		// 	mainContent02Slider.reloadSlider();
		// 	main_content02_list_sts=false;
		// }
		// else if(window.innerWidth<=1217 && main_content02_list_sts==false){
		// 	mainContent02Slider.reloadSlider();
		// 	main_content02_list_sts=true;
		// }

		if (youtubeSts == true){
			var youtubeWrapBgHeight = $('body').height(),
			youtubeWrapHeight = $('.youtube_wrap').height(),
			youtubeWrapWidth = $('.youtube_wrap').width(),
			youtubeWrapMargin,
			youtubeWrapMargin2,
			youtubeWrapPos = $('.main_content02').offset().top,
			mainContent02Height = $('.main_content02').height();

			youtubeWrapHeight = mainContent02Height-youtubeWrapHeight;
			youtubeWrapHeight = parseInt(youtubeWrapHeight/2);
			youtubeWrapWidth = parseInt(youtubeWrapWidth/2);
			youtubeWrapMargin = youtubeWrapWidth;
			youtubeWrapMargin2 = parseInt($('.youtube_wrap').height()/2);
			youtubeWrapPos = youtubeWrapPos+youtubeWrapHeight;

			$('.youtube_wrap_bg').css({height:youtubeWrapBgHeight});
			// $('.youtube_wrap').css({top:youtubeWrapPos,marginLeft:-youtubeWrapMargin});
			$('.youtube_wrap').css({marginLeft:-youtubeWrapMargin,marginTop:-youtubeWrapMargin2});
		}
	});

	var list_content_left_idx;
	$('.main_content02 .list_content_left a').bind('click',function(e){
		// $('#wrap').bind('scroll touchmove onmousewheel mousewheel DOMMouseScroll', function(event) {
		//   event.preventDefault();
		//   event.stopPropagation();
		//   return false;
		// });
		list_content_left_idx = $(this).parent().parent().parent().index();
		list_content_left_idx = list_content_left_idx-1;
		console.log(list_content_left_idx);
		$('body').addClass('ofy'),$(function(){
			var youtube_width = $('.main_content.main_content02').width();
			if(window.innerWidth>640){
				$('.main_content.main_content02 .main_content02_list > li').not('.bx-clone').eq(list_content_left_idx).css({width:youtube_width});
			}
			else if(window.innerWidth<=640){
				$('.main_content.main_content02 .main_content02_list > li').not('.bx-clone').eq(list_content_left_idx).css({width:youtube_width});
			}
		});
		
		$('.top_button_wrap').fadeOut(300);

		var target = $(e.currentTarget);
		cusYoutubePopEvent(target);
		mainContent02Slider.stopAuto();
		return false;

	});

	$('.youtube_close').bind('click',function(){
		youtubeSts = false;
		// $('#wrap').off('scroll touchmove onmousewheel mousewheel DOMMouseScroll');
		$('body').removeClass('ofy'),$(function(){
			var youtube_width = $('.main_content.main_content02').width();
			if(window.innerWidth>640){
				$('.main_content.main_content02 .main_content02_list > li').not('.bx-clone').eq(list_content_left_idx).css({width:youtube_width});
			}
			else if(window.innerWidth<=640){
				$('.main_content.main_content02 .main_content02_list > li').not('.bx-clone').eq(list_content_left_idx).css({width:youtube_width});
			}
		});
		
		$('.top_button_wrap').fadeIn(300);
		$('.youtube_wrap_bg').fadeOut(300);
		$('.youtube_wrap').fadeOut(300);
		mainContent02Slider.startAuto();
		$('.youtube_caption').removeClass('on');
	});
	$('.youtube_wrap_bg').bind('click',function(){
		$('.youtube_close').trigger('click');
		// $('.youtube_caption').removeClass('on');
	});

	$('.list_btn').bind('mouseenter', function() {
		$(this).addClass('active');
	});
	$('.list_btn ').bind('mouseleave', function() {
		$(this).removeClass('active');
	});
}); 

/* 디테일링 소식 sns 이미지 변경 스크립트*/

$(function(){
	var	snsEtcImgOnSrc,
		snsEtcImgOffSrc

	$('.social_btn_list > li  > a').bind('mouseenter focusin', function() {
		snsEtcImgOnSrc = $(this).find('img').attr('src');
		snsEtcImgOnSrc = snsEtcImgOnSrc.replace('_off','_on');
		$(this).find('img').attr('src',snsEtcImgOnSrc);
	});
	$('.social_btn_list > li ').bind('mouseleave focusout', function() {
		snsEtcImgOffSrc = $(this).find('img').attr('src');
		snsEtcImgOffSrc = snsEtcImgOffSrc.replace('_on','_off');
		$(this).find('img').attr('src',snsEtcImgOffSrc);
	});
});

/* 디테일링 소식 슬라이드 스크립트 */

$(function(){
	var socialSlider = "";
		
	var sliderLoadWidth = window.innerWidth;
	var mainQuickSliderSts;
	var ulWid = $('.social_slider_wrap').width();
		ulWid = ulWid - 20;
	var sliderLiWid;

	socialSlider = $('.social_slider').slick({
		dots:false,
		arrows:true,
		infinite:true,
		slidesToShow:4,
		slidesToScroll:1,
		speed:300,
		prevArrow:'.social_slider_control .prev',
		nextArrow:'.social_slider_control .next',
		responsive: [
	    {
	      breakpoint: 1201,
	      settings: {
	        slidesToShow:3
	      }
	    },
	    {
	      breakpoint: 769,
	      settings: {
	        slidesToShow:2
	      }
	    },
	    {
	      breakpoint: 641,
	      settings: {
	      	centerMode:true,
	      	centerPadding:'40px',
	        slidesToShow: 2
	      }
	    }
	    ,
	    {
	      breakpoint: 481,
	      settings: {
	      	centerMode:true,
	      	centerPadding:'40px',
	        slidesToShow: 1
	      }
	    }
	  ]
	});
		
	
    $('.social_slider .slick-slide').bind('mouseenter', function(){
		$('.social_slider .slick-slide .social_slider_content').removeClass('active');
		$(this).find('.social_slider_content').addClass('active');
		$(this).find('.social_slider_content').find('.social_slider_title').addClass('active');
	});
	$('.social_slider .slick-slide > .thum').bind('focusin', function(){
		$(this).siblings('.social_slider_content').addClass('active');
	});

	$('.social_slider .slick-slide').bind('mouseleave', function(){
		$('.social_slider .slick-slide .social_slider_content').removeClass('active');
		$('.social_slider_title').removeClass('active');
	});
	$('.social_slider .slick-slide > .social_slider_content').bind('focusout', function(){
		$(this).removeClass('active');
	});
	$('.social_slider_more a').bind('mouseenter focusin',function(){
		$(this).addClass('active');
	});
	$('.social_slider_more a').bind('mouseleave focusout',function(){
		$(this).removeClass('active');
	});

	eventSlider = $('.main_event_wrap').slick({
		dots:false,
		arrows:true,
		infinite:true,
		slidesToShow:1,
		slidesToScroll:1,
		speed:300,
		prevArrow:'.event_slider_control .prev',
		nextArrow:'.event_slider_control .next'
	});
	if($('.main_event_wrap .slick-track > div').not('.slick-cloned').length<2){
		$('.event_slider_control').css('display','none');
	}
});

