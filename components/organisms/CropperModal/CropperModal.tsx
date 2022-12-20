import { DndContext, useDraggable } from '@dnd-kit/core';
import { mdiCheck, mdiCloseThick, mdiUndo } from '@mdi/js';
import Icon from '@mdi/react';
import classnames from 'classnames';
import { useState } from 'react';
import ReactModal from 'react-modal';

import styles from './CropperModal.module.scss';

import NumberInput from '@/components/atoms/NumberInput/NumberInput';
import rotateCoodinates from 'lib/rotateCoodinates';

const DraggableImage = (props: {
  id: string;
  src: string;
  scale: number;
  rotate: number;
  deltaX: number;
  deltaY: number;
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: props.id,
  });

  const { x, y } = rotateCoodinates(
    transform?.x || 0,
    transform?.y || 0,
    -props.rotate
  );

  const result = (
    <img
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      src={props.src}
      style={{
        transform: `rotate(${props.rotate}deg) translate(${
          x + props.deltaX
        }px, ${y + props.deltaY}px) scale(${props.scale / 100})`,
      }}
      className={styles['draggable-image']}
    />
  );

  return result;
};

const CropperModal = (props: {
  isOpen: boolean;
  src: string;
  onApply: (
    deltaX: number,
    deltaY: number,
    scale: number,
    rotate: number
  ) => void;
  onCancel: () => void;
  onReset: () => void;
}) => {
  const id = 'cropper';

  const [deltaX, setDeltaX] = useState(0);
  const [deltaY, setDeltaY] = useState(0);

  const [scale, setScale] = useState(100);
  const [rotate, setRotate] = useState(0);

  const applyNewScale = (newScale: number) => {
    const oldScale = scale;
    setScale(newScale);
    setDeltaX(deltaX * (newScale / oldScale));
    setDeltaY(deltaY * (newScale / oldScale));
  };

  return (
    <ReactModal
      isOpen={props.isOpen}
      ariaHideApp={false}
      className={styles['crop-modal-wrapper']}
      overlayClassName={styles['crop-modal-overlay']}
    >
      <div className={styles['crop-modal-buttons']}>
        <div
          className={classnames(
            styles['crop-modal-button'],
            styles['cancel-button']
          )}
          onClick={() => props.onCancel()}
        >
          <div className={styles['crop-modal-button-icon']}>
            <Icon path={mdiUndo} />
          </div>
          <div className={styles['crop-modal-button-name']}>キャンセル</div>
        </div>
        <div
          className={classnames(
            styles['crop-modal-button'],
            styles['reset-button']
          )}
          onClick={() => props.onReset()}
        >
          <div className={styles['crop-modal-button-icon']}>
            <Icon path={mdiCloseThick} />
          </div>
          <div className={styles['crop-modal-button-name']}>リセット</div>
        </div>
        <div
          className={classnames(
            styles['crop-modal-button'],
            styles['apply-button']
          )}
          onClick={() => props.onApply(deltaX, deltaY, scale, rotate)}
        >
          <div className={styles['crop-modal-button-icon']}>
            <Icon path={mdiCheck} />
          </div>
          <div className={styles['crop-modal-button-name']}>適用</div>
        </div>
      </div>
      <div className={styles['crop-frame-wrapper']}>
        <div className={styles['crop-frame']} />
      </div>
      <DndContext
        onDragEnd={(e) => {
          let { x, y } = rotateCoodinates(e.delta.x, e.delta.y, -rotate);

          setDeltaX(deltaX + x);
          setDeltaY(deltaY + y);
        }}
      >
        <div className={styles['crop-image-wrapper']}>
          <DraggableImage
            id={id}
            src={props.src}
            deltaX={deltaX}
            deltaY={deltaY}
            scale={scale}
            rotate={rotate}
          />
        </div>
      </DndContext>
      <div className={styles['crop-covers']}>
        <div className={classnames(styles['crop-cover'], styles['left-top'])} />
        <div
          className={classnames(styles['crop-cover'], styles['left-bottom'])}
        />
        <div
          className={classnames(styles['crop-cover'], styles['right-top'])}
        />
        <div
          className={classnames(styles['crop-cover'], styles['right-bottom'])}
        />
      </div>
      <div className={styles['crop-controls']}>
        <div className={styles['crop-control']}>
          <div className={styles['crop-control-name']}>倍率% </div>
          <div className={styles['crop-control-inputs']}>
            <div className={styles['crop-control-slide-wrapper']}>
              <input
                className={styles['crop-control-slide']}
                type="range"
                min={1}
                max={400}
                value={scale}
                onChange={(e) => applyNewScale(Number(e.target.value))}
              />
            </div>
            <div className={styles['crop-control-input-wrapper']}>
              <NumberInput
                value={scale}
                min={1}
                max={400}
                onChange={(val) => {
                  if (val != null) {
                    applyNewScale(val);
                  }
                }}
              />
            </div>
          </div>
        </div>
        <div className={styles['crop-control']}>
          <div className={styles['crop-control-name']}>回転° </div>
          <div className={styles['crop-control-inputs']}>
            <div className={styles['crop-control-slide-wrapper']}>
              <input
                className={styles['crop-control-slide']}
                type="range"
                min={-180}
                max={180}
                value={rotate}
                onChange={(e) => setRotate(Number(e.target.value))}
              />
            </div>
            <div className={styles['crop-control-input-wrapper']}>
              <NumberInput
                value={rotate}
                min={-180}
                max={180}
                onChange={(val) => {
                  if (val != null) {
                    setRotate(val);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </ReactModal>
  );
};

export default CropperModal;
