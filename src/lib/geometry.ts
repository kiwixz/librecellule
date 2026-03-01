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
