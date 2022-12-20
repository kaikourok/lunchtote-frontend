import jsSHA from 'jssha';

const salt = process.env.NEXT_PUBLIC_PASSWORD_HASH_SALT!;
const stretch = Number(process.env.NEXT_PUBLIC_PASSWORD_HASH_STRETCH!);

const hashPassword = (password: string) => {
  let s = password + salt;

  for (let i = 0; i < stretch; i++) {
    const shaObj = new jsSHA('SHA-256', 'TEXT');
    shaObj.update(s);
    s = shaObj.getHash('HEX');
  }

  return s;
};

export default hashPassword;
