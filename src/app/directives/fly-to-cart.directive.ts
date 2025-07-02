import { Directive, Input, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appFlyToCart]',
  standalone: true,
})
export class FlyToCartDirective {
  @Input('appFlyToCart') image?: HTMLImageElement;

  @HostListener('click') onClick() {
    if (!this.image) return;
    const cart = document.getElementById('cart-icon');
    if (!cart) return;

    const announce = document.getElementById('cart-announce');
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      if (announce) announce.textContent = 'Producto agregado al carrito';
      return;
    }

    const imgRect = this.image.getBoundingClientRect();
    const cartRect = cart.getBoundingClientRect();
    const clone = this.image.cloneNode(true) as HTMLImageElement;
    clone.style.position = 'fixed';
    clone.style.pointerEvents = 'none';
    clone.style.left = imgRect.left + 'px';
    clone.style.top = imgRect.top + 'px';
    clone.style.width = imgRect.width + 'px';
    clone.style.height = imgRect.height + 'px';
    clone.style.zIndex = '9999';
    clone.style.transition =
      'transform 0.5s cubic-bezier(0.42,0,0.58,1), opacity 0.5s';
    document.body.appendChild(clone);

    const dx =
      cartRect.left + cartRect.width / 2 -
      (imgRect.left + imgRect.width / 2);
    const dy =
      cartRect.top + cartRect.height / 2 -
      (imgRect.top + imgRect.height / 2);

    requestAnimationFrame(() => {
      clone.style.transform = `translate(${dx}px, ${dy}px) scale(0.1)`;
      clone.style.opacity = '0';
    });

    const end = () => {
      clone.remove();
      cart.classList.add('bounce');
      setTimeout(() => cart.classList.remove('bounce'), 300);
      if (announce) announce.textContent = 'Producto agregado al carrito';
    };
    clone.addEventListener('transitionend', end, { once: true });
  }

  constructor(private el: ElementRef) {}
}
