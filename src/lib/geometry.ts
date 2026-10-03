interface Point {
  x: number;
  y: number;
}

export function calcCenter(rect: DOMRectReadOnly): Point {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  };
}

export function intersects(a: DOMRectReadOnly, b: DOMRectReadOnly): boolean {
  return a.left < b.right
    && a.right > b.left
    && a.top < b.bottom
    && a.bottom > b.top;
}
