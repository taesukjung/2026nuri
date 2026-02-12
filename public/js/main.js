$(document).ready(function () {
    // 1. 공통 레이아웃 로드 (Cache Busting added)
    // 1. 공통 레이아웃 로드 (Server-side Include로 변경됨)
    // $('#gnb-include').load('/views/layout/landing-nav.html?v=' + new Date().getTime());
    // $('#footer-include').load('/views/layout/landing-footer.html?v=' + new Date().getTime());

    // 2. 주요 요소 및 상태 변수 선언
    const statsSection = document.getElementById('stats-section');
    const statsContainer = document.querySelector('.stats-container');
    const statCards = document.querySelectorAll('.stat-card');
    const landingWrapper = document.getElementById('landing-wrapper');

    let statsAnimated = false;
    let isMobile = window.innerWidth <= 768;

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

    // Hero Text Rotation Logic
    // num1 -> num2 -> num3 순서 보장
    const heroContents = [

        document.querySelector('.hero-content.num1'),
        document.querySelector('.hero-content.num2'),
        document.querySelector('.hero-content.num3')
    ].filter(el => el !== null); // 존재하는 요소만 필터링

    let currentHeroIndex = 0;

    if (heroContents.length > 0) {
        // 모든 요소에서 active 제거 및 첫 번째 요소 활성화
        heroContents.forEach(el => el.classList.remove('active'));
        heroContents[0].classList.add('active');

        // 각 텍스트별 표시 시간 설정 (ms)
        const durations = [5000, 8000, 5000];

        function rotateHeroText() {
            // 현재 활성화된 텍스트의 지속 시간만큼 대기
            setTimeout(() => {
                heroContents[currentHeroIndex].classList.remove('active');
                currentHeroIndex = (currentHeroIndex + 1) % heroContents.length;
                heroContents[currentHeroIndex].classList.add('active');

                // 재귀 호출
                rotateHeroText();
            }, durations[currentHeroIndex]);
        }

        // 초기 시작
        rotateHeroText();
    }


    // 화면 리사이즈 시 초기화
    $(window).resize(function () {
        if (window.innerWidth > 768) {
            $('.gnb').removeClass('active');
            $('body').css('overflow', '');
        }
    });

    // 2-1. News Data 로드 (Ported from index.html)
    function loadNewsData() {
        $.ajax({
            url: '/bbs/list',
            dataType: 'json',
            type: 'GET',
            data: {
                "search_text": "",
                "b_category": "",
                "b_page": 1
            },
            success: function (result) {
                $("#data_body").empty();

                if (result.BBS_LIST && result.BBS_LIST.length > 0) {
                    var results = result.BBS_LIST;

                    // 날짜 파싱 (안전 처리)
                    var dateStr = results[0].b_date || "2024-01-01";
                    var year = dateStr.substring(0, 4);
                    var month = dateStr.substring(5, 7);

                    var str = '<div class="title">' + year + '<b>.' + month + '</b></div><ul>';

                    // 최대 2개만 표시 (index.html 로직 참조)
                    for (var i = 0; i < Math.min(results.length, 2); i++) {
                        str += "<li><a href='/bbs/notice/view?b_id=" + results[i].b_id + "'>" + results[i].b_subject
                            + "<span>" + results[i].b_date + '</span></a></li>';
                    }
                    str += '</ul>';

                    $("#data_body").html(str);
                }
            },
            error: function (err) {
                console.error("News Load Error:", err);
            }
        });
    }

    // 뉴스 데이터 로드 실행
    loadNewsData();

    // 3. Intersection Observer (일반 섹션 등장용)
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    const sections = document.querySelectorAll('.full-section');
    sections.forEach(section => observer.observe(section));
    if (sections.length > 0) sections[0].classList.add('visible');

    // 4. 숫자 카운팅 함수 (중앙 도달 시 실행)
    // 4. 숫자 카운팅 함수 제거됨 (사용자 요청)

    // 5. 스크롤 인터랙션 로직 (requestAnimationFrame 적용)
    let isTicking = false;
    let lastScrollY = 0;

    // 최적화를 위해 DOM 요소 캐싱
    const productsSection = document.getElementById('products-section');
    const productsRight = document.querySelector('.products-right');
    const productsLeft = document.querySelector('.products-left');
    const cubeDecorations = document.querySelectorAll('.cube-decoration');

    const handleScrollUpdate = () => {
        // Stats 섹션 인터랙션
        if (statsSection && statsContainer) {
            const rect = statsSection.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const sectionHeight = rect.height;

            // 섹션이 화면 영역 내에 있거나 근처일 때만 계산
            // Sticky 영역 전체 진행률 (0 ~ 1)
            if (rect.bottom > 0 && rect.top < windowHeight) {
                const scrollDistance = sectionHeight - windowHeight;
                let rawProgress = 0;

                if (rect.top <= 0) {
                    rawProgress = Math.abs(rect.top) / scrollDistance;
                    rawProgress = Math.min(Math.max(rawProgress, 0), 1);
                }

                // --- Phase 1: Intro Animation (0% ~ 30%) ---
                // 배경 이미지와 텍스트 오버랩 효과 (PC Only)
                const introThreshold = 0.3;
                let introProgress = 0;

                if (!isMobile) {
                    if (rawProgress < introThreshold) {
                        introProgress = rawProgress / introThreshold; // 0 ~ 1
                    } else {
                        introProgress = 1;
                    }

                    // 텍스트 스케일업 & 블러 & 투명도 (Zoom In & Blur & Fade Out)
                    const textScale = 1 + (introProgress * 50);
                    const textOpacity = 1 - Math.pow(introProgress, 3);
                    const textBlur = introProgress * 20;

                    const bgOpacity = introProgress;
                    const bgScale = 1.5 - (rawProgress * 0.3);

                    statsSection.style.setProperty('--text-scale', textScale);
                    statsSection.style.setProperty('--text-opacity', textOpacity);
                    statsSection.style.setProperty('--text-blur', `${textBlur}px`);
                    statsSection.style.setProperty('--bg-opacity', bgOpacity);
                    statsSection.style.setProperty('--bg-scale', bgScale);
                } else {
                    // Mobile: Intro 효과 없음 (바로 배경 보임)
                    statsSection.style.setProperty('--text-opacity', 0);
                    statsSection.style.setProperty('--bg-opacity', 1);
                    statsSection.style.setProperty('--bg-scale', 1);
                }

                // --- Phase 2: Content Scroll (30% ~ 100%) ---
                // 카드 가로/세로 이동
                if (rawProgress >= introThreshold || isMobile) { // 모바일은 intro 무시하고 바로 스크롤 가능하게
                    // PC: 0.3 ~ 1.0 구간을 0 ~ 1로 재매핑
                    let contentProgress = 0;
                    if (!isMobile) {
                        contentProgress = (rawProgress - introThreshold) / (1 - introThreshold);
                    } else {
                        // Mobile: 전체 구간 사용
                        contentProgress = rawProgress;
                    }

                    if (!isMobile) {
                        // Desktop: Horizontal Scroll
                        const totalWidth = statsContainer.scrollWidth;
                        const viewWidth = window.innerWidth;
                        const startX = viewWidth;
                        const endX = -totalWidth;
                        const moveX = startX + (contentProgress * (endX - startX));

                        statsContainer.style.transform = `translateX(${moveX}px)`;

                        // 3. Center Focus Animation (PC Only)
                        statCards.forEach((card) => {
                            const cardCenter = moveX + card.offsetLeft + (card.offsetWidth / 2);
                            const relativePos = cardCenter / viewWidth;

                            // Center Peak Logic
                            const distFromCenter = Math.abs(0.5 - relativePos);
                            const maxDist = 0.5;
                            const ratio = 1 - (distFromCenter / maxDist);

                            let scale = 0.7 + (ratio * 0.5);
                            scale = Math.max(0.7, Math.min(scale, 1.2));

                            if (scale > 1.1) {
                                card.classList.add('active');
                            } else {
                                card.classList.remove('active');
                            }

                            card.style.transform = `scale(${scale})`;
                        });

                    } else {
                        // Mobile: Vertical Scroll
                        const totalHeight = statsContainer.scrollHeight;
                        const moveY = -(contentProgress * (totalHeight - windowHeight));

                        statsContainer.style.transform = `translateY(${moveY}px)`;

                        // Mobile Reset
                        statCards.forEach(card => {
                            card.style.transform = 'scale(1)';
                            card.classList.remove('active');
                        });
                    }

                } else {
                    // Intro 구간에서는 카드 이동 대기 (화면 밖 또는 초기 위치)
                    if (!isMobile) {
                        const viewWidth = window.innerWidth;
                        statsContainer.style.transform = `translateX(${viewWidth}px)`;

                        // 초기화
                        statCards.forEach(card => card.style.transform = 'scale(1)');
                    } else {
                        statsContainer.style.transform = `translateY(0px)`;
                    }
                }
            }
        }

        // Products 섹션 인터랙션
        // Products 섹션 인터랙션 (Mobile Scroll-Driven & PC Animation)
        if (productsSection) {
            const rect = productsSection.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const sectionHeight = rect.height;

            // Mobile: Scroll-Driven Horizontal Movement
            if (isMobile) {
                // 섹션이 화면에 진입했는지 확인
                if (rect.top <= 0 && rect.bottom >= windowHeight) {
                    // Sticky 영역 내에서의 진행률 (0 ~ 1)
                    // 전체 움직일 거리 = 섹션 높이 - 화면 높이
                    const scrollDistance = sectionHeight - windowHeight;
                    const scrolled = Math.abs(rect.top);
                    let progress = scrolled / scrollDistance;
                    progress = Math.min(Math.max(progress, 0), 1); // 0~1 클램핑

                    // 가로 이동 거리 계산
                    // 이동해야 할 전체 너비: 컨테이너 전체 너비 - 화면 너비 + 여백
                    // 하지만 카드들이 오른쪽 끝까지 가야하므로 정확한 계산 필요
                    // 간단하게: (컨테이너 전체 폭 - 화면 폭 + 여백) * progress

                    const productsRight = document.querySelector('.products-right');
                    if (productsRight) {
                        const totalWidth = productsRight.scrollWidth;
                        const viewWidth = window.innerWidth;
                        // 오른쪽 끝까지 이동 (약간의 패딩 고려)
                        const maxTranslate = totalWidth - viewWidth + 40;
                        const moveX = -(progress * maxTranslate);

                        productsRight.style.transform = `translateX(${moveX}px)`;
                    }
                } else if (rect.top > 0) {
                    // 아직 도달 전 -> 0
                    if (productsRight) productsRight.style.transform = `translateX(0px)`;
                }
            } else {
                // PC: Existing Animation (if any) or Reset
                // 기존 로직 유지 (배경 스케일 등)
                if (rect.top < windowHeight && rect.bottom > 0) {
                    const totalDistance = windowHeight + rect.height;
                    const currentPos = windowHeight - rect.top;
                    let progress = currentPos / totalDistance;

                    const bgScale = 1.2 - (progress * 0.2);
                    productsSection.style.setProperty('--bg-scale-products', bgScale);

                    // PC Center Focus Logic
                    const productItems = document.querySelectorAll('.product-item');
                    const viewCenter = window.innerHeight / 2;

                    productItems.forEach(item => {
                        const box = item.getBoundingClientRect();
                        const itemCenter = box.top + (box.height / 2);
                        const dist = Math.abs(viewCenter - itemCenter);

                        // 중앙에서 250px 이내에 들어오면 활성화 (Highlight Range)
                        if (dist < 250) {
                            item.classList.add('active');
                        } else {
                            item.classList.remove('active');
                        }
                    });
                }
            }
        }

        // 큐브 데코레이션 패럴랙스
        const scrolled = lastScrollY;
        cubeDecorations.forEach(cube => {
            // jQuery .css() 대신 native style 사용
            cube.style.transform = `translateY(${-(scrolled * 0.15)}px)`;
        });

        isTicking = false;
    };

    const onScroll = () => {
        lastScrollY = landingWrapper ? landingWrapper.scrollTop : window.scrollY;
        if (!isTicking) {
            window.requestAnimationFrame(handleScrollUpdate);
            isTicking = true;
        }
    };

    // 6. 이벤트 리스너 등록
    const scrollTarget = landingWrapper || window;
    scrollTarget.addEventListener('scroll', onScroll, { passive: true }); // passive 옵션으로 성능 향상

    // 7. 기타 UI 인터랙션 (네비게이션 등)
    $('a[href^="#"]').on('click', function (e) {
        const target = $(this.getAttribute('href'));
        if (target.length) {
            e.preventDefault();
            const scrollPos = landingWrapper ? target.offset().top + landingWrapper.scrollTop : target.offset().top;
            $(landingWrapper || 'html, body').stop().animate({ scrollTop: scrollPos }, 1200);
        }
    });

    window.addEventListener('resize', () => {
        isMobile = window.innerWidth <= 768;
    });

    // 8. Products Section - Drag to Scroll (PC)
    const slider = document.querySelector('.products-right');
    let isDown = false;
    let startX;
    let scrollLeft;

    if (slider) {
        slider.addEventListener('mousedown', (e) => {
            if (isMobile) return; // 모바일에서는 드래그 스크롤 비활성화 (Make native scroll work)
            isDown = true;
            slider.style.cursor = 'grabbing';
            // 드래그 중에는 스냅 해제 (부드러운 이동)
            slider.style.scrollSnapType = 'none';
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });

        slider.addEventListener('mouseleave', () => {
            if (isDown) {
                isDown = false;
                slider.style.cursor = 'grab';
                // 드래그 끝나면 스냅 복구
                slider.style.scrollSnapType = 'x mandatory';
            }
        });

        slider.addEventListener('mouseup', () => {
            isDown = false;
            slider.style.cursor = 'grab';
            slider.style.scrollSnapType = 'x mandatory';
        });

        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            if (isMobile) return; // 모바일 무시
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 2; // 스크롤 속도 조절 (2배)
            slider.scrollLeft = scrollLeft - walk;
        });

        // 초기 커서 설정
        slider.style.cursor = 'grab';
    }

    // 9. Stats Section Mobile Animation (Fade In Up)
    if (isMobile) {
        const mobileStatCards = document.querySelectorAll('.stat-card');

        const mobileObserverOptions = {
            threshold: 0.15 // 15% 보일 때 트리거
        };

        const mobileStatObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible-mobile');
                    observer.unobserve(entry.target); // 한 번만 실행
                }
            });
        }, mobileObserverOptions);

        mobileStatCards.forEach(card => {
            mobileStatObserver.observe(card);
        });
    }
});