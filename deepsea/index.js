const header = document.querySelector("header");
const menuButton = document.querySelector(".hamburger-icon");
const navLink = document.querySelector(".nav-links");
const navIcon = document.getElementById("nav-icon");
const navLinkItems = document.querySelectorAll(".nav-links-item");

let showMenu = false;

function closeNav() {
  setTimeout(() => {
    showMenu = false;
    navLink.classList.remove("show-nav-links");
    changeIcon();
  }, 200);
}

function headerColor() {
  window.scrollY >= 10 || showMenu
    ? header.classList.add("scroll-header")
    : header.classList.remove("scroll-header");
}

function changeIcon() {
  showMenu
    ? navIcon.setAttribute("src", "assets/x.svg")
    : navIcon.setAttribute("src", "assets/hamburger.svg");
}

function toggleMenu() {
  menuButton.addEventListener("click", () => {
    navLink.classList.toggle("show-nav-links");
    showMenu = !showMenu;
    headerColor();
    changeIcon();
  });
}

toggleMenu();
window.addEventListener("scroll", headerColor);
navLink.addEventListener("click", closeNav);
