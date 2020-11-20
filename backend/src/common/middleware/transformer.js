import { plainToClass } from 'class-transformer';

const transformer = (reqTypes, TArr) => (req, res, next) => {
  reqTypes.forEach((type, index) => {
    req[type] = plainToClass(TArr[index], req[type]);
  });
  next();
};

export default transformer;
