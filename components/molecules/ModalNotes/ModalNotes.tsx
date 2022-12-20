import { ReactNode } from 'react';

import styles from './ModalNotes.module.scss';

const ModalNotes = (props: { children: ReactNode }) => {
  return <div className={styles['notes']}>{props.children}</div>;
};

type NoteProps = {
  className?: string;
  children: ReactNode;
};

const Note = (props: NoteProps) => {
  return (
    <div className={styles['note']}>
      <div className={styles['mark']}>※</div>
      <div className={styles['body']}>{props.children}</div>
    </div>
  );
};
ModalNotes.Note = Note;

export default ModalNotes;
