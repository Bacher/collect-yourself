import {useEffect, useRef} from 'react';

import type {Box, Point} from '../../types';
import {
  applyAspectToPoint,
  getNormalizedVector,
  getRealDistance,
  getVector,
  mulVector,
  rotateLineAroundCenter,
} from '../../utils/vector';
import styles from './Combiner.module.scss';

type Props = {
  files: {
    file: File;
    line: [Point, Point];
  }[];
};

const WIDTH = 500;
const HEIGHT = 800;

function getSlope(line: [Point, Point], aspectRatio: number) {
  const vec0 = getNormalizedVector(...line);

  const vec = applyAspectToPoint(vec0, aspectRatio);
  const angle = Math.atan2(vec.y, vec.x);
  return Math.PI / 2 - angle;
}

export function Combiner({files}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    (async function () {
      const ctx = canvasRef.current!.getContext('2d');

      if (!ctx) {
        return;
      }

      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      const images = await Promise.all(
        files.map(async ({file, line}) => {
          const bitmap = await createImageBitmap(file);

          const {width, height} = bitmap;

          const imageCanvas = document.createElement('canvas');
          imageCanvas.width = width;
          imageCanvas.height = height;
          const aspectRatio = width / height;

          const angle = getSlope(line, aspectRatio);

          const ctx = imageCanvas.getContext('2d');

          ctx!.translate(width / 2, height / 2);
          ctx!.rotate(angle);
          ctx!.translate(-width / 2, -height / 2);
          ctx!.drawImage(bitmap, 0, 0, width, height);

          // document.body.appendChild(imageCanvas);

          const rotatedLine = rotateLineAroundCenter(line, aspectRatio, angle);

          return {
            imageCanvas,
            centerX: rotatedLine[0].x,
            heightLimits: [rotatedLine[0].y, rotatedLine[1].y],
          };
        }),
      );

      const ratio = 100 / WIDTH;

      const intervalsCount = images.length;

      images.forEach(({imageCanvas, centerX, heightLimits}, i) => {
        const {width, height} = imageCanvas;
        const [y1, y2] = heightLimits;
        const y1f = y1 * height;
        const y2f = y2 * height;
        const fHeight = y2f - y1f;
        const segmentHeight = fHeight / intervalsCount;

        ctx.save();
        const sx = 0;
        const sy = y1f + i * segmentHeight;
        const sw = centerX * 2 * width;
        const sh = segmentHeight;

        const aspectRatio = (centerX * 2 * width) / segmentHeight;

        const finalSegmentHeight = HEIGHT / intervalsCount;

        const finalWidth = finalSegmentHeight * aspectRatio;

        const dx = (WIDTH - finalWidth) / 2;
        const dy = i * finalSegmentHeight;
        const dw = finalWidth;
        const dh = finalSegmentHeight;

        console.log({sx, sy, sw, sh, dx, dy, dw, dh});
        ctx.drawImage(imageCanvas, sx, sy, sw, sh, dx, dy, dw, dh);
        ctx.restore();
      });
    })();
  }, [files]);

  return (
    <div>
      <canvas ref={canvasRef} className={styles.canvas} width={WIDTH} height={HEIGHT} />
    </div>
  );
}
