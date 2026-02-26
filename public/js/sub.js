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

    // Solution tabs (Anyworks page) - Logic moved to specific block below


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
        const targetHero = $('.timeline-hero.history_bg1');
        if (targetHero.length) {
            const heroTop = targetHero.offset().top;
            if (scrollPos >= heroTop) {
                $('.period-tabs-wrapper').addClass('visible');
            } else {
                $('.period-tabs-wrapper').removeClass('visible');
            }
        }

        // 5. Hero Advanced Background Effects (Parallax, Blur, Dim)
        const $hero = $('.history-hero');
        if ($hero.length) {
            const speed = 0.3;
            const yPos = scrollPos * speed;

            // Calculate blur and dimming based on scroll position
            // Dimming: 1.0 (top) down to 0.3 (at 1vh scroll)
            const opacity = Math.max(0.3, 1 - (scrollPos / (windowHeight * 0.8)));
            // Blur: 0px (top) up to 10px
            const blur = Math.min(10, scrollPos / 50);

            $hero[0].style.setProperty('--parallax-y', `${yPos}px`);
            $hero[0].style.setProperty('--hero-opacity', opacity);
            $hero[0].style.setProperty('--hero-blur', `${blur}px`);
        }
    });

    // 6. Mouse-follow Interactive Parallax (Desktop Only)
    $('.history-hero').on('mousemove', function (e) {
        if (window.innerWidth > 1024) {
            const $this = $(this);
            const moveX = (e.pageX - window.innerWidth / 2) / 50;
            const moveY = (e.pageY - window.innerHeight / 2) / 50;

            // Move background slightly opposite to mouse movement for depth
            // We combine this with the scroll parallax in CSS by using center + moveX
            $this[0].style.setProperty('--parallax-x', `calc(50% + ${-moveX}px)`);
        }
    });

    // 5. Solution Tabs Logic (Anyworks Page)
    if ($('.solution-tabs-wrapper').length) {
        const $glider = $('.glider');

        function updateGlider($targetBtn) {
            const $activeBtn = $targetBtn || $('.solution-btn.active');
            if ($activeBtn.length && $glider.length) {
                // Calculate position relative to the parent .solution-tabs
                $glider.css({
                    'width': $activeBtn.outerWidth(),
                    'height': $activeBtn.outerHeight(),
                    'left': $activeBtn[0].offsetLeft,
                    'top': $activeBtn[0].offsetTop,
                    'opacity': 1
                });
            }
        }

        // Initial call and resize
        setTimeout(function () { updateGlider(); }, 100);
        $(window).on('resize', function () { updateGlider(); });

        let isManualScrolling = false;
        let activeTimeout = null; // Store timeout ID

        // Click handler handles its own active class toggling, but needs to update glider
        $('.solution-btn').on('click', function () {
            const $this = $(this);
            const period = $this.data('period');
            const targetSection = $(`.info-intro.solution.${period}`);

            // Clear any pending timeout just in case
            if (activeTimeout) clearTimeout(activeTimeout);

            if (targetSection.length) {
                const offset = 100;
                isManualScrolling = true; // Disable scroll spy

                // Animate scroll first
                $('html, body').stop().animate({ // Stop previous animation
                    scrollTop: targetSection.offset().top - offset
                }, 500, function () {
                    // Animation complete: Apply active state and move glider
                    $this.addClass('active').siblings().removeClass('active');
                    updateGlider($this);

                    isManualScrolling = false; // Re-enable scroll spy
                });
            } else {
                // Fallback if section not found (shouldn't happen)
                $this.addClass('active').siblings().removeClass('active');
                updateGlider($this);
            }
        });

        // Scroll Spy Logic
        $(window).on('scroll', function () {
            if (isManualScrolling) return; // Skip if manually scrolling

            const scrollPos = $(window).scrollTop();
            const offset = 100;
            let activePeriod = null;

            $('.info-intro.solution').each(function () {
                const currentSection = $(this);
                const sectionTop = currentSection.offset().top - offset - 100;

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
                const currentActive = $('.solution-btn.active').data('period');
                if (currentActive !== activePeriod) {
                    $('.solution-btn').removeClass('active');
                    $(`.solution-btn[data-period="${activePeriod}"]`).addClass('active');
                    updateGlider();
                }
            }
        });
    }

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

// info-competency-card, info-case-card 스크롤 시 순차적 등장 효과
document.addEventListener('DOMContentLoaded', function () {
    // 화면의 20% 정도 카드가 보였을 때 애니메이션 작동
    const cardObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // 한번 나타난 후에는 재생하지 않으려면 아래 주석 해제 (현재는 주석 처리되어 스크롤할 때마다 효과 발생)
                // observer.unobserve(entry.target); 
            }
        });
    }, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });

    // 각 그리드 구역별로 카드를 찾아서 순서대로(왼쪽에서 오른쪽) 딜레이 부여
    const grids = document.querySelectorAll('.info-competency-grid, .info-case-grid');
    grids.forEach(grid => {
        const cards = grid.querySelectorAll('.info-competency-card, .info-case-card');
        cards.forEach((card, index) => {
            card.style.transitionDelay = `${index * 0.15}s`;
            cardObserver.observe(card);
        });
    });
});

