import { CSSProperties, ReactNode, useRef } from 'react';

import Button from '../Button/Button';

type FileInputButtonProps = {
  className?: string;
  style?: CSSProperties;
  accept: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  multiple?: boolean;
  children?: ReactNode;
};

const FileInputButton = (props: FileInputButtonProps) => {
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        type="file"
        ref={hiddenInputRef}
        accept={props.accept}
        onChange={props.onChange}
        multiple={props.multiple}
        hidden
      />
      <Button
        className={props.className}
        style={props.style}
        onClick={() => {
          hiddenInputRef.current!.click();
        }}
      >
        {props.children}
      </Button>
    </>
  );
};

export default FileInputButton;
