$(document).ready(function () {
    // 1. 초기 상태 설정
    // 모든 타임라인 섹션 표시 (기존 hide 로직 제거)
    $('.timeline-section').show();

    // Mobile Menu Toggle
    $(document).on('click', '.mobile-menu-btn', function () {
        $('.gnb').toggleClass('active');

        // 메뉴 열렸을 때 스크롤 방지
        if ($('.gnb').hasClass('active')) {
            $('body').css('overflow', 'hidden');
        } else {
            $('body').css('overflow', '');
        }
    });

    // Submenu Accordion - Mobile Only (PC는 CSS hover로 처리)
    $(document).on('click', '.nav-link', function (e) {
        if (window.innerWidth <= 768) {
            e.preventDefault();
            const $parent = $(this).closest('.nav-item');

            // Close other open menus
            $('.nav-item').not($parent).removeClass('active');

            // Toggle current menu
            $parent.toggleClass('active');
        }
    });

    // 메뉴 외부 클릭 시 서브메뉴 닫기 (Mobile only)
    $(document).on('click', function (e) {
        if (window.innerWidth <= 768 && !$(e.target).closest('.gnb').length) {
            $('.nav-item').removeClass('active');
        }
    });

    // 화면 리사이즈 시 모바일 메뉴 초기화
    $(window).resize(function () {
        if (window.innerWidth > 768) {
            $('.gnb').removeClass('active');
            $('body').css('overflow', '');
            $('.nav-item').removeClass('active');
        }
    });

    // 2. 탭 클릭 이벤트 핸들러 (Bookmark Scroll)
    // Timeline tabs
    $('.tab-btn').on('click', function () {
        const period = $(this).data('period');
        const targetSection = $(`.timeline-${period}`);

        if (targetSection.length) {
            $('html, body').animate({
                scrollTop: targetSection.offset().top
            }, 500);
        }
    });

    // Solution tabs (Anyworks page)
    $('.solution-btn').on('click', function () {
        // Add active class to clicked button and remove from siblings
        $(this).addClass('active').siblings().removeClass('active');

        const period = $(this).data('period');
        // Match .info-intro.solution.[prm, srm, etc]
        const targetSection = $(`.info-intro.solution.${period}`);

        if (targetSection.length) {
            // Offset for fixed header/tab bar if needed
            const offset = 100;
            $('html, body').animate({
                scrollTop: targetSection.offset().top - offset
            }, 500);
        }
    });

    // 3. 스크롤 스파이 (Scroll Spy) & 타임라인 라인 컬러링
    $(window).on('scroll', function () {
        const scrollPos = $(window).scrollTop();
        const windowHeight = $(window).height();
        const screenCenter = scrollPos + (windowHeight / 2);

        // 헤더 높이 등을 고려한 오프셋 (필요 시 조정)
        const offset = 100;

        // 3-1. 섹션 네비게이션 활성화 (기존 로직)
        $('.timeline-section').each(function () {
            const currentSection = $(this);
            const sectionTop = currentSection.offset().top - offset;
            const sectionBottom = sectionTop + currentSection.outerHeight();

            // 현재 스크롤 위치가 섹션 범위 내에 있으면
            if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
                // 해당 섹션의 클래스명에서 period 추출 (ex: timeline-innovation -> innovation)
                let sectionClass = currentSection.attr('class').split(' ').find(cls => cls.startsWith('timeline-') && cls !== 'timeline-section');
                if (sectionClass) {
                    let period = sectionClass.replace('timeline-', '');

                    // 탭 활성화 상태 업데이트
                    if (!$(`.tab-btn[data-period="${period}"]`).hasClass('active')) {
                        $('.tab-btn').removeClass('active');
                        $(`.tab-btn[data-period="${period}"]`).addClass('active');
                    }
                }
            }
        });

        // 3-2. 타임라인 년도별 라인 컬러링 (화면 중앙 기준)
        $('.timeline-year').each(function () {
            const $this = $(this);
            const offsetTop = $this.offset().top;

            // 요소가 화면 중앙선보다 위에 있으면 (.active 추가 -> 파란색)
            // 요소가 화면 중앙선보다 아래에 있으면 (.active 제거 -> 회색)
            if (offsetTop < screenCenter) {
                $this.addClass('active');
            } else {
                $this.removeClass('active');
            }
        });

        // 4. Period Tabs Visibility Control
        // timeline-hero history_bg1 영역이 화면 상단에 닿을 때 탭 보이기
        const targetHero = $('.timeline-hero.history_bg1');
        if (targetHero.length) {
            const heroTop = targetHero.offset().top;

            // 스크롤 위치가 히어로 영역 상단보다 크거나 같으면 (화면 위로 붙었을 때)
            if (scrollPos >= heroTop) {
                $('.period-tabs-wrapper').addClass('visible');
            } else {
                $('.period-tabs-wrapper').removeClass('visible');
            }
        }

        // 5. Solution Tabs Scroll Spy (Anyworks Page)
        // Only run if solution tabs exist
        if ($('.solution-tabs-wrapper').length) {
            let activePeriod = null;
            $('.info-intro.solution').each(function () {
                const currentSection = $(this);
                // Adjust offset to trigger slightly before the section hits top
                const sectionTop = currentSection.offset().top - offset - 100;

                // If scrolled past this section header
                if (scrollPos >= sectionTop) {
                    const classes = currentSection.attr('class').split(' ');
                    for (let i = 0; i < classes.length; i++) {
                        if (classes[i] !== 'info-intro' && classes[i] !== 'solution') {
                            activePeriod = classes[i];
                            break;
                        }
                    }
                }
            });

            if (activePeriod) {
                // Update active tab only if it changes
                const currentActive = $('.solution-btn.active').data('period');
                if (currentActive !== activePeriod) {
                    $('.solution-btn').removeClass('active');
                    $(`.solution-btn[data-period="${activePeriod}"]`).addClass('active');
                }
            }
        }
    });

    // 5. Solution Tabs Visibility Control (Anyworks Page)
    const solutionTabs = $('.solution-tabs-wrapper');
    const solutionTitle = $('.info-title'); // The H1 "Anyworks®"

    if (solutionTabs.length && solutionTitle.length) {
        // Check on scroll
        $(window).on('scroll', function () {
            const scrollPos = $(window).scrollTop();
            // Trigger when the H1 is close to the top (e.g., header height offset)
            // Adjust offset as needed. 
            // If we want it to appear *as* the H1 leaves the top, or *as* it enters?
            // "h1 이 보일경우" -> When H1 is visible.
            // Let's make it appear when we scroll PAST the H1, effectively "docking" it? 
            // Or if they want it ON SCREEN when H1 is ON SCREEN?
            // Usually sticky nav appears when you scroll down to the content.
            // Let's set it to appear when scroll reaches the H1's top position minus some offset.

            const titleTop = solutionTitle.offset().top;
            const triggerPoint = titleTop - 100; // Appeart slightly before/at H1

            if (scrollPos >= triggerPoint) {
                solutionTabs.addClass('visible');
            } else {
                solutionTabs.removeClass('visible');
            }
        });
    }

    // 5. Hero Title Typing Effect (with sequential description typing)
    const $heroContent = $('.history-hero-content');
    const $heroTitle = $('.hero-title');
    const $heroDesc = $('.history-hero-content > p'); // Select the direct child p of hero content

    // Hide hero content initially
    if ($heroContent.length) {
        $heroContent.css('opacity', '0');
    }

    // Generalized typeWriter function
    function typeWriterEffect($element, originalHtml, typeSpeed, onComplete) {
        $element.html(''); // Clear
        let charIndex = 0;

        function type() {
            if (charIndex < originalHtml.length) {
                const char = originalHtml.charAt(charIndex);

                // Handle HTML tags
                if (char === '<') {
                    const tagEndIndex = originalHtml.indexOf('>', charIndex);
                    if (tagEndIndex !== -1) {
                        const htmlTag = originalHtml.substring(charIndex, tagEndIndex + 1);
                        $element.append(htmlTag);
                        charIndex = tagEndIndex + 1;
                    }
                } else {
                    $element.append(char);
                    charIndex++;
                }

                setTimeout(type, typeSpeed);
            } else {
                // Typing complete, call callback if provided
                if (typeof onComplete === 'function') {
                    onComplete();
                }
            }
        }
        type();
    }

    if ($heroTitle.length) {
        const originalTitleHtml = $heroTitle.html().trim();
        const originalDescHtml = $heroDesc.length ? $heroDesc.html().trim() : null;

        // Hide description initially
        if ($heroDesc.length) {
            $heroDesc.html('');
        }

        // Start title typing after a short delay
        setTimeout(function () {
            // Show hero content before typing starts
            if ($heroContent.length) {
                $heroContent.css({
                    'opacity': '1',
                    'transition': 'opacity 0.3s ease'
                });
            }

            typeWriterEffect($heroTitle, originalTitleHtml, 80, function () {
                // After title completes, type description if exists
                if (originalDescHtml) {
                    typeWriterEffect($heroDesc, originalDescHtml, 40, null);
                }
            });
        }, 500);
    }
});


//introduction
// Number counting animation on scroll
document.addEventListener('DOMContentLoaded', function () {
    const numberInfo = document.querySelector('.number-info');
    const numbers = document.querySelectorAll('.num-title.counter'); // Only elements with both classes
    let hasAnimated = false;

    // Function to animate counting
    function animateCount(element, target, duration = 2000) {
        const text = element.textContent;
        const numberMatch = text.match(/\d+/);

        if (!numberMatch) return;

        const targetValue = parseInt(numberMatch[0]);
        const startValue = 0;
        const startTime = performance.now();

        // Store the original HTML with <em> tags
        const originalHTML = element.innerHTML;
        const prefix = text.substring(0, numberMatch.index);
        const suffix = text.substring(numberMatch.index + numberMatch[0].length);

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (easeOutExpo)
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

            const currentValue = Math.floor(startValue + (targetValue - startValue) * easeProgress);

            // Update only the number part, keeping the original HTML structure
            element.innerHTML = originalHTML.replace(/\d+/, currentValue);

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                // Ensure final value is exact
                element.innerHTML = originalHTML;
            }
        }

        requestAnimationFrame(update);
    }

    // Intersection Observer for scroll trigger
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                hasAnimated = true;

                // Animate each number with slight delay
                numbers.forEach((number, index) => {
                    setTimeout(() => {
                        animateCount(number, 2000);
                    }, index * 100); // Stagger animation by 100ms
                });
            }
        });
    }, {
        threshold: 0.5 // Trigger when element reaches center of viewport (50% visible)
    });

    if (numberInfo) {
        observer.observe(numberInfo);
    }
});
