const { Sequelize } = require('sequelize');

// Используем SQLite в памяти для быстрого запуска и изолированных тестов
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false, // Отключаем лишний SQL-вывод в консоль для наглядности результатов
});

module.exports = sequelize;
