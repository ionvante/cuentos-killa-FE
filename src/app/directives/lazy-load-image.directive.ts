import { Directive, ElementRef, Input, OnDestroy, AfterViewInit } from '@angular/core';

@Directive({
  selector: 'img[appLazyLoad]',
  standalone: true,
})
export class LazyLoadImageDirective implements AfterViewInit, OnDestroy {
  @Input('appLazyLoad') src = '';
  private observer?: IntersectionObserver;

  constructor(private el: ElementRef<HTMLImageElement>) {}

  ngAfterViewInit(): void {
    const img = this.el.nativeElement;
    img.setAttribute('loading', 'lazy');

    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            img.src = this.src;
            this.observer?.disconnect();
          }
        });
      });
      this.observer.observe(img);
    } else {
      img.src = this.src;
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
