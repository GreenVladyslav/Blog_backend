import express from 'express'; //!
import fs from 'fs';
// multer for upload images
import multer from 'multer';
// CORS предоставляет веб-серверам возможность контролировать междоменные запросы и позволяет производить безопасный обмен данными между разными доменами.
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose'; //!
// экспресс валидация на беке
import { registerValidation, loginValidation, postCreateValidation } from './validations.js';

// middleware handleValidationErrors собсвтенный и сheckAuth
import { checkAuth, handleValidationErrors } from './utils/index.js';

import { UserController, PostController } from './controllers/index.js';

mongoose
  .connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log(`DB connection error: ${err}`));

const app = express();

// когда создается хранилище diskStorage => віполняется функция и сохраняет файлі
const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    cb(null, 'uploads');
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

//применяем логику на єксперсс
const upload = multer({ storage });

// middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads')); /* делаю get Запрос на получение static files */

// роуты auth
app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login);
app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register);
// /auth/me - Будет говорить авторизован я или нет (благодоря нему в реакте я смогу показать инфу о профиле)
// checkAuth - решит нужно ли дальше выполнять остальные функции
app.get('/auth/me', checkAuth, UserController.getMe);

// роут upload
app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});

app.get('/tags', PostController.getLastTags);

app.get('/posts', PostController.getAll);
app.get('/posts/tags', PostController.getLastTags);
app.get('/posts/:id', PostController.getOne);
// удалять, изменять, постить многут только авторизованіе пользователя
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create);
app.delete('/posts/:id', checkAuth, PostController.remove);
app.patch(
  '/posts/:id',
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.update,
);

app.listen(process.env.PORT || 4444, (err) => {
  if (err) {
    return console.log(err);
  }

  console.log('Server Ok');
});
