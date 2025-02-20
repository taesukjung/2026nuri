/*메뉴 gnb*/
$(function(){
	var gnbDelay = 300,
	mainGnbSts,
	window_width = window.innerWidth,
	headerSts = false,
	hamSts = false;

	if(window_width>1217){
		$('.gnb_1depth > li > h3 > a').bind('mouseenter', function() {
			$('.gnb_etc ul li').find('a').fadeIn(gnbDelay);
			$('.gnb_1depth').stop().animate({height:'350px'},gnbDelay);
			$('.gnb_bg').addClass('active');
			$('.gnb_bg').stop().animate({height:'280px'},gnbDelay);
		});
		$('.gnb_1depth > li').eq(0).find('h3').find('a').bind('focusin',function(){
			$('.gnb_1depth > li > h3 > a').trigger('mouseenter');
		});

		$('#gnb').bind('mouseleave', function() {
			$('.gnb_1depth').stop().animate({height:'77px'},gnbDelay);
			$('.gnb_bg').stop().animate({height:'1px'},gnbDelay);
			$('.gnb_bg').removeClass('active');
			
		});
		$('.gnb_1depth > li').last().find('.gnb_2depth').find('li').last().find('a').bind('focusout',function(){
			$('#gnb').trigger('mouseleave');
			$('.gnb_1depth > li').find('.gnb_bar').stop().animate({left:'50%',width:'0'},300);
		});

		

		$('.gnb_1depth > li').bind('mouseenter',function(){
			var gnbIdx = $(this).index();
			$('.gnb_1depth > li').eq(gnbIdx).find('.gnb_bar').stop().animate({left:0,width:'100%'},300);
		});
		$('.gnb_1depth > li').bind('mouseleave',function(){
			var gnbIdx2 = $(this).index();
			$('.gnb_1depth > li').eq(gnbIdx2).find('.gnb_bar').stop().animate({left:'50%',width:'0'},300);
		});

		$('.gnb_1depth > li > h3 > a').bind('focusin',function(e){
			var target = $(e.currentTarget);
			$('.gnb_1depth > li > h3 > a .gnb_bar').stop().animate({left:'50%',width:'0'},300);
			target.find('.gnb_bar').stop().animate({left:0,width:'100%'},300);
		});
		mainGnbSts=0;
	}
	else if(window_width<=1217) {
		$('.gnb_1depth > li > h3 > a').unbind('mouseenter');
		$('#gnb').unbind('mouseleave');

		$('#header .ham_open').bind('click',function(){
			var hamOpenHeight = $('body').height();
			var headerHeight = $('#header').height()+1;
			hamOpenHeight = hamOpenHeight-headerHeight;
			$('.gnb_wrap').addClass('active');
			$('.gnb_wrap').css({minHeight:$(window).innerHeight()-headerHeight});
			$('.gnb_mo_bg').css({height:hamOpenHeight});
			$('.gnb_mo_bg').addClass('active');
			$('#header .ham_close').addClass('active');
			$(this).removeClass('active');
			hamSts=true;
			$('.header_wrap').removeClass('fixed');
			//$("html,body").stop().animate({scrollTop:0}, 1000);
			//headerSts = false;
		});
		$('#header .ham_close').bind('click',function(){
			$('.gnb_wrap').removeClass('active');
			$('.gnb_mo_bg').removeClass('active');
			$('#header .ham_open').addClass('active');
			$(this).removeClass('active');
			hamSts=false;
			if($(window).scrollTop() > 0){
				$('.header_wrap').addClass('fixed');
				headerSts = true;
			}
			else if($(window).scrollTop() == 0){
				$('.header_wrap').removeClass('fixed');
				headerSts = false;
			}
			//$('.header_wrap').addClass('fixed');
		});
		$('.gnb_mo_bg').bind('click',function(){
			$('.gnb_wrap').removeClass('active');
			$(this).removeClass('active');
			$('#header .ham_open').addClass('active');
			$('#header .ham_close').removeClass('active');
			hamSts=false;
			if($(window).scrollTop() > 0){
				$('.header_wrap').addClass('fixed');
				headerSts = true;
			}
			else if($(window).scrollTop() == 0){
				$('.header_wrap').removeClass('fixed');
				headerSts = false;
			}
			//$('.header_wrap').addClass('fixed');
		});
		$('.gnb_1depth > li > h3 > a').bind('click',function(e){
			if($(this).parent().parent().hasClass('active')){
				$(this).parent().parent().removeClass('active');
			}
			else{
				$('.gnb_1depth > li').removeClass('active');
				$(this).parent().parent().addClass('active');	
			}
			e.preventDefault();
		});
		mainGnbSts=1;
	}

	$(window).resize(function(){
		var window_gnb_resize_width = window.innerWidth;
		if(window_gnb_resize_width>1217&&mainGnbSts==1){
			$('.gnb_1depth > li > h3 > a').bind('mouseenter', function() {
				$('.gnb_etc ul li').find('a').fadeIn(gnbDelay);
				$('.gnb_1depth').stop().animate({height:'350px'},gnbDelay);
				$('.gnb_bg').addClass('active');
				$('.gnb_bg').stop().animate({height:'280px'},gnbDelay);
			});
			$('.gnb_1depth > li').eq(0).find('h3').find('a').bind('focusin',function(){
				$('.gnb_1depth > li > h3 > a').trigger('mouseenter');
			});

			$('#gnb').bind('mouseleave', function() {
				$('.gnb_1depth').stop().animate({height:'77px'},gnbDelay);
				$('.gnb_bg').stop().animate({height:'1px'},gnbDelay);
				$('.gnb_bg').removeClass('active');
				
			});
			$('.gnb_1depth > li').last().find('.gnb_2depth').find('li').last().find('a').bind('focusout',function(){
				$('#gnb').trigger('mouseleave');
				$('.gnb_1depth > li').find('.gnb_bar').stop().animate({left:'50%',width:'0'},300);
			});

			$('.gnb_1depth > li').bind('mouseenter',function(){
				var gnbIdx = $(this).index();
				$('.gnb_1depth > li').eq(gnbIdx).find('.gnb_bar').stop().animate({left:0,width:'100%'},300);
			});
			$('.gnb_1depth > li').bind('mouseleave',function(){
				var gnbIdx2 = $(this).index();
				$('.gnb_1depth > li').eq(gnbIdx2).find('.gnb_bar').stop().animate({left:'50%',width:'0'},300);
			});

			$('.gnb_1depth > li > h3 > a').bind('focusin',function(e){
				var target = $(e.currentTarget);
				$('.gnb_1depth > li > h3 > a .gnb_bar').stop().animate({left:'50%',width:'0'},300);
				target.find('.gnb_bar').stop().animate({left:0,width:'100%'},300);
			});

			// $('.gnb_2depth > li > h4 > a').bind('mouseenter focusin', function() {
			// 	$(this).parent().addClass('active');
				
			// });
			// $('.gnb_2depth > li > h4 > a ').bind('mouseleave focusout', function() {
			// 	$(this).parent().removeClass('active');
			// });

			$('#header .ham_open').unbind('click');
			$('#header .ham_close').unbind('click');
			$('.gnb_mo_bg').unbind('click');
			$('.gnb_wrap').removeClass('active');
			$('.gnb_wrap').attr('style','');
			$('.gnb_mo_bg').removeClass('active');
			$('#header .ham_open').addClass('active');
			$('#header .ham_close').removeClass('active');
			$('.gnb_1depth > li > h3 > a').unbind('click');
			$('.gnb_1depth > li').removeClass('active');
			if($(window).scrollTop() > 0 && hamSts==true){
				$('.header_wrap').addClass('fixed');
			}
			else if($(window).scrollTop() == 0 && hamSts==true){
				$('.header_wrap').removeClass('fixed');
			}
			hamSts=false;
			
			mainGnbSts=0;
		}
		else if(window_gnb_resize_width<=1217&&mainGnbSts==0){
			$('.gnb_1depth > li > h3 > a').unbind('mouseenter');
			$('#gnb').unbind('mouseleave');
			$('.gnb_1depth > li').unbind('mouseenter');
			$('.gnb_1depth > li').unbind('mouseleave');
			$('.gnb_1depth > li > h3 > a').unbind('focusin');
			$('.gnb_1depth > li').eq(0).find('h3').find('a').unbind('focusin');
			$('.gnb_1depth > li').last().find('.gnb_2depth').find('li').last().find('a').unbind('focusout');

			$('#header .ham_open').bind('click',function(){
				var hamOpenHeight = $('body').height();
				var headerHeight = $('#header').height()+1;
				hamOpenHeight = hamOpenHeight-headerHeight;
				$('.gnb_wrap').addClass('active');
				$('.gnb_wrap').css({minHeight:$(window).innerHeight()-headerHeight});
				$('.gnb_mo_bg').css({height:hamOpenHeight});
				$('.gnb_mo_bg').addClass('active');
				$('#header .ham_close').addClass('active');
				$(this).removeClass('active');
				hamSts=true;
				$('.header_wrap').removeClass('fixed');
//				$("html,body").stop().animate({scrollTop:0}, 1000);
				//headerSts = false;
			});
			$('#header .ham_close').bind('click',function(){
				$('.gnb_wrap').removeClass('active');
				$('.gnb_mo_bg').removeClass('active');
				$('#header .ham_open').addClass('active');
				$(this).removeClass('active');
				hamSts=false;
				if($(window).scrollTop() > 0){
					$('.header_wrap').addClass('fixed');
					headerSts = true;
				}
				else if($(window).scrollTop() == 0){
					$('.header_wrap').removeClass('fixed');
					headerSts = false;
				}
				//$('.header_wrap').addClass('fixed');
			});
			$('.gnb_mo_bg').bind('click',function(){
				$('.gnb_wrap').removeClass('active');
				$(this).removeClass('active');
				$('#header .ham_open').addClass('active');
				$('#header .ham_close').removeClass('active');
				hamSts=false;
				if($(window).scrollTop() > 0){
					$('.header_wrap').addClass('fixed');
					headerSts = true;
				}
				else if($(window).scrollTop() == 0){
					$('.header_wrap').removeClass('fixed');
					headerSts = false;
				}
				//$('.header_wrap').addClass('fixed');
			});
			$('.gnb_1depth > li > h3 > a').bind('click',function(e){
				if($(this).parent().parent().hasClass('active')){
					$(this).parent().parent().removeClass('active');
				}
				else{
					$('.gnb_1depth > li').removeClass('active');
					$(this).parent().parent().addClass('active');	
				}
				e.preventDefault();
			});

			$('.gnb_1depth').attr('style','');
			$('.gnb_bar').attr('style','');
			$('.gnb_bg').removeClass('active');

			mainGnbSts=1;
		}
	});

	$('.gnb_2depth > li > h4 > a').bind('mouseenter focusin', function() {
		$(this).parent().addClass('active');
		
	});
	$('.gnb_2depth > li > h4 > a ').bind('mouseleave focusout', function() {
		$(this).parent().removeClass('active');
	});


	/* 검색 셀렉트 */
	 $('.gnb_etc_service > a').bind('click',function(){
	 	$('.gnb_etc_service > ul').slideToggle('fast');
	 	$(this).parent().toggleClass('active');
	 });


	function cusMouseenterEvent(e) {
		e.parent().siblings().removeClass('active');
		e.parent().addClass('active');
	}
	function cusMouseleaveEvent(e) {
		e.parent().removeClass('active');
	}

	// var headerSts = false;
	// var hamSts = false;
	var topBtnSts = false;
	
	$(window).scroll(function() {
		if($(this).scrollTop() > 0 && headerSts == false && hamSts==false) {

			$('.header_wrap').addClass('fixed');
			headerSts = true;
		} 
		else if($(this).scrollTop() == 0 && headerSts == true && hamSts==false) {

			$('.header_wrap').removeClass('fixed');
			headerSts = false;
		}

		//if($(this).scrollTop() > 900 && topBtnSts==false){
		//	topBtnSts = true;
		//	$('.top_button_wrap').stop().fadeIn(500);
		//}
		//else if($(this).scrollTop() <= 900 && topBtnSts==true){
		//	topBtnSts = false;
		//	$('.top_button_wrap').stop().fadeOut(500);
		//}
			
	});

});


$(function(){
	
	$('.family_tit').bind('click',function(){
		$('.family_site_list').slideToggle('slow');
		$(this).toggleClass('active');
	});
});

//layout html 불러오기
window.addEventListener('load', function() {
            var allElements = document.getElementsByTagName('*');
            Array.prototype.forEach.call(allElements, function(el) {
                var includePath = el.dataset.includePath;
                if (includePath) {
                    var xhttp = new XMLHttpRequest();
                    xhttp.onreadystatechange = function () {
                        if (this.readyState == 4 && this.status == 200) {
                            el.outerHTML = this.responseText;
                        }
                    };
                    xhttp.open('GET', includePath, true);
                    xhttp.send();
                }
            });
        });