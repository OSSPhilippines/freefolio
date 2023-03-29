const NAV_BAR = document.getElementById('navBar');
const NAV_LIST = document.getElementById('navList')
const HERO_HEADER = document.getElementById('heroHeader');
const HAMBURGER_BTN = document.getElementById('hamburgerBtn');
const SERVICE_BOXES = document.querySelectorAll('.service-card__box');

let currentServiceBG = null;

const addPaddingToHeroHeaderFn = () => {
  const NAV_BAR_HEIGHT = NAV_BAR.getBoundingClientRect().height;
  const HEIGHT_IN_REM = NAV_BAR_HEIGHT / 10;

  // If hamburger button is active, do not add padding
  if(NAV_LIST.classList.contains('nav--active')){
    return;
  }
  Object.assign(HERO_HEADER.style, {
    paddingTop: HEIGHT_IN_REM + 'rem'
  });
}
const toggleNavbar = ()=>{
  NAV_LIST.classList.toggle('nav--active');
  if(NAV_LIST.classList.contains('nav--active')){
    Object.assign(document.body.style,{
      overflowY: 'hidden'
    });
    Object.assign(NAV_LIST.style, {
      height: '100vh'
    });
    return;
  }
  Object.assign(NAV_LIST.style, {
    height: 0
  });
  Object.assign(document.body.style,{
    overflowY: null
  });
}

/* Attach Events */
addPaddingToHeroHeaderFn();
window.addEventListener('resize', addPaddingToHeroHeaderFn);
HAMBURGER_BTN.addEventListener('click', toggleNavbar);
SERVICE_BOXES.forEach(service => {
  const moveBG = (x, y)=>{
    Object.assign(currentServiceBG.style, {
      left: x + 'px',
      top: y + 'px',
    })
  }
  service.addEventListener('mouseenter', (e) => {
    if(currentServiceBG === null){
      currentServiceBG = service.querySelector('.service-card__bg');
    }
    moveBG(e.clientX, e.clientY);
  });
  service.addEventListener('mousemove', (e) => {
    const LEFT = e.clientX - service.getBoundingClientRect().left;
    const TOP = e.clientY - service.getBoundingClientRect().top;
    moveBG(LEFT, TOP);
  });
  service.addEventListener('mouseleave', () => {
    const IMG_POS = service.querySelector('.service-card__illustration')
    const LEFT = IMG_POS.offsetLeft + currentServiceBG.getBoundingClientRect().width;
    const TOP = IMG_POS.offsetTop + currentServiceBG.getBoundingClientRect().height;

    moveBG(LEFT, TOP);
    currentServiceBG = null;
  });
});
