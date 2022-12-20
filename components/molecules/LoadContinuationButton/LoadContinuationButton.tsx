import styles from './LoadContinuationButton.module.scss';

const LoadContinuationButton = (props: {
  message?: string;
  onClick: () => void;
}) => {
  return (
    <div className={styles['button']} onClick={props.onClick}>
      {props.message || '続きを読み込む'}
    </div>
  );
};

export default LoadContinuationButton;
