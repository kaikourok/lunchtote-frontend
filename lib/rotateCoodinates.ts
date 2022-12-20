import toRadian from './toRadian';

const rotateCoodinates = (
  x: number,
  y: number,
  rotateInfo:
    | number
    | {
        rad: number;
        sin: number;
        cos: number;
      } // degree OR rad,sin,cos
) => {
  let rad: number;
  let sin: number;
  let cos: number;

  if (typeof rotateInfo == 'number') {
    rad = toRadian(rotateInfo);
    sin = Math.sin(rad);
    cos = Math.cos(rad);
  } else {
    rad = rotateInfo.rad;
    sin = rotateInfo.sin;
    cos = rotateInfo.cos;
  }

  return { x: x * cos - y * sin, y: y * cos + x * sin };
};

export default rotateCoodinates;
