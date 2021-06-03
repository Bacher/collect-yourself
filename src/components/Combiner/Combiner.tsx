import {useEffect, useRef} from 'react';

import type {Box, Point} from '../../types';
import {getNormalizedVector, getRealDistance, getVector, mulVector} from '../../utils/vector';
import styles from './Combiner.module.scss';

type Props = {
  files: {
    file: File;
    line: [Point, Point];
  }[];
};

const WIDTH = 500;
const HEIGHT = 800;

function getSlope(line: [Point, Point], {width, height}: Box) {
  const vec0 = getNormalizedVector(...line);
  const vec = {x: vec0.x * width, y: vec0.y * height};
  const angle = Math.atan2(vec.y * -1, vec.x);
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

          const angle = getSlope(line, {width, height});

          const ctx = imageCanvas.getContext('2d');

          ctx!.translate(width / 2, height / 2);
          ctx!.rotate(-angle);
          ctx!.translate(-width / 2, -height / 2);
          ctx!.drawImage(bitmap, 0, 0, width, height);

          // document.body.appendChild(imageCanvas);

          return {
            imageCanvas,
            line,
          };
        }),
      );

      const ratio = 100 / WIDTH;

      images.forEach(({imageCanvas, line}, i) => {
        const {width} = imageCanvas;

        ctx.save();
        const sx = 0;
        const sy = i * 100;
        const sw = width;
        const sh = width * ratio;
        const dx = 0;
        const dy = i * 100;
        const dw = WIDTH;
        const dh = 100;

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
