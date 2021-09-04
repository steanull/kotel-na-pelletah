import "../styles/style.scss";

"use strict";
const SELECTOR_ITEM = ".slider__item", SELECTOR_ITEMS = ".slider__items", SELECTOR_WRAPPER = ".slider__wrapper",
  SELECTOR_PREV = '.slider__control[data-slide="prev"]', SELECTOR_NEXT = '.slider__control[data-slide="next"]',
  SELECTOR_INDICATOR = ".slider__indicators>li", SLIDER_TRANSITION_OFF = "slider_disable-transition",
  CLASS_CONTROL = "slider__control", CLASS_CONTROL_HIDE = "slider__control_hide",
  CLASS_ITEM_ACTIVE = "slider__item_active", CLASS_INDICATOR_ACTIVE = "active";

function hasTouchDevice() {
  return !!("ontouchstart" in window || navigator.maxTouchPoints)
}

function hasElementInVew(t) {
  const e = t.getBoundingClientRect(), i = window.innerHeight || document.documentElement.clientHeight,
    s = window.innerWidth || document.documentElement.clientWidth, n = e.top <= i && e.top + e.height >= 0,
    r = e.left <= s && e.left + e.width >= 0;
  return n && r
}

function ChiefSlider(t, e) {
  this._config = {
    loop: !0,
    autoplay: !1,
    interval: 5e3,
    pauseOnHover: !0,
    refresh: !0,
    swipe: !0
  }, this._widthItem = 0, this._widthWrapper = 0, this._itemsInVisibleArea = 0, this._transform = 0, this._transformStep = 0, this._intervalId = null, this._$root = null, this._$wrapper = null, this._$items = null, this._$itemList = null, this._$controlPrev = null, this._$controlNext = null, this._$indicatorList = null, this._minOrder = 0, this._maxOrder = 0, this._$itemByMinOrder = null, this._$itemByMaxOrder = null, this._minTranslate = 0, this._maxTranslate = 0, this._direction = "next", this._updateItemPositionFlag = !1, this._activeItems = [], this._isTouchDevice = hasTouchDevice(), this._init(t, e), this._addEventListener()
}

ChiefSlider.prototype._init = function (t, e) {
  this._$root = t, this._$itemList = t.querySelectorAll(SELECTOR_ITEM), this._$items = t.querySelector(SELECTOR_ITEMS), this._$wrapper = t.querySelector(SELECTOR_WRAPPER), this._$controlPrev = t.querySelector(SELECTOR_PREV), this._$controlNext = t.querySelector(SELECTOR_NEXT), this._$indicatorList = t.querySelectorAll(SELECTOR_INDICATOR);
  const i = this._$itemList, s = i[0].offsetWidth, n = this._$wrapper.offsetWidth, r = Math.round(n / s);
  this._widthItem = s, this._widthWrapper = n, this._itemsInVisibleArea = r, this._transformStep = 100 / r;
  for (let t in e) this._config.hasOwnProperty(t) && (this._config[t] = e[t]);
  for (let t = 0, e = i.length; t < e; t++) i[t].dataset.index = t, i[t].dataset.order = t, i[t].dataset.translate = 0, t < r && this._activeItems.push(t);
  if (this._updateClassForActiveItems(), !this._config.loop) return void (this._$controlPrev && this._$controlPrev.classList.add(CLASS_CONTROL_HIDE));
  const o = i.length - 1, a = 100 * -i.length;
  i[o].dataset.order = -1, i[o].dataset.translate = 100 * -i.length, i[o].style.transform = "translateX(".concat(a, "%)"), this._updateExtremeProperties(), this._updateIndicators(), this._autoplay()
}, ChiefSlider.prototype._addEventListener = function () {
  const t = this._$root;
  t.addEventListener("click", this._eventHandler.bind(this)), this._config.autoplay && this._config.pauseOnHover && (t.addEventListener("mouseenter", function () {
    this._autoplay("stop")
  }.bind(this)), t.addEventListener("mouseleave", function () {
    this._autoplay()
  }.bind(this))), this._config.refresh && window.addEventListener("resize", function () {
    window.requestAnimationFrame(this._refresh.bind(this))
  }.bind(this)), this._config.loop && (this._$items.addEventListener("transitionstart", function () {
    this._updateItemPositionFlag = !0, window.requestAnimationFrame(this._updateItemPosition.bind(this))
  }.bind(this)), this._$items.addEventListener("transitionend", function () {
    this._updateItemPositionFlag = !1
  }.bind(this))), this._isTouchDevice && this._config.swipe && (t.addEventListener("touchstart", function (t) {
    this._touchStartCoord = t.changedTouches[0].clientX
  }.bind(this)), t.addEventListener("touchend", function (t) {
    const e = t.changedTouches[0].clientX - this._touchStartCoord;
    e > 50 ? this._moveToPrev() : e < -50 && this._moveToNext()
  }.bind(this))), !this._isTouchDevice && this._config.swipe && (t.addEventListener("mousedown", function (t) {
    this._touchStartCoord = t.clientX
  }.bind(this)), t.addEventListener("mouseup", function (t) {
    const e = t.clientX - this._touchStartCoord;
    e > 50 ? this._moveToPrev() : e < -50 && this._moveToNext()
  }.bind(this)))
}, ChiefSlider.prototype._updateExtremeProperties = function () {
  const t = this._$itemList;
  this._minOrder = +t[0].dataset.order, this._maxOrder = this._minOrder, this._$itemByMinOrder = t[0], this._$itemByMaxOrder = t[0], this._minTranslate = +t[0].dataset.translate, this._maxTranslate = this._minTranslate;
  for (let e = 0, i = t.length; e < i; e++) {
    const i = t[e], s = +i.dataset.order;
    s < this._minOrder ? (this._minOrder = s, this._$itemByMinOrder = i, this._minTranslate = +i.dataset.translate) : s > this._maxOrder && (this._maxOrder = s, this._$itemByMaxOrder = i, this._minTranslate = +i.dataset.translate)
  }
}, ChiefSlider.prototype._updateItemPosition = function () {
  if (!this._updateItemPositionFlag) return;
  const t = this._$wrapper.getBoundingClientRect(), e = t.width / this._itemsInVisibleArea / 2,
    i = this._$itemList.length;
  if ("next" === this._direction) {
    const s = t.left, n = this._$itemByMinOrder;
    let r = this._minTranslate;
    n.getBoundingClientRect().right < s - e && (n.dataset.order = this._minOrder + i, r += 100 * i, n.dataset.translate = r, n.style.transform = "translateX(".concat(r, "%)"), this._updateExtremeProperties())
  } else {
    const s = t.right, n = this._$itemByMaxOrder;
    let r = this._maxTranslate;
    n.getBoundingClientRect().left > s + e && (n.dataset.order = this._maxOrder - i, r -= 100 * i, n.dataset.translate = r, n.style.transform = "translateX(".concat(r, "%)"), this._updateExtremeProperties())
  }
  requestAnimationFrame(this._updateItemPosition.bind(this))
}, ChiefSlider.prototype._updateClassForActiveItems = function () {
  const t = this._activeItems, e = this._$itemList;
  for (let i = 0, s = e.length; i < s; i++) {
    const s = e[i], n = +s.dataset.index;
    t.indexOf(n) > -1 ? s.classList.add(CLASS_ITEM_ACTIVE) : s.classList.remove(CLASS_ITEM_ACTIVE)
  }
}, ChiefSlider.prototype._updateIndicators = function () {
  const t = this._$indicatorList, e = this._$itemList;
  if (t.length) for (let i = 0, s = e.length; i < s; i++) {
    e[i].classList.contains(CLASS_ITEM_ACTIVE) ? t[i].classList.add("active") : t[i].classList.remove("active")
  }
}, ChiefSlider.prototype._move = function () {
  if (!hasElementInVew(this._$root)) return;
  const t = "next" === this._direction ? -this._transformStep : this._transformStep, e = this._transform + t;
  if (!this._config.loop) {
    const t = this._transformStep * (this._$itemList.length - this._itemsInVisibleArea);
    if (e < -t || e > 0) return;
    this._$controlPrev.classList.remove(CLASS_CONTROL_HIDE), this._$controlNext.classList.remove(CLASS_CONTROL_HIDE), e === -t ? this._$controlNext.classList.add(CLASS_CONTROL_HIDE) : 0 === e && this._$controlPrev.classList.add(CLASS_CONTROL_HIDE)
  }
  const i = [];
  if ("next" === this._direction) for (let t = 0, e = this._activeItems.length; t < e; t++) {
    let e = this._activeItems[t], s = ++e;
    s > this._$itemList.length - 1 && (s -= this._$itemList.length), i.push(s)
  } else for (let t = 0, e = this._activeItems.length; t < e; t++) {
    let e = this._activeItems[t], s = --e;
    s < 0 && (s += this._$itemList.length), i.push(s)
  }
  this._activeItems = i, this._updateClassForActiveItems(), this._updateIndicators(), this._transform = e, this._$items.style.transform = "translateX(".concat(e, "%)")
}, ChiefSlider.prototype._moveToNext = function () {
  this._direction = "next", this._move()
}, ChiefSlider.prototype._moveToPrev = function () {
  this._direction = "prev", this._move()
}, ChiefSlider.prototype._moveTo = function (t) {
  const e = this._$indicatorList;
  let i = null, s = null;
  for (let n = 0, r = e.length; n < r; n++) {
    const r = e[n];
    if (r.classList.contains("active")) {
      const e = +r.dataset.slideTo;
      null === s ? (i = e, s = Math.abs(t - i)) : Math.abs(t - e) < s && (i = e, s = Math.abs(t - i))
    }
  }
  if (0 !== (s = t - i)) {
    this._direction = s > 0 ? "next" : "prev";
    for (let t = 1; t <= Math.abs(s); t++) this._move()
  }
}, ChiefSlider.prototype._eventHandler = function (t) {
  const e = t.target;
  if (this._autoplay("stop"), e.classList.contains(CLASS_CONTROL)) t.preventDefault(), this._direction = e.dataset.slide, this._move(); else if (e.dataset.slideTo) {
    const t = +e.dataset.slideTo;
    this._moveTo(t)
  }
  this._autoplay()
}, ChiefSlider.prototype._autoplay = function (t) {
  if (this._config.autoplay) return "stop" === t ? (clearInterval(this._intervalId), void (this._intervalId = null)) : void (null === this._intervalId && (this._intervalId = setInterval(function () {
    this._direction = "next", this._move()
  }.bind(this), this._config.interval)))
}, ChiefSlider.prototype._refresh = function () {
  const t = this._$itemList, e = t[0].offsetWidth, i = this._$wrapper.offsetWidth, s = Math.round(i / e);
  if (s === this._itemsInVisibleArea) return;
  this._autoplay("stop"), this._$items.classList.add(SLIDER_TRANSITION_OFF), this._$items.style.transform = "translateX(0)", this._widthItem = e, this._widthWrapper = i, this._itemsInVisibleArea = s, this._transform = 0, this._transformStep = 100 / s, this._updateItemPositionFlag = !1, this._activeItems = [];
  for (let e = 0, i = t.length; e < i; e++) {
    const i = t[e], n = e;
    i.dataset.index = n, i.dataset.order = n, i.dataset.translate = 0, i.style.transform = "translateX(0)", n < s && this._activeItems.push(n)
  }
  if (this._updateClassForActiveItems(), window.requestAnimationFrame(function () {
    this._$items.classList.remove(SLIDER_TRANSITION_OFF)
  }.bind(this)), !this._config.loop) return void (this._$controlPrev && this._$controlPrev.classList.add(CLASS_CONTROL_HIDE));
  const n = t.length - 1, r = 100 * -t.length;
  t[n].dataset.order = -1, t[n].dataset.translate = 100 * -t.length, t[n].style.transform = "translateX(".concat(r, "%)"), this._updateExtremeProperties(), this._updateIndicators(), this._autoplay()
}, ChiefSlider.prototype.next = function () {
  this._moveToNext()
}, ChiefSlider.prototype.prev = function () {
  this._moveToPrev()
}, ChiefSlider.prototype.moveTo = function (t) {
  this._moveTo(t)
}, ChiefSlider.prototype.refresh = function () {
  this._refresh()
};

const $sliders = document.querySelectorAll('[data-slider="chiefslider"]');
$sliders.forEach(function ($slider) {
  new ChiefSlider($slider);
});

// Range
let slider = document.querySelector(".survey__range");
let output = document.querySelector(".survey__square");
output.innerHTML = slider.value;

slider.oninput = function () {
  output.innerHTML = this.value;
}

// Video popup
let popupGallery = document.querySelector('.popup-gallery');
let popupGalleryCloseBtn = popupGallery.querySelector('.popup-gallery__button');
let popupIframe = document.querySelector('.popup-iframe');
let popupIframeCloseBtn = popupIframe.querySelector('.popup-iframe__button');
let popupCallback = document.querySelector('.popup-callback');
let popupCallbackCloseBtn = document.querySelector('.popup-callback__button');
let videoPopupBtn = document.querySelector('.video__icon');
let headerPopupBtn = document.querySelectorAll('.header__icon');
let YoutubePopupBtn = document.querySelectorAll('.youtube-videos__icon');
let galleryImageBtn = document.querySelectorAll('.gallery__image');
let contactsBtn = document.querySelector('.contacts__button');
const initialFrame = [
  {
    name: 'Пеллетная котельная 320 кВт на котлах Pelltech EverClean',
    link: 'https://www.youtube.com/embed/IliQfNelkLY?autoplay=1'
  },
  {
    name: 'Чем отапливать? Пеллеты, газ, дизель, эл-во. Смотреть!',
    link: 'https://www.youtube.com/embed/Wos12xGnwTM?autoplay=1'
  },
  {
    name: 'Пеллетный котел Froling PE1 35 кВт',
    link: 'https://www.youtube.com/embed/1BsHTm5_loI?autoplay=1'
  },
  {
    name: 'Пеллетная котельная VIT BIO 30 кВт',
    link: 'https://www.youtube.com/embed/19qCCyZOJ8k?autoplay=1'
  },
  {
    name: 'Автономная пеллетная котельная на котлах Pelltech Everclean 320 кВт.',
    link: 'https://www.youtube.com/embed/XwfOrpvXgCk?autoplay=1'
  },
  {
    name: 'Работа пеллетной горелки Eco Palnik.',
    link: 'https://www.youtube.com/embed/mTfbjtmfEHc?autoplay=1'
  },
];
const initialGallery = [
  {
    name: 'Благодарственное письмо',
    link: 'images/certificate-1.jpg'
  },
  {
    name: 'Благодарственное письмо',
    link: 'images/certificate-2.jpg'
  },
  {
    name: 'Благодарственное письмо',
    link: 'images/certificate-3.jpg'
  },
  {
    name: 'Сертификат Termal',
    link: 'images/certificate-4.jpg'
  },
  {
    name: 'Сертификат Froling',
    link: 'images/certificate-5.jpg'
  },
];
//Функция добавления класса для открытия Gallery
function openGallery(element) {
  element.classList.add('popup-gallery_opened');
}

//Функция добавления класса для открытия Iframe
function openIframe(element) {
  element.classList.add('popup-iframe_opened');
}

//Функция добавления класса для открытия Callback
function openCallback(element) {
  element.classList.add('popup-callback_opened');
}

//Функция удаления класса для закрытия Gallery
function closeGallery(element) {
  element.classList.remove('popup-gallery_opened');
  document.querySelector('.popup-gallery__image').src = ""
}

//Функция удаления класса для закрытия Iframe
function closeIframe(element) {
  element.classList.remove('popup-iframe_opened');
  document.querySelector('.popup-iframe__iframe').src = ""
}

//Функция удаления класса для закрытия Callback
function closeCallback(element) {
  element.classList.remove('popup-callback_opened');
}

//Закрытие Галереи по нажатию на кнопку "крестик"
popupGalleryCloseBtn.addEventListener('click', function () {
  closeGallery(popupGallery);
});

//Закрытие iFrame по нажатию на кнопку "крестик"
popupIframeCloseBtn.addEventListener('click', function () {
  closeIframe(popupIframe);
});

//Закрытие Callback по нажатию на кнопку "крестик"
popupCallbackCloseBtn.addEventListener('click', function () {
  closeCallback(popupCallback);
});

//Закрытие Галереи по нажатию на "Escape"
window.onkeydown = function (event) {
  if (event.keyCode === 27) {
    closeGallery(popupGallery);
  }
};

//Закрытие Iframe по нажатию на "Escape"
window.onkeydown = function (event) {
  if (event.keyCode === 27) {
    closeIframe(popupIframe);
  }
};

//Закрытие Callback по нажатию на "Escape"
window.onkeydown = function (event) {
  if (event.keyCode === 27) {
    closeCallback(popupCallback);
  }
};

//Закрытие Галереи по нажатию на пустое поле
popupGallery.addEventListener('click', (event) => {
  if (event.target === event.currentTarget) {
    closeGallery(popupGallery);
  }
});

//Закрытие Iframe по нажатию на пустое поле
popupIframe.addEventListener('click', (event) => {
  if (event.target === event.currentTarget) {
    closeIframe(popupIframe);
  }
});

//Закрытие Callback по нажатию на пустое поле
popupCallback.addEventListener('click', (event) => {
  if (event.target === event.currentTarget) {
    closeCallback(popupCallback);
  }
});

videoPopupBtn.addEventListener('click', function () {
  openIframe(popupIframe);
  document.querySelector('.popup-iframe__iframe').src = initialFrame[1].link;
  document.querySelector('.popup-iframe__title').innerHTML = initialFrame[1].name;
});

headerPopupBtn.forEach(item => {
  item.addEventListener('click', function () {
  openIframe(popupIframe);
  document.querySelector('.popup-iframe__iframe').src = initialFrame[0].link;
  document.querySelector('.popup-iframe__title').innerHTML = initialFrame[0].name;
  });
});
for (let i = 0; i < YoutubePopupBtn.length; i++) {
  YoutubePopupBtn[i].addEventListener('click', function () {
    openIframe(popupIframe);
    document.querySelector('.popup-iframe__iframe').src = initialFrame[i + 2].link;
    document.querySelector('.popup-iframe__title').innerHTML = initialFrame[i + 2].name;
  });
};

for (let i = 0; i < galleryImageBtn.length; i++) {
  galleryImageBtn[i].addEventListener('click', function () {
    openGallery(popupGallery);
    document.querySelector('.popup-gallery__image').src = initialGallery[i].link;
    document.querySelector('.popup-gallery__title').innerHTML = initialGallery[i].name;
  });
};

contactsBtn.addEventListener('click', function () {
  openCallback(popupCallback);
});

