import React, {MouseEvent, useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {Point} from '../../types';
import styles from './Editor.module.scss';
import {getRealDistance, getVector, mulVector} from '../../utils/vector';

function isValid(point: Point) {
  return point.x >= 0 && point.x <= 1 && point.y >= 0 && point.y <= 1;
}

const BETWEEN_POINTS = 30;

type Props = {
  url: string;
  initialLine?: [Point, Point];
  onLineDone: (line: [Point, Point]) => void;
};

export function Editor({url, initialLine, onLineDone}: Props) {
  const [enabled, setEnabled] = useState(false);
  const [hoverPoint, setHoverPoint] = useState<Point | undefined>();
  const [points, setPoints] = useState<Point[]>(initialLine ?? []);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const convertToPoint = useCallback((e: MouseEvent) => {
    const box = wrapperRef.current!.getBoundingClientRect();

    return {
      x: (e.clientX - box.left) / box.width,
      y: (e.clientY - box.top) / box.height,
    };
  }, []);

  const linePoints = useMemo(() => {
    if (points.length === 0 || (points.length === 1 && !hoverPoint)) {
      return points;
    }

    if (!wrapperRef.current) {
      return [];
    }

    const box = wrapperRef.current.getBoundingClientRect();

    const [p1] = points;
    const p2 = points[1] || hoverPoint;

    const vector = getVector(p1, p2);
    const distance = getRealDistance(p1, p2, box);
    const deltaVector = mulVector(vector, BETWEEN_POINTS / distance);
    const count = Math.ceil(distance / BETWEEN_POINTS);

    if (count === 0) {
      return points;
    }

    return [
      ...points,
      ...Array.from({
        length: count - 1,
      }).map((_, i) => {
        const delta = i + 1;
        return {
          x: p1.x + deltaVector.x * delta,
          y: p1.y + deltaVector.y * delta,
        };
      }),
    ];
  }, [points, hoverPoint, wrapperRef.current]);

  let drawPoints = linePoints;

  if (hoverPoint) {
    drawPoints = [...drawPoints, hoverPoint];
  }

  return (
    <div
      ref={wrapperRef}
      className={styles.editor}
      onMouseDown={
        enabled
          ? (e) => {
              setPoints([convertToPoint(e)]);
            }
          : undefined
      }
      onMouseMove={
        enabled && points.length < 2
          ? (e) => {
              setHoverPoint(convertToPoint(e));
            }
          : undefined
      }
      onMouseUp={
        enabled
          ? (e) => {
              setHoverPoint(undefined);

              const point = convertToPoint(e);

              if (isValid(point)) {
                const updatedPoints = [...points, point];
                setPoints(updatedPoints);
                onLineDone([points[0], point]);
              } else {
                setPoints([]);
              }
            }
          : undefined
      }
    >
      <img
        src={url}
        className={styles.image}
        onLoad={() => {
          setEnabled(true);
        }}
      />
      {drawPoints.map(({x, y}, i) => (
        <span
          key={i}
          className={styles.point}
          style={{
            top: `${y * 100}%`,
            left: `${x * 100}%`,
          }}
        />
      ))}
    </div>
  );
}
