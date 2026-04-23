/*
	Relativity by Pixelarity
	pixelarity.com | hello@pixelarity.com
	License: pixelarity.com/license
*/

(function ($) {
	var $window = $(window),
		$body = $("body"),
		$header = $("#header"),
		$banner = $("#banner");

	// Breakpoints.
	breakpoints({
		xlarge: ["1281px", "1680px"],
		large: ["981px", "1280px"],
		medium: ["737px", "980px"],
		small: ["481px", "736px"],
		xsmall: ["361px", "480px"],
		xxsmall: [null, "360px"],
	});

	// Play initial animations on page load.
	$window.on("load", function () {
		window.setTimeout(function () {
			$body.removeClass("is-preload");
		}, 100);
	});

	// Tweaks/fixes.

	// Polyfill: Object fit.
	if (!browser.canUse("object-fit")) {
		$(".image[data-position]").each(function () {
			var $this = $(this),
				$img = $this.children("img");

			// Apply img as background.
			$this
				.css("background-image", 'url("' + $img.attr("src") + '")')
				.css("background-position", $this.data("position"))
				.css("background-size", "cover")
				.css("background-repeat", "no-repeat");

			// Hide img.
			$img.css("opacity", "0");
		});
	}

	// Scrolly.
	$(".scrolly").scrolly({
		offset: function () {
			return $header.height() - 5;
		},
	});

	// Header.
	if ($banner.length > 0 && $header.hasClass("alt")) {
		$window.on("resize", function () {
			$window.trigger("scroll");
		});

		$banner.scrollex({
			bottom: $header.outerHeight(),
			terminate: function () {
				$header.removeClass("alt");
			},
			enter: function () {
				$header.addClass("alt");
			},
			leave: function () {
				$header.removeClass("alt");
				$header.addClass("reveal");
			},
		});
	}

	// Banner.

	// Hack: Fix flex min-height on IE.
	if (browser.name == "ie") {
		$window
			.on("resize.ie-banner-fix", function () {
				var h = $banner.height();

				if (h > $window.height()) $banner.css("height", "auto");
				else $banner.css("height", h);
			})
			.trigger("resize.ie-banner-fix");
	}

	// Dropdowns.
	$("#nav > ul").dropotron({
		alignment: "right",
		hideDelay: 350,
		baseZIndex: 100000,
	});

	// Menu.
	$('<a href="#navPanel" class="navPanelToggle">Menu</a>').appendTo($header);

	$(
		'<div id="navPanel">' +
			"<nav>" +
			$("#nav").navList() +
			"</nav>" +
			'<a href="#navPanel" class="close"></a>' +
			"</div>",
	)
		.appendTo($body)
		.panel({
			delay: 500,
			hideOnClick: true,
			hideOnSwipe: true,
			resetScroll: true,
			resetForms: true,
			target: $body,
			visibleClass: "is-navPanel-visible",
			side: "right",
		});
})(jQuery);

const wrapper = document.querySelector(".carousel-wrapper");
const slides = document.querySelectorAll(".carousel-wrapper .post");
const dotsContainer = document.querySelector(".carousel-dots");

let currentSlide = 0;

// Create dots
slides.forEach((_, index) => {
	const dot = document.createElement("div");
	dot.classList.add("carousel-dot");
	if (index === 0) dot.classList.add("active");
	dot.addEventListener("click", () => {
		currentSlide = index;
		updateCarousel();
	});
	dotsContainer.appendChild(dot);
});

function updateCarousel() {
	const offset = -currentSlide * 100;
	wrapper.style.transform = `translateX(${offset}%)`;

	// Update active dot
	document.querySelectorAll(".carousel-dot").forEach((dot, idx) => {
		dot.classList.toggle("active", idx === currentSlide);
	});
}
// NAVIGATION

document.addEventListener("DOMContentLoaded", function () {
	// 1) Only run this on pages that actually have tabs (services.html)
	const slides = document.querySelectorAll(".tab_slide");
	if (!slides.length) {
		// Not on services page → do nothing
		return;
	}

	const resourcesBox = document.querySelector(".resourcesbox");

	function updateResourcesVisibility() {
		if (!resourcesBox) return;

		const isLast = currentIndex === slides.length - 1;

		// Show ONLY on last slide
		resourcesBox.classList.toggle("is-hidden", !isLast);
	}

	const prevBtn = document.querySelector(".chev--left");
	const nextBtn = document.querySelector(".chev--right");
	let currentIndex = 0;

	function updateChevrons() {
		// If you want wrap-around, don't hide anything.
		// But since you want first=right only, last=left only, we treat it as non-circular nav.
		if (prevBtn)
			prevBtn.style.display = currentIndex === 0 ? "none" : "inline-block";
		if (nextBtn)
			nextBtn.style.display =
				currentIndex === slides.length - 1 ? "none" : "inline-block";
	}

	function scrollToPageTop() {
		// Force scroll to the absolute top
		document.documentElement.scrollTop = 0;
		document.body.scrollTop = 0;
		window.scrollTo({ top: 0, behavior: "smooth" });
	}

	function showSlide(index) {
		// clamp instead of wrap
		if (index < 0) index = 0;
		if (index >= slides.length) index = slides.length - 1;

		slides.forEach((slide, i) => {
			slide.classList.toggle("tab_active", i === index);
		});

		currentIndex = index;

		updateChevrons();
		updateResourcesVisibility();
		scrollToPageTop();
	}

	function activateFromHash(hash) {
		const clean = (hash || "").replace("#", "");
		if (!clean) {
			showSlide(0);
			return;
		}

		const idx = Array.from(slides).findIndex((slide) => slide.id === clean);
		if (idx !== -1) {
			showSlide(idx);
		} else {
			showSlide(0);
		}
	}

	// 2) Prev / next buttons
	if (prevBtn)
		prevBtn.addEventListener("click", () => showSlide(currentIndex - 1));
	if (nextBtn)
		nextBtn.addEventListener("click", () => showSlide(currentIndex + 1));

	// 3) Initial load: coming from other pages like services.html#issuesbit
	setTimeout(() => {
		activateFromHash(window.location.hash);
	}, 10);

	// 4) React to hash changes (if user edits URL manually)
	window.addEventListener("hashchange", () => {
		activateFromHash(window.location.hash);
	});

	// 5) In-page links on services.html (your .tablink anchors)
	document.querySelectorAll(".tablink").forEach((link) => {
		link.addEventListener("click", (e) => {
			e.preventDefault();

			const id = link.getAttribute("href").replace("#", "");
			const idx = Array.from(slides).findIndex((slide) => slide.id === id);

			if (idx === -1) return;

			// Update URL hash without reloading
			history.replaceState(null, "", "#" + id);
			showSlide(idx);
		});
	});
});

// Multi-card flip handler
document.querySelectorAll(".flip-card").forEach((card, idx) => {
	const inner = card.querySelector(".flip-card-inner");
	const btn = card.querySelector(".contact-btn");
	const backFace = card.querySelector(".flip-card-face.back");
	const frontFace = card.querySelector(".flip-card-face.front");
	const backBtn = card.querySelector(".back-btn");

	// Ensure a unique ID for aria-controls
	if (inner) {
		const uniqueId = inner.id || `cardInner-${idx + 1}`;
		inner.id = uniqueId;
		btn?.setAttribute("aria-controls", uniqueId);
	}

	const setAria = (toBack) => {
		btn?.setAttribute("aria-expanded", String(toBack));
		frontFace?.setAttribute("aria-hidden", String(toBack));
		backFace?.setAttribute("aria-hidden", String(!toBack));
	};

	const flip = (toBack = true) => {
		inner?.classList.toggle("is-flipped", toBack);
		setAria(toBack);
	};

	// Optionally close other open cards when opening this one
	const closeOthers = () => {
		document.querySelectorAll(".flip-card-inner.is-flipped").forEach((el) => {
			if (el !== inner) {
				el.classList.remove("is-flipped");
				const host = el.closest(".flip-card");
				host
					?.querySelector(".contact-btn")
					?.setAttribute("aria-expanded", "false");
				host
					?.querySelector(".flip-card-face.front")
					?.setAttribute("aria-hidden", "false");
				host
					?.querySelector(".flip-card-face.back")
					?.setAttribute("aria-hidden", "true");
			}
		});
	};

	// Open (front → back)
	btn?.addEventListener("click", () => {
		closeOthers();
		flip(true);
	});
	btn?.addEventListener("keydown", (e) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			closeOthers();
			flip(true);
		}
	});

	// Click anywhere on the back to flip back, but ignore clicks on links/buttons
	backFace?.addEventListener("click", (e) => {
		const actionable = e.target.closest(
			"a, button, [role='button'], input, select, textarea, label",
		);
		if (!actionable) flip(false);
	});

	// Explicit back chip/button
	backBtn?.addEventListener("click", (e) => {
		e.stopPropagation();
		flip(false);
	});
});

// Global escape to close all
document.addEventListener("keydown", (e) => {
	if (e.key === "Escape") {
		document.querySelectorAll(".flip-card-inner.is-flipped").forEach((el) => {
			el.classList.remove("is-flipped");
			const host = el.closest(".flip-card");
			host
				?.querySelector(".contact-btn")
				?.setAttribute("aria-expanded", "false");
			host
				?.querySelector(".flip-card-face.front")
				?.setAttribute("aria-hidden", "false");
			host
				?.querySelector(".flip-card-face.back")
				?.setAttribute("aria-hidden", "true");
		});
	}
});

document.addEventListener("DOMContentLoaded", () => {
	// Get hash from the URL, e.g. #modalAnn
	const target = window.location.hash;
	if (!target) return;

	// Find the matching image that would normally open the modal
	const img = document.querySelector(
		`.team-member img[data-target="${target}"]`,
	);

	if (img) {
		img.click(); // simulate the click to open modal
	}
});

const contactLinks = document.querySelectorAll(".contact-link");
const modal = document.getElementById("phoneModal");
const closeBtn = document.querySelector(".close-btncall");

const modalTitle = document.querySelector(".modal-contentcall h3");
const modalNumber = document.querySelector(".modal-contentcall p");

function isMobile() {
	return window.matchMedia("(max-width: 768px)").matches;
}

contactLinks.forEach((link) => {
	link.addEventListener("click", function (e) {
		// let mobile behave normally
		if (isMobile()) return;

		const href = this.getAttribute("href");
		if (!href) return;

		if (href.startsWith("tel:") || href.startsWith("sms:")) {
			e.preventDefault();

			const number = href.replace("tel:", "").replace("sms:", "");
			const name = this.dataset.name || "";

			modalNumber.textContent = number;

			if (href.startsWith("sms:")) {
				modalTitle.textContent = name ? `Text ${name}:` : "Text this number:";
			} else {
				modalTitle.textContent = name ? `Call ${name}:` : "Call this number:";
			}

			modal.style.display = "flex";
		}
	});
});

// close button
closeBtn.addEventListener("click", () => {
	modal.style.display = "none";
});

// click outside
modal.addEventListener("click", (e) => {
	if (e.target === modal) {
		modal.style.display = "none";
	}
});

// escape key
document.addEventListener("keydown", (e) => {
	if (e.key === "Escape") {
		modal.style.display = "none";
	}
});
