interface Point {
  x: number;
  y: number;
}

export function calcCenter(rect: DOMRect): Point {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  };
}

export function intersects(a: DOMRect, b: DOMRect): boolean {
  return a.left < b.right
    && a.right > b.left
    && a.top < b.bottom
    && a.bottom > b.top;
}
