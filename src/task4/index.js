const { Sequelize, DataTypes, Op } = require('sequelize');

async function runTask4() {
  const sequelize = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });

  const Order = sequelize.define('Order', {
    number: { type: DataTypes.STRING, allowNull: false, unique: true },
    status: { type: DataTypes.ENUM('new', 'paid', 'shipped'), defaultValue: 'new' },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  const Item = sequelize.define('Item', {
    productName: { type: DataTypes.STRING, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  });

  Order.hasMany(Item, { foreignKey: 'orderId', as: 'items' });
  Item.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

  await sequelize.sync({ force: true });

  // Тестовые данные:
  // Заказ 1 (вчера): товары с quantity 5 (100 руб) и quantity 3 (500 руб) -> подходит, оба quantity > 2, сортировка по цене DESC
  // Заказ 2 (сегодня): товары с quantity 1 (1000 руб) -> НЕ подходит (нет quantity > 2)
  // Заказ 3 (сегодня): товары с quantity 10 (250 руб) и quantity 1 (800 руб) -> подходит, но вернется только товар с quantity 10!
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const today = new Date();

  const order1 = await Order.create({ number: 'ORD-001', status: 'paid', createdAt: yesterday });
  const order2 = await Order.create({ number: 'ORD-002', status: 'new', createdAt: today });
  const order3 = await Order.create({ number: 'ORD-003', status: 'shipped', createdAt: today });

  await Item.bulkCreate([
    { productName: 'Ручка синяя', quantity: 5, price: 100.00, orderId: order1.id },
    { productName: 'Блокнот A4', quantity: 3, price: 500.00, orderId: order1.id },
    { productName: 'Клавиатура', quantity: 1, price: 1000.00, orderId: order2.id },
    { productName: 'Скрепки пачка', quantity: 10, price: 250.00, orderId: order3.id },
    { productName: 'Флешка 64ГБ', quantity: 1, price: 800.00, orderId: order3.id },
  ]);

  async function getOrdersWithBulkItems() {
    return Order.findAll({
      include: [{
        model: Item,
        as: 'items',
        where: { quantity: { [Op.gt]: 2 } },
        required: true,
      }],
      order: [
        ['createdAt', 'DESC'],
        [{ model: Item, as: 'items' }, 'price', 'DESC']
      ],
    });
  }

  const results = await getOrdersWithBulkItems();
  return results.map(o => o.toJSON());
}

module.exports = { runTask4 };
