const { runTask1 } = require('./src/task1');
const { runTask2 } = require('./src/task2');
const { runTask3 } = require('./src/task3');
const { runTask4 } = require('./src/task4');
const { runTask5 } = require('./src/task5');

async function main() {
  console.log('='.repeat(70));
  console.log(' ПРАКТИЧЕСКАЯ РАБОТА: ФИЛЬТРАЦИЯ И СОРТИРОВКА В SEQUELIZE');
  console.log('='.repeat(70));

  console.log('\n--- Задание 1. Пользователи с постами после 2023-01-01 ---');
  const task1Result = await runTask1();
  console.log(JSON.stringify(task1Result, null, 2));

  console.log('\n--- Задание 2. Все авторы, включая без книг (LEFT JOIN) ---');
  const task2Result = await runTask2();
  console.log(JSON.stringify(task2Result, null, 2));

  console.log('\n--- Задание 3. Студенты на курсах с credits > 3 (N:M) ---');
  const task3Result = await runTask3();
  console.log(JSON.stringify(task3Result, null, 2));

  console.log('\n--- Задание 4. Заказы с товарами quantity > 2 (2 уровня order) ---');
  const task4Result = await runTask4();
  console.log(JSON.stringify(task4Result, null, 2));

  console.log('\n--- Задание 5. Активные пользователи с опубликованными постами ---');
  const task5Result = await runTask5();
  console.log(JSON.stringify(task5Result, null, 2));

  console.log('\n' + '='.repeat(70));
  console.log(' Все 5 заданий успешно выполнены!');
  console.log('='.repeat(70));
}

main().catch(err => {
  console.error('Ошибка при выполнении:', err);
  process.exit(1);
});
