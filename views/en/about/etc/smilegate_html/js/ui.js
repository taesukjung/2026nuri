/*lnb 숨기고 보이기*/
function menu_lnb(){
    var css=$(".lnb_area").css("display");
    if(css=="block"){
        $(".lnb_area").hide();
        $(".content_wrap").addClass("lnb_hide");
        $('#btn a img').attr("src","images/common/btn_leftmenu_open.gif");
    }else if(css=="none"){
        $(".lnb_area").show();
        $(".content_wrap").removeClass("lnb_hide");
        $('#btn a img').attr("src","images/common/btn_leftmenu.gif");
    }
}

/* lnb */
(function($){

  var lnbUI = {
    click : function (target, speed) {
      var _self = this,
          $target = $(target);
      _self.speed = speed || 300;

      $target.each(function(){
        if(findChildren($(this))) {
          return;
        }
        $(this).addClass('noDepth');
      });

      function findChildren(obj) {
        return obj.find('> ul').length > 0;
      }

      $target.on('click','a', function(e){
          e.stopPropagation();
          var $this = $(this),
              $depthTarget = $this.next(),
              $siblings = $this.parent().siblings();

        $this.parent('li').find('ul li').removeClass('on');
        $siblings.removeClass('on');
        $siblings.find('ul').slideUp(250);

        if($depthTarget.css('display') == 'none') {
          _self.activeOn($this);
          $depthTarget.slideDown(_self.speed);
        } else {
          $depthTarget.slideUp(_self.speed);
          _self.activeOff($this);
        }

      })

    },
    activeOff : function($target) {
      $target.parent().removeClass('on');
    },
    activeOn : function($target) {
      $target.parent().addClass('on');
    }
  };

  // Call lnbUI
  $(function(){
    lnbUI.click('#lnb li', 300)
  });

}(jQuery));


//팝업창_프로젝트
$(function(){
    $('.memu_pro a').on('click', function(e){
		var $self = $(this);

		$(this).toggleClass('open');
		if( $(this).is('.open')) {
			$(".menu_pro_info").show();
		} else {
			$(".menu_pro_info").hide();
		}
		e.preventDefault();
	});
})
//팝업창_dataTables_length
$(function(){
    $('.dataTables_length a').on('click', function(e){
		var $self = $(this);

		$(this).toggleClass('open');
		if( $(this).is('.open')) {
			$(".dataTables_length_info").show();
		} else {
			$(".dataTables_length_info").hide();
		}
		e.preventDefault();
	});
})
//팝업창_instance
$(function(){
    $('.instance a').on('click', function(e){
		var $self = $(this);

		$(this).toggleClass('open');
		if( $(this).is('.open')) {
			$(".instance_info").show();
		} else {
			$(".instance_info").hide();
		}
		e.preventDefault();
	});
})
//팝업창_instance_more
$(function(){
    $('.instance_more a').on('click', function(e){
		var $self = $(this);

		$(this).toggleClass('open');
		if( $(this).is('.open')) {
			$(".instance_more_info").show();
		} else {
			$(".instance_more_info").hide();
		}
		e.preventDefault();
	});
})

//table th 정렬
$.fn.alternateRowColors = function() {
    $('tbody tr:odd', this).removeClass('even').addClass('odd');
    $('tbody tr:even', this).removeClass('odd').addClass('even');
    return this;
};


$(document).ready(function() {
    $('table.sort').each(function() {
        var $table = $(this);
        // 플러그인 호출
        $table.alternateRowColors(); 

        // 테이블 헤더 정렬

        $('th', $table).each(function(column) {
            // 헤더의 CSS 클래스가 sort-alpha로 설정되어있다면, ABC순으로 정렬
            if ($(this).is('.sort-alpha')) {
                // 클릭시 정렬 실행
                var direction = -1;
                $(this).click(function() {
                    direction = -direction;
                    var rows = $table.find('tbody > tr').get(); // 현재 선택된 헤더관련 행 가져오기
                    // 자바스크립트의 sort 함수를 사용해서 오름차순 정렬
                    rows.sort(function(a, b) {
                        var keyA = $(a).children('td').eq(column).text().toUpperCase();
                        var keyB = $(b).children('td').eq(column).text().toUpperCase(); 

                        if (keyA < keyB) return -direction;
                        if (keyA > keyB) return direction;
                        return 0;
                    });
                    //정렬된 행을 테이블에 추가
                    $.each(rows, function(index, row) { $table.children('tbody').append(row) });
                    $table.alternateRowColors(); // 재정렬
                });
            }
        }); // end table sort
    }); // end each()
});   // end ready()

//툴팁
$(function(){
    $(".tooltip").mouseover(function(){
        $(".tooltip_info").fadeIn();
    }).mouseout(function(){
        $(".tooltip_info").fadeOut();
    });
});
