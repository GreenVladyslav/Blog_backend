// функция решит можно ли возвращать секретную информацию или нет
import jwt from 'jsonwebtoken';

export default (req, res, next) => {
  const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');

  if (token) {
    try {
      // расшифровуем токен
      const decoded = jwt.verify(token, 'secretKey');
      // если удалось расшифровать то я его сохранил в req.userId
      req.userId = decoded._id;
      next();
    } catch (err) {
      return res.status(403).json({
        message: 'Нет доступа',
      });
    }
  } else {
    return res.status(403).json({
      message: 'Нет доступа',
    });
  }
};
