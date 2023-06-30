import jwt from 'jsonwebtoken';
// шифр пароля
import bcrypt from 'bcrypt';

// models
import UserModel from '../models/User.js';

export const register = async (req, res) => {
  try {
    // шифруем пароль в соль
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // создаем нового юзера
    const doc = new UserModel({
      email: req.body.email,
      fullName: req.body.fullName,
      avatartUrl: req.body.avatartUrl,
      passwordHash: hash,
    });

    const user = await doc.save();

    // если нету никаких ошибок мы шифруем хеш и создаем документ и послесоздания doc мы создаем токен
    const token = jwt.sign(
      {
        _id: user._id,
      },
      'secretKey',
      {
        expiresIn: '30d',
      },
    );

    const { passwordHash, ...userData } = user._doc;

    res.json({
      // ...user._doc,
      ...userData,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось зарегестрироваться',
    });
  }
};

export const login = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });
    // не тот логин или пароль в твоем приложение (так как если уточнять то злоумышленик поймет в чем причина)
    if (!user) {
      return res.status(404).json({
        message: 'Пользователь не найден',
      });
    }
    // если есть юзер то проверим его пароль в базе данных
    const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);
    if (!isValidPass) {
      return res.status(400).json({
        message: 'Не верный логин или пароль',
      });
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      'secretKey',
      {
        expiresIn: '30d',
      },
    );

    const { passwordHash, ...userData } = user._doc;

    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось авторизоваться',
    });
  }
};

export const getMe = async (req, res) => {
  try {
    // вытаскиваем пользователя id
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: 'Пользователь не найден',
      });
    }

    const { passwordHash, ...userData } = user._doc;

    res.json(userData);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Нет доступа',
    });
  }
};
