const { Sequelize, DataTypes, Op } = require('sequelize');

async function runTask1() {
  const sequelize = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });

  const User = sequelize.define('User', {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true },
  });

  const Post = sequelize.define('Post', {
    title: { type: DataTypes.STRING, allowNull: false },
    publishedAt: { type: DataTypes.DATE, allowNull: false },
  });

  User.hasMany(Post, { foreignKey: 'authorId', as: 'posts' });
  Post.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

  await sequelize.sync({ force: true });

  // Тестовые данные:
  // 1. Алиса: посты от 2022 и 2024 года (должна попасть в выборку, но только с постом 2024 года)
  // 2. Борис: пост только от 2021 года (не должен попасть в выборку)
  // 3. Виктор: посты от 2023-06 и 2023-12 (должен попасть с обоими постами, отсортированными по дате DESC)
  const alice = await User.create({ name: 'Алиса', email: 'alice@example.com' });
  const boris = await User.create({ name: 'Борис', email: 'boris@example.com' });
  const victor = await User.create({ name: 'Виктор', email: 'victor@example.com' });

  await Post.bulkCreate([
    { title: 'Старый пост Алисы', publishedAt: new Date('2022-05-10'), authorId: alice.id },
    { title: 'Свежий пост Алисы', publishedAt: new Date('2024-02-15'), authorId: alice.id },
    { title: 'Архивный пост Бориса', publishedAt: new Date('2021-11-20'), authorId: boris.id },
    { title: 'Летний пост Виктора', publishedAt: new Date('2023-06-01'), authorId: victor.id },
    { title: 'Зимний пост Виктора', publishedAt: new Date('2023-12-10'), authorId: victor.id },
  ]);

  async function getUsersWithRecentPosts() {
    return User.findAll({
      include: [{
        model: Post,
        as: 'posts',
        where: { publishedAt: { [Op.gt]: new Date('2023-01-01') } },
        required: true,
      }],
      order: [
        ['name', 'ASC'],
        [{ model: Post, as: 'posts' }, 'publishedAt', 'DESC']
      ],
    });
  }

  const results = await getUsersWithRecentPosts();
  return results.map(u => u.toJSON());
}

module.exports = { runTask1 };
