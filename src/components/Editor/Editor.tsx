import React, {MouseEvent, useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {Point} from '../../types';
import styles from './Editor.module.scss';

function isValid(point: Point) {
  return point.x >= 0 && point.x <= 1 && point.y >= 0 && point.y <= 1;
}

type Box = {
  width: number;
  height: number;
};

function getVector(point1: Point, point2: Point) {
  return {
    x: point2.x - point1.x,
    y: point2.y - point1.y,
  };
}

function getRealDistance(point1: Point, point2: Point, box: Box) {
  const {x, y} = getVector(point1, point2);
  return Math.sqrt((x * box.width) ** 2 + (y * box.height) ** 2);
}

type Props = {
  url: string;
  onLineDone: (line: [Point, Point]) => void;
};

export function Editor({url, onLineDone}: Props) {
  const [enabled, setEnabled] = useState(false);
  const [hoverPoint, setHoverPoint] = useState<Point | undefined>();
  const [points, setPoints] = useState<Point[]>([]);
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

    const box = wrapperRef.current!.getBoundingClientRect();

    const [p1] = points;
    const p2 = points[1] || hoverPoint;

    const vector = getVector(p1, p2);
    const distance = getRealDistance(p1, p2, box);
    const count = Math.floor(distance / 30);

    if (count === 0) {
      return points;
    }

    return [
      ...points,
      ...Array.from({
        length: count - 1,
      }).map((_, i) => {
        const delta = (i + 1) / count;
        return {
          x: p1.x + vector.x * delta,
          y: p1.y + vector.y * delta,
        };
      }),
    ];
  }, [points, hoverPoint]);

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
