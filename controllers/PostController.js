import PostModel from '../models/Post.js';

export const getLastTags = async (req, res) => {
  try {
    const posts = await PostModel.find().limit(5).exec();

    const tags = posts
      .map((obj) => obj.tags)
      .flat()
      .slice(0, 5);

    res.json(tags);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статьи',
    });
  }
};

export const getAll = async (req, res) => {
  // .populate('user').exec()  как получить самого пользователя сделать связь из одной таблиці на другую
  try {
    // const posts = await PostModel.find()
    //   .populate({ path: 'user', select: ['name', 'avatar'] })
    //   .exec();
    const posts = await PostModel.find().populate('user').exec();

    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статьи',
    });
  }
};

// // если счетчик не нужен чтобы видеть сколько раз запрашшивают статью то просто можно воспользоваться findOne, findById (но нам нужно получить статью и обновить ее (количество просомтров_))
// export const getOne = async (req, res) => {
//   try {
//     const postId = req.params.id;

//     PostModel.findOneAndUpdate(
//       {
//         _id: postId,
//       },
//       {
//         $inc: { viewsCount: 1 },
//       },
//       {
//         returnDocument: 'after',
//       },
//       (err, doc) => {
//         if (err) {
//           console.log(err);
//           return res.status(500).json({
//             message: 'Не удалось вернуть статью',
//           });
//         }

//         if (!doc) {
//           return res.status(404).json({
//             message: 'Статья не найдена',
//           });
//         }
//         res.json(doc);
//       },
//     ).populate('user')
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({
//       message: 'Не удалось получить статьи',
//     });
//   }
// };

export const getOne = async (req, res) => {
  const postId = req.params.id;

  PostModel.findOneAndUpdate(
    {
      _id: postId,
    },
    {
      $inc: { viewsCount: 1 },
    },
    {
      returnDocument: 'after',
    },
  )
    .populate('user')
    .then((doc) => {
      if (!doc) {
        return res.status(404).json({
          message: 'Статья не найдена',
        });
      }

      res.json(doc);
    })

    .catch((err) => {
      console.log(err);
      res.status(500).json({
        message: 'Не удалось получить статьи',
      });
    });
};

// .catch((err) => {
//   console.log(err);
//   res.status(500).json({
//     message: 'Не удалось вернуть статью',
//   });
// })

// export const remove = async (req, res) => {
//   try {
//     const postId = req.params.id;

//     PostModel.findOneAndDelete(
//       {
//         _id: postId,
//       },
//       (err, doc) => {
//         if (err) {
//           console.log(err);
//           return res.status(500).json({
//             message: 'Не удалось удалить статью',
//           });
//         }

//         if (!doc) {
//           return res.status(404).json({
//             message: 'Статья не найдена',
//           });
//         }

//         res.json({
//           success: true,
//         });
//       },
//     );
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({
//       message: 'Не удалось получить статьи',
//     });
//   }
// };

export const remove = async (req, res) => {
  const postId = req.params.id;

  PostModel.findOneAndDelete({ _id: postId })
    .then((doc) => {
      if (!doc) {
        return res.status(404).json({
          message: 'Статья не найдена',
        });
      }

      res.json({
        success: true,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        message: 'Не удалось удалить статью',
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        message: 'Не удалось получить статьи',
      });
    });
};

export const update = async (req, res) => {
  try {
    const postId = req.params.id;

    await PostModel.updateOne(
      { _id: postId },
      {
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        tags: req.body.tags.split(','),
        user: req.userId,
      },
    );

    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось обновить статью',
    });
  }
};

export const create = async (req, res) => {
  try {
    const doc = new PostModel({
      title: req.body.title,
      text: req.body.text,
      imageUrl: req.body.imageUrl,
      tags: req.body.tags.split(','),
      user: req.userId, //decoded._id - checkAuth
    });

    const post = await doc.save();

    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось создать статью',
    });
  }
};
