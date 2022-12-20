import Link from 'next/link';

import styles from './ForumSender.module.scss';

import AdministratorIcon from '@/components/atoms/AdministratorIcon/AdministratorIcon';

const ForumSender = (props: { sender: ForumSender }) => {
  return (
    <>
      {props.sender.postType == 'SIGNED_IN' ? (
        <Link
          href={{
            pathname: '/characters/[id]',
            query: { id: props.sender.character },
          }}
        >
          <a>{props.sender.name}</a>
        </Link>
      ) : (
        props.sender.name
      )}
      {props.sender.postType == 'ANONYMOUS' ? (
        <span className={styles['anonymous-identifier']}>
          {props.sender.identifier}
        </span>
      ) : null}
      {props.sender.postType == 'ADMINISTRATOR' && <AdministratorIcon />}
    </>
  );
};

export default ForumSender;
