import type {Point, Box} from '../types';

export function getVector(point1: Point, point2: Point) {
  return {
    x: point2.x - point1.x,
    y: point2.y - point1.y,
  };
}

export function applyAspectToPoint(p: Point, aspectRatio: number) {
  return {
    x: p.x * aspectRatio,
    y: p.y,
  };
}

export function getNormalizedVector(point1: Point, point2: Point) {
  return getVector(...normalizeLine(point1, point2));
}

export function getRealDistance(point1: Point, point2: Point, box: Box) {
  const {x, y} = getVector(point1, point2);
  return Math.sqrt((x * box.width) ** 2 + (y * box.height) ** 2);
}

export function mulVector(vector: Point, mul: number) {
  return {
    x: vector.x * mul,
    y: vector.y * mul,
  };
}

export function normalizeLine(p1: Point, p2: Point): [Point, Point] {
  if (p1.y > p2.y) {
    return [p2, p1];
  }

  return [p1, p2];
}

export function rotateLineAroundCenter(
  [p1, p2]: [Point, Point],
  aspectRatio: number,
  angle: number,
): [Point, Point] {
  const center = {
    x: 0.5 * aspectRatio,
    y: 0.5,
  };

  const p1New = rotate(applyAspectToPoint(p1, aspectRatio), center, angle);
  const p2New = rotate(applyAspectToPoint(p2, aspectRatio), center, angle);

  return [
    {
      x: p1New.x / aspectRatio,
      y: p1New.y,
    },
    {
      x: p2New.x / aspectRatio,
      y: p2New.y,
    },
  ];
}

function rotate(p: Point, center: Point, angle: number) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return {
    x: cos * (p.x - center.x) - sin * (p.y - center.y) + center.x,
    y: sin * (p.x - center.x) + cos * (p.y - center.y) + center.y,
  };
}
