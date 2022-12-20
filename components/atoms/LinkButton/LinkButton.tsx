import { ButtonHTMLAttributes, DetailedHTMLProps } from 'react';

import Button from '../Button/Button';

const LinkButton = (
  props: DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > & {
    href: string;
  }
) => {
  const type = props.type || 'button';

  return (
    <a href={props.href}>
      <Button {...props} />
    </a>
  );
};

export default LinkButton;
