const { Sequelize, DataTypes } = require('sequelize');

async function runTask2() {
  const sequelize = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });

  const Author = sequelize.define('Author', {
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    country: { type: DataTypes.STRING },
  });

  const Book = sequelize.define('Book', {
    title: { type: DataTypes.STRING, allowNull: false },
    year: { type: DataTypes.INTEGER },
    genre: { type: DataTypes.STRING },
  });

  Author.hasMany(Book, { foreignKey: 'authorId', as: 'books' });
  Book.belongsTo(Author, { foreignKey: 'authorId', as: 'author' });

  await sequelize.sync({ force: true });

  // Тестовые данные:
  // 1. Толстой - с книгами
  // 2. Достоевский - с книгами
  // 3. Чехов - без книг (должен остаться в выборке с books: [])
  const tolstoy = await Author.create({ firstName: 'Лев', lastName: 'Толстой', country: 'Россия' });
  const dostoevsky = await Author.create({ firstName: 'Фёдор', lastName: 'Достоевский', country: 'Россия' });
  const chekhov = await Author.create({ firstName: 'Антон', lastName: 'Чехов', country: 'Россия' });

  await Book.bulkCreate([
    { title: 'Война и мир', year: 1869, genre: 'Роман-эпопея', authorId: tolstoy.id },
    { title: 'Анна Каренина', year: 1877, genre: 'Роман', authorId: tolstoy.id },
    { title: 'Преступление и наказание', year: 1866, genre: 'Роман', authorId: dostoevsky.id },
  ]);

  async function getAllAuthorsIncludingEmpty() {
    return Author.findAll({
      include: [{
        model: Book,
        as: 'books',
        required: false,
      }],
      order: [['lastName', 'ASC']],
    });
  }

  const results = await getAllAuthorsIncludingEmpty();
  return results.map(a => a.toJSON());
}

module.exports = { runTask2 };
