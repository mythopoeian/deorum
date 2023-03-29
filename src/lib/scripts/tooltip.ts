export function tooltip(element: HTMLElement): { destroy(): void } {
  const root = document.querySelector('.root');
  let div: HTMLDivElement;
  let title = '';
  let limit = [0, 0];

  function mouseenter(event: MouseEvent): void {
    title = element.getAttribute('title') || '';
    element.removeAttribute('title');

    div = document.createElement('div');
    div.textContent = title;
    div.role = 'tooltip';
    div.className = 'tooltip';
    mouseMove(event);
    root?.appendChild(div);

    const { width, height } = div.getBoundingClientRect();
    const { innerWidth, innerHeight } = window;
    limit = [innerWidth - width, innerHeight - height];
  }

  function mouseMove(event: MouseEvent) {
    div.style.left = `${Math.min(event.pageX + 10, limit[0])}px`;
    div.style.top = `${Math.min(event.pageY + 10, limit[1])}px`;
  }

  function mouseLeave(): void {
    root?.removeChild(div);
    element.setAttribute('title', title);
  }

  element.addEventListener('mouseenter', mouseenter);
  element.addEventListener('mouseleave', mouseLeave);
  element.addEventListener('mousemove', mouseMove);

  return {
    destroy(): void {
      element.removeEventListener('mouseenter', mouseenter);
      element.removeEventListener('mouseleave', mouseLeave);
      element.removeEventListener('mousemove', mouseMove);
    }
  };
}