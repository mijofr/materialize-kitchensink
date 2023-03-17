import anim from "animejs";

export class Cards {

  static Init() {
    document.querySelectorAll('.card').forEach((card: HTMLElement) => {
      const cardReveal = <HTMLElement|null>Array.from(card.children).find(elem => elem.classList.contains('card-reveal'));
      if (!cardReveal) return;
      const initialOverflow = getComputedStyle(card).overflow;
      // Close Card
      const closeArea = cardReveal.querySelector('.card-reveal .card-title');
      closeArea?.addEventListener('click', e => {
        anim({
          targets: cardReveal,
          translateY: 0,
          duration: 225,
          easing: 'easeInOutQuad',
          complete: (anim) => {
            cardReveal.style.display = 'none';
            card.style.overflow = initialOverflow;
          }
        });
      });
      // Reveal Card
      const activators = card.querySelectorAll('.activator');
      activators.forEach(activator => activator.addEventListener('click', e => {
        card.style.overflow = 'hidden';
        cardReveal.style.display = 'block';
        anim({
          targets: cardReveal,
          translateY: '-100%',
          duration: 300,
          easing: 'easeInOutQuad'
        });
      }));
    });
  }  
}
  