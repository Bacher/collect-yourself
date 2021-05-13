import React, {useCallback, useState} from 'react';
import {useDropzone} from 'react-dropzone';

import styles from './App.module.scss';
import type {Point} from '../../types';
import {Editor} from '../Editor';

export function App() {
  const [files, setFiles] = useState<
    {
      file: File;
      fileName: string;
      blob: Blob;
      blobUrl: string;
      line?: [Point, Point];
    }[]
  >([]);

  const [selectedImageIndex, setImageIndex] = useState<number>();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const images = acceptedFiles
        .filter((file) => file.type?.startsWith('image/'))
        .map((file) => {
          const blob = new Blob([file]);

          return {
            file,
            fileName: file.name,
            blob,
            blobUrl: URL.createObjectURL(blob),
          };
        });

      if (images.length) {
        // TODO: Remove
        // @ts-ignore
        window._image = images[0];

        setFiles([...files, ...images]);

        if (selectedImageIndex === undefined) {
          setImageIndex(0);
        }
      }
    },
    [files],
  );

  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});

  return (
    <div>
      <div className={styles.fileList}>
        {files.map(({fileName, blobUrl, line}, i) => (
          <button
            key={i}
            className={styles.file}
            type="button"
            data-active={i === selectedImageIndex || undefined}
            data-done={Boolean(line) || undefined}
            onClick={(e) => {
              e.preventDefault();
              setImageIndex(i);
            }}
          >
            <img src={blobUrl} alt={styles.fileName} className={styles.imgPreview} />
            <p className={styles.fileName}>{fileName}</p>
          </button>
        ))}
      </div>
      {selectedImageIndex !== undefined && (
        <Editor
          key={files[selectedImageIndex].blobUrl}
          url={files[selectedImageIndex].blobUrl}
          onLineDone={(line) => {
            setFiles(
              files.map((file, i) => {
                if (i === selectedImageIndex) {
                  return {
                    ...file,
                    line,
                  };
                }

                return file;
              }),
            );
          }}
        />
      )}
      <div {...getRootProps()} className={styles.dropZone}>
        <input {...getInputProps()} />
        {isDragActive && 'active'}
      </div>
    </div>
  );
}
