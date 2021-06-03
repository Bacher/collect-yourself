import type {Point, Box} from '../types';

export function getVector(point1: Point, point2: Point) {
  return {
    x: point2.x - point1.x,
    y: point2.y - point1.y,
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
  if (p1.y < p2.y) {
    return [p2, p1];
  }

  return [p1, p2];
}
