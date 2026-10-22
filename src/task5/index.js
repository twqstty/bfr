const { Sequelize, DataTypes } = require('sequelize');

async function runTask5() {
  const sequelize = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });

  const User = sequelize.define('User', {
    name: { type: DataTypes.STRING, allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  });

  const Post = sequelize.define('Post', {
    title: { type: DataTypes.STRING, allowNull: false },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'draft',
    },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  User.hasMany(Post, { foreignKey: 'authorId', as: 'posts' });
  Post.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

  await sequelize.sync({ force: true });

  // Тестовые данные:
  // 1. Дмитрий: isActive=true, имеет published пост (2024-01-01) и draft пост -> подходит! Draft не войдет в posts.
  // 2. Елена: isActive=false, имеет published пост -> НЕ подходит (отсеивается верхнеуровневым where: { isActive: true })
  // 3. Светлана: isActive=true, имеет только draft посты -> НЕ подходит (отсеивается required: true в include)
  // 4. Алексей: isActive=true, имеет 2 published поста (2024-03-01 и 2024-05-01) -> подходит!
  const dmitry = await User.create({ name: 'Дмитрий', isActive: true });
  const elena = await User.create({ name: 'Елена', isActive: false });
  const svetlana = await User.create({ name: 'Светлана', isActive: true });
  const alexey = await User.create({ name: 'Алексей', isActive: true });

  await Post.bulkCreate([
    { title: 'Статья 1 (опубликована)', status: 'published', createdAt: new Date('2024-01-01'), authorId: dmitry.id },
    { title: 'Черновик Дмитрия', status: 'draft', createdAt: new Date('2024-02-01'), authorId: dmitry.id },
    { title: 'Статья Елены', status: 'published', createdAt: new Date('2024-01-15'), authorId: elena.id },
    { title: 'Черновик Светланы', status: 'draft', createdAt: new Date('2024-02-10'), authorId: svetlana.id },
    { title: 'Ранняя статья Алексея', status: 'published', createdAt: new Date('2024-03-01'), authorId: alexey.id },
    { title: 'Поздняя статья Алексея', status: 'published', createdAt: new Date('2024-05-01'), authorId: alexey.id },
  ]);

  async function getActiveUsersWithPublishedPosts() {
    return User.findAll({
      where: { isActive: true },
      include: [{
        model: Post,
        as: 'posts',
        where: { status: 'published' },
        required: true,
      }],
      order: [
        ['name', 'ASC'],
        [{ model: Post, as: 'posts' }, 'createdAt', 'DESC']
      ],
    });
  }

  const results = await getActiveUsersWithPublishedPosts();
  return results.map(u => u.toJSON());
}

module.exports = { runTask5 };
