"use strict";

window.addEventListener("DOMContentLoaded", () => {
  const tabContent = document.querySelectorAll(".tabcontent"),
    tabParent = document.querySelector(".tabheader__items"),
    tabs = document.querySelectorAll(".tabheader__item");

  function hideTabContent() {
    tabContent.forEach((item) => {
      item.classList.add("hide");
      item.classList.remove("show");
    });
  }

  function showTabContent(i = 0) {
    tabContent[i].classList.remove("hide");
    tabContent[i].classList.add("show");
  }

  tabParent.addEventListener("click", (event) => {
    const target = event.target;

    if (target && target.classList.contains("tabheader__item")) {
      tabs.forEach((tab, i) => {
        tab.classList.remove("tabheader__item_active");
        if (target == tab) {
          tab.classList.add("tabheader__item_active");
          hideTabContent();
          showTabContent(i);
        }
      });
    }
  });

  hideTabContent();
  showTabContent();

  // Таймер на странице
  const deadline = "2021-07-20";

  function getTime(endTime) {
    let t = Date.parse(endTime) - Date.parse(new Date()),
      days = Math.floor(t / (1000 * 60 * 60 * 24)),
      hours = Math.floor((t / (1000 * 60 * 60)) % 24),
      minutes = Math.floor((t / (1000 * 60)) % 60),
      seconds = Math.floor((t / 1000) % 60);

    return {
      total: t,
      days: getZero(days),
      hours: getZero(hours),
      minutes: getZero(minutes),
      seconds: getZero(seconds),
    };
  }

  function getZero(num) {
    if (num >= 0 && num < 10) {
      return `0${num}`;
    } else {
      return num;
    }
  }

  function setTime(elem, endTime) {
    const timer = document.querySelector(elem),
      days = timer.querySelector("#days"),
      hours = timer.querySelector("#hours"),
      minutes = timer.querySelector("#minutes"),
      seconds = timer.querySelector("#seconds"),
      timerInterval = setInterval(setTimeElements, 1000);

    setTimeElements();

    function setTimeElements() {
      let t = getTime(endTime);

      days.innerHTML = t.days;
      hours.innerHTML = t.hours;
      minutes.innerHTML = t.minutes;
      seconds.innerHTML = t.seconds;

      if (t.total <= 0) {
        clearInterval(timerInterval);
      }
    }
  }

  setTime(".timer", deadline);

  // Modal
  const modalBtns = document.querySelectorAll("[data-modal]"),
    modal = document.querySelector(".modal");

  function showModal() {
    modal.classList.add("show");
    modal.classList.remove("hide");
    document.body.style.overflow = "hidden";
    clearInterval(modalTimer);
  }

  function showModalByScroll() {
    if (
      window.pageYOffset + document.documentElement.clientHeight >=
      document.documentElement.scrollHeight
    ) {
      showModal();
      window.removeEventListener("scroll", showModalByScroll);
    }
  }

  function closeModal() {
    modal.classList.add("hide");
    modal.classList.remove("show");
    document.body.style.overflow = "";
  }

  modalBtns.forEach((btn) => {
    btn.addEventListener("click", showModal);
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.getAttribute("data-close") == "") {
      closeModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.code === "Escape" && modal.classList.contains("show")) {
      closeModal();
    }
  });

  const modalTimer = setTimeout(showModal, 5000);

  window.addEventListener("scroll", showModalByScroll);

  //menu
  const getResorce = async (url) => {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Could not featch ${url}, status: ${res.status}`);
    }

    return await res.json();
  };

  //Запрос через Axios
  axios.get("http://localhost:3000/menu").then((data) => {
    data.data.forEach(({ img, altimg, title, descr, price, course }) => {
      new Card(
        img,
        altimg,
        title,
        descr,
        price,
        course,
        `.menu__field .container`
      ).render();
    });
  });

  class Card {
    constructor(src, alt, title, descr, cost, course, wrapper, ...classes) {
      this.box = document.querySelector(wrapper);
      this.src = src;
      this.alt = alt;
      this.title = title;
      this.descr = descr;
      this.cost = cost;
      this.course = course;
      this.classes = classes;
      this.convertPrise();
    }

    convertPrise() {
      this.cost = Math.floor(this.cost * this.course);
    }

    render() {
      const elem = document.createElement("div");
      if (this.classes.length === 0) {
        this.classes = `menu__item`;
        elem.classList.add(this.classes);
      } else {
        this.classes.forEach((className) => {
          elem.classList.add(className);
        });
      }

      elem.innerHTML = `
            <img src=${this.src} alt=${this.alt} />
            <h3 class="menu__item-subtitle">${this.title}</h3>
            <div class="menu__item-descr">
              ${this.descr}
            </div>
            <div class="menu__item-divider"></div>
            <div class="menu__item-price">
              <div class="menu__item-cost">Цена:</div>
              <div class="menu__item-total"><span>${this.cost}</span> грн/день</div>
            </div>`;
      this.box.append(elem);
    }
  }

  //forms
  const forms = document.querySelectorAll("form");

  const messege = {
    loading: "img/form/spinner.svg",
    success: "Спасибо! Скоро мы с вами свяжемся",
    failure: "Что-то пошло не так...",
  };

  forms.forEach((item) => {
    bindPostData(item);
  });

  const postData = async (url, data) => {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: data,
    });

    return await res.json();
  };

  function bindPostData(form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const statusMassege = document.createElement("img");
      statusMassege.src = messege.loading;
      statusMassege.classList.add("spiner");
      form.insertAdjacentElement("afterend", statusMassege);

      const formData = new FormData(form);

      const json = JSON.stringify(Object.fromEntries(formData.entries()));

      postData("http://localhost:3000/requests", json)
        .then((data) => {
          showThanksModal(messege.success);
          statusMassege.remove();
        })
        .catch(() => {
          showThanksModal(messege.failure);
        })
        .finally(() => {
          form.reset();
        });
    });
  }

  function showThanksModal(mass) {
    const prevModalDilog = document.querySelector(".modal__dialog");

    prevModalDilog.classList.remove("show");
    prevModalDilog.classList.add("hide");
    showModal();

    const thanksModal = document.createElement("div");
    thanksModal.classList.add("modal__dialog");
    thanksModal.innerHTML = `
      <div class="modal__content">
        <div class="modal__close" data-close>×</div>
        <div class="modal__title">
              ${mass}
        </div>
      </div>
    `;

    document.querySelector(".modal").append(thanksModal);

    setTimeout(() => {
      thanksModal.remove();
      prevModalDilog.classList.add("show");
      prevModalDilog.classList.remove("hide");
      closeModal();
    }, 4000);
  }
});

//slider
const slides = document.querySelectorAll(".offer__slide"),
  prev = document.querySelector(".offer__slider-prev"),
  next = document.querySelector(".offer__slider-next"),
  current = document.querySelector("#current"),
  total = document.querySelector("#total");

let slideIndex = 1;

if (slideIndex > 9) {
  total.textContent = slides.length;
} else {
  total.textContent = `0${slides.length}`;
}

function showSlides(index) {
  if (index > slides.length) {
    slideIndex = 1;
  } else if (index < 1) {
    slideIndex = slides.length;
  }

  slides.forEach((slide) => {
    slide.classList.remove("show");
    slide.classList.add("hide");
  });

  slides[slideIndex - 1].classList.remove("hide");
  slides[slideIndex - 1].classList.add("show");

  if (slideIndex > 9) {
    current.textContent = slideIndex;
  } else {
    current.textContent = `0${slideIndex}`;
  }
}

function countIndex(index) {
  showSlides((slideIndex += index));
}

showSlides(slideIndex);

prev.addEventListener("click", () => {
  countIndex(-1);
});

next.addEventListener("click", () => {
  countIndex(1);
});

//Calculator
const answer = document.querySelector(".calculating__result span"),
  genderBtns = document.querySelectorAll("#gender div"),
  chooseItems = document.querySelectorAll(".calculating__choose_medium input"),
  activityBtns = document.querySelectorAll(".calculating__choose_big div");

let gender = "female",
  height,
  weight,
  age,
  activity = 1.375;

answer.innerHTML = "Недостаточно данных";
genderBtns.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    setActiveClass(genderBtns, e);
    calcCallories(e);
  });
});

chooseItems.forEach((item) => {
  item.addEventListener("input", (e) => {
    calcCallories(e);
  });
});

activityBtns.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    setActiveClass(activityBtns, e);
    calcCallories(e);
  });
});

function inicialCalc() {}

function calcCallories(e) {
  getData(e);
  if (!gender || !height || !weight || !age) {
    answer.innerHTML = "Недостаточно данных";
    return;
  }

  if (gender === "male") {
    let x = Math.round(
      (88.36 + 13.4 * weight + 4.8 * height - 5.7 * age) * activity
    );
    answer.textContent = x;
  } else {
    let x = Math.round(
      (447.6 + 9.2 * weight + 3.1 * height - 4.3 * age) * activity
    );
    answer.textContent = x;
  }
}

function getData(e) {
  switch (e.target.getAttribute("id")) {
    case "female":
      gender = e.target.getAttribute("id");
      localStorage.setItem("gender", e.target.getAttribute("id"));
      break;
    case "male":
      gender = e.target.getAttribute("id");
      localStorage.setItem("gender", e.target.getAttribute("id"));
      break;
    case "height":
      if (e.target.value.match(/\D/g)) {
        e.target.style.border = "1px solid red";
      } else {
        e.target.style.border = "";
      }
      height = +e.target.value;
      localStorage.setItem("height", +e.target.value);
      break;
    case "weight":
      if (e.target.value.match(/\D/g)) {
        e.target.style.border = "1px solid red";
      } else {
        e.target.style.border = "";
      }
      weight = +e.target.value;
      localStorage.setItem("weight", +e.target.value);
      break;
    case "age":
      if (e.target.value.match(/\D/g)) {
        e.target.style.border = "1px solid red";
      } else {
        e.target.style.border = "";
      }
      age = +e.target.value;
      localStorage.setItem("age", +e.target.value);
      break;
    case "low":
      activity = +e.target.getAttribute("data-activity");
      localStorage.setItem("activity", +e.target.getAttribute("data-activity"));
      break;
    case "small":
      activity = +e.target.getAttribute("data-activity");
      localStorage.setItem("activity", +e.target.getAttribute("data-activity"));
      break;
    case "medium":
      activity = +e.target.getAttribute("data-activity");
      localStorage.setItem("activity", +e.target.getAttribute("data-activity"));
      break;
    case "high":
      activity = +e.target.getAttribute("data-activity");
      localStorage.setItem("activity", +e.target.getAttribute("data-activity"));
      break;
  }
}

function setActiveClass(elements, e) {
  elements.forEach((elem) => {
    elem.classList.remove("calculating__choose-item_active");

    if (e.target == elem) {
      elem.classList.add("calculating__choose-item_active");
    }
  });
}
