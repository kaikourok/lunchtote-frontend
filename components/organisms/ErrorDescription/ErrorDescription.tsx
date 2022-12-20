import styles from './ErrorDescription.module.scss';

function ErrorDescription(props: { code: number }) {
  const description: {
    information: string;
    description: string;
  } = (() => {
    switch (props.code) {
      case 404:
        return {
          information: 'Not Found',
          description: 'ページが見つからないか、削除されています。',
        };
      case 500:
        return {
          information: 'Internal Server Error',
          description: 'サーバー内部で不明なエラーが発生しました。',
        };
      default:
        return {
          information: '',
          description: '',
        };
    }
  })();

  return (
    <div className={styles['error']}>
      <div className={styles['status-code']}>{props.code}</div>
      {description.information && (
        <div className={styles['error-code-information']}>
          {description.information}
        </div>
      )}
      {description.description && (
        <div className={styles['error-code-description']}>
          {description.description}
        </div>
      )}
    </div>
  );
}

export default ErrorDescription;
