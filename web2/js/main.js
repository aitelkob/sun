
;(function(window) {

	'use strict';
	function getMousePos(e) {
		var posx = 0, posy = 0;
		if (!e) var e = window.event;
		if (e.pageX || e.pageY) 	{
			posx = e.pageX;
			posy = e.pageY;
		}
		else if (e.clientX || e.clientY) 	{
			posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}
		return { x : posx, y : posy }
	}
	
	
	var gridItems = [].slice.call(document.querySelectorAll('.grid > .grid__item > .grid__link')),
		
		itemsTotal = gridItems.length,
		
		current = -1,
		
		vision = document.querySelector('.vision'),
		
		swoosh = vision.querySelector('.vision__swoosh'),
		
		items = [].slice.call(vision.querySelectorAll('.vision__items > .vision__item')),
		
		nav = vision.querySelector('nav'),
		
		navctrls = {
			prev: nav.querySelector('.nav__arrows > .btn--prev'),
			next: nav.querySelector('.nav__arrows > .btn--next'),
			toggle: nav.querySelector('button.btn--hide')
		},
		
		backCtrl = vision.querySelector('button.btn--grid'),
		
		navItems = nav.querySelectorAll('.nav__items > .nav__item'),
		
		isNavigating,
		
		bgEl = vision.querySelector('.vision__background'),
		
		modesCtrls = [].slice.call(vision.querySelectorAll('.modes > button')),
		
		modesCtrlsCurrent = vision.querySelector('.modes > button.mode--current'),
		
		bgmode = modesCtrlsCurrent.getAttribute('data-bg'),
		
		flash = vision.querySelector('.vision__flash'),
		
		onEndAnimation = function(el, callback) {
			var onEndCallbackFn = function(ev) {
				this.removeEventListener('animationend', onEndCallbackFn);
				if( callback && typeof callback === 'function' ) { callback.call(); }
			};
			el.addEventListener('animationend', onEndCallbackFn);
		},
		win = {width: window.innerWidth, height: window.innerHeight},
		lookCool, glassesOn;

	/**
	 * Init things..
	 */
	function init() {
		initEvents();
	}

	/**
	 * Init/Bind events.
	 */
	function initEvents() {
		
		
		gridItems.forEach(function(item, pos) {
			item.addEventListener('click', function(ev) {
				ev.preventDefault();
				
				current = pos;
				
				openPreview();
			});
		});

		
		navctrls.next.addEventListener('click', function() {navigate('next');});
		navctrls.prev.addEventListener('click', function() {navigate('prev');});

		
		navctrls.toggle.addEventListener('click', toggleGlasses);

		
		backCtrl.addEventListener('click', closePreview);

		
		modesCtrls.forEach(function(ctrl) {
			ctrl.addEventListener('click', switchMode);
		});
	}

	/**
	 * Opens the lookthrough preview and shows the details for the selected item
	 */
	function openPreview() {
		
		var item = items[current],
			
			itemOverlay = item.querySelector('.vision__overlay');

		
		vision.classList.add('vision--swooshIn');
		
		onEndAnimation(swoosh, function() {
			initTilt();
			
			vision.classList.add('vision--loading');
			
			setTimeout(function() {
				
				vision.classList.remove('vision--loading');
				
				vision.classList.add('vision--loaded');
				vision.classList.add('vision--swooshOut');
				
				onEndAnimation(swoosh, function() {
					
					vision.classList.remove('vision--swooshIn');
					vision.classList.remove('vision--swooshOut');
					
					item.classList.add('vision__item--current');
					
					itemOverlay.classList.add('vision__overlay--animIn');

					onEndAnimation(itemOverlay, function() { glassesOn = true; });
				});
			}, 1000);
		});

		
		navItems[current].classList.add('nav__item--current');
	}

	/**
	 * Closes the lookthrough preview. Back to grid view.
	 */
	function closePreview() {
		
		var item = items[current],
			
			itemOverlay = item.querySelector('.vision__overlay');

		
		vision.classList.add('vision--swooshIn');
		onEndAnimation(swoosh, function() {
			if( !glassesOn ) {
				navctrls.toggle.classList.remove('btn--active');
				itemOverlay.classList.remove('vision__overlay--hide');
			}
			else {
				glassesOn = false;
			}
			item.classList.remove('vision__item--current');
			itemOverlay.classList.remove('vision__overlay--animIn');
			navItems[current].classList.remove('nav__item--current');

			vision.classList.remove('vision--loaded');
			vision.classList.remove('vision--swooshIn');
			vision.classList.add('vision--swooshOut');
			onEndAnimation(swoosh, function() {
				vision.classList.remove('vision--swooshOut');
			});
		});
	}

	/**
	 * Navigating through the items.
	 */
	function navigate(dir) {
		
		if( isNavigating ) { return false; }
		isNavigating = true;

		
		var currentItem = items[current],
			currentItemOverlay = currentItem.querySelector('.vision__overlay'),
			currentNavItem = navItems[current];

		
		if( !glassesOn ) {
			navctrls.toggle.classList.remove('btn--active');
			
			currentItemOverlay.classList.remove('vision__overlay--hide');
			glassesOn = true;
		}

		
		if( dir === 'next' ) {
			current = current < itemsTotal - 1 ? current + 1 : 0; 
		}
		else {
			current = current > 0 ? current - 1 : itemsTotal - 1;
		}

		
		var nextItem = items[current],
			nextItemOverlay = nextItem.querySelector('.vision__overlay'),
			nextNavItem = navItems[current];

		
		currentItem.classList.remove('vision__item--current');
		currentItemOverlay.classList.remove('vision__overlay--animIn');
		
		
		currentItemOverlay.classList.add('vision__overlay--animOut');
		
		onEndAnimation(currentItemOverlay, function() {
			
			currentItemOverlay.classList.remove('vision__overlay--animOut');
		});

		
		nextItemOverlay.classList.add('vision__overlay--animIn');
		
		onEndAnimation(nextItemOverlay, function() {
			nextItem.classList.add('vision__item--current');
		});

		
		currentNavItem.classList.add(dir === 'next' ? 'nav__item--animOutDown' : 'nav__item--animOutUp');
		nextNavItem.classList.add(dir === 'next' ? 'nav__item--animInDown' : 'nav__item--animInUp');
		
		onEndAnimation(currentNavItem.querySelector('.nav__item-slide--title'), function() {
			currentNavItem.classList.remove('nav__item--current');
			nextNavItem.classList.add('nav__item--current');
			currentNavItem.classList.remove(dir === 'next' ? 'nav__item--animOutDown' : 'nav__item--animOutUp');
			nextNavItem.classList.remove(dir === 'next' ? 'nav__item--animInDown' : 'nav__item--animInUp');
			isNavigating = false;
		});
	}

	/**
	 * Toggle the glasses.
	 */
	function toggleGlasses() {
		
		var currentItemOverlay = items[current].querySelector('.vision__overlay');
		
		currentItemOverlay.classList.toggle('vision__overlay--animIn');
		
		currentItemOverlay.classList.toggle('vision__overlay--hide');
		
		navctrls.toggle.classList.toggle('btn--active');

		glassesOn = !glassesOn;
	}

	/**
	 * Init the tilt effect.
	 */
	function initTilt() {
		window.addEventListener('mousemove', mousemoveFn);
		window.addEventListener('resize', resizeFn);
	}

	/**
	 * Remove the tilt transform.
	 */
	function removeTilt() {
		bgEl.style.WebkitTransform = bgEl.style.transform = 'translate3d(0,0,0)';
		window.removeEventListener('mousemove', mousemoveFn);
		window.removeEventListener('resize', resizeFn);
	}

	/**
	 * Change bg image.
	 */
	function switchMode(ev) {
		var mode = ev.target.getAttribute('data-bg');
		if( mode === bgmode ) {
			return false
		}
		bgmode = mode;

		flash.classList.add('vision__flash--animIn');
		onEndAnimation(flash, function() {
			vision.querySelector('.vision__background-img--current').classList.remove('vision__background-img--current');
			vision.querySelector('.vision__background-img--' + bgmode).classList.add('vision__background-img--current');
			modesCtrlsCurrent.classList.remove('mode--current');
			modesCtrlsCurrent = ev.target;
			modesCtrlsCurrent.classList.add('mode--current');

			flash.classList.remove('vision__flash--animIn');
			flash.classList.add('vision__flash--animOut');
			onEndAnimation(flash, function() { flash.classList.remove('vision__flash--animOut'); });
		});
	}

	/**
	 * Mousemove event.
	 */
	function mousemoveFn(ev) {
		requestAnimationFrame(function() {
			
			var mousepos = getMousePos(ev),
				
				docScrolls = {left : document.body.scrollLeft + document.documentElement.scrollLeft, top : document.body.scrollTop + document.documentElement.scrollTop},
				
				relmousepos = { x : mousepos.x - docScrolls.left, y : mousepos.y - docScrolls.top },
				
				tVal = {
					x: 0.2*win.width/win.width*relmousepos.x - 0.1*win.width,
					y: 0.2*win.height/win.height*relmousepos.y - 0.1*win.height,
				};

			
			if( glassesOn ) {
				var currentItemOverlay = items[current].querySelector('.vision__overlay');
				if( relmousepos.y > win.height - 40 /* 3em*16 = 48px - a margin of 8 px so that it's always under the navigation */ ) {
					lookCool = true;
					currentItemOverlay.classList.add('vision__overlay--hide');
					currentItemOverlay.classList.add('vision__overlay--animCoolIn');
					currentItemOverlay.classList.remove('vision__overlay--animCoolOut');
				}
				else if( lookCool ){
					lookCool = false;
					currentItemOverlay.classList.remove('vision__overlay--hide');
					currentItemOverlay.classList.remove('vision__overlay--animCoolIn');
					currentItemOverlay.classList.add('vision__overlay--animCoolOut');
					onEndAnimation(currentItemOverlay, function() {currentItemOverlay.classList.remove('vision__overlay--animCoolOut');});
				}
			}

			bgEl.style.WebkitTransform = bgEl.style.transform = 'translate3d(' + -1*tVal.x + 'px, ' + -1*tVal.y + 'px, 0)';
		});
	}

	/**
	 * Resize event.
	 */
	function resizeFn() {
		requestAnimationFrame(function() {
			
			win = {width: window.innerWidth, height: window.innerHeight};
		});
	}

	init();

})(window);
