const { Sequelize, DataTypes, Op } = require('sequelize');

async function runTask3() {
  const sequelize = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });

  const Student = sequelize.define('Student', {
    name: { type: DataTypes.STRING, allowNull: false },
    group: { type: DataTypes.STRING },
  });

  const Course = sequelize.define('Course', {
    title: { type: DataTypes.STRING, allowNull: false },
    credits: { type: DataTypes.INTEGER, allowNull: false },
  });

  const Enrollment = sequelize.define('Enrollment', {
    enrolledAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    grade: { type: DataTypes.INTEGER },
  });

  Student.belongsToMany(Course, { through: Enrollment, as: 'courses' });
  Course.belongsToMany(Student, { through: Enrollment, as: 'students' });

  await sequelize.sync({ force: true });

  // Тестовые данные:
  // Курсы: Базы данных (5 кредитов), Алгоритмы (4 кредита), Физкультура (2 кредита)
  const cDb = await Course.create({ title: 'Базы данных', credits: 5 });
  const cAlgo = await Course.create({ title: 'Алгоритмы', credits: 4 });
  const cPe = await Course.create({ title: 'Физкультура', credits: 2 });

  // Студенты:
  // Иван: записан на Базы данных (5) и Алгоритмы (4) -> подходит, оба курса credits > 3
  // Анна: записана на Физкультуру (2) и Базы данных (5) -> подходит, но в курсах будет только Базы данных!
  // Олег: записан только на Физкультуру (2) -> не подходит (отсеивается required: true)
  const ivan = await Student.create({ name: 'Иван', group: 'CS-101' });
  const anna = await Student.create({ name: 'Анна', group: 'CS-102' });
  const oleg = await Student.create({ name: 'Олег', group: 'CS-101' });

  await ivan.addCourses([cDb, cAlgo]);
  await anna.addCourses([cPe, cDb]);
  await oleg.addCourses([cPe]);

  async function getStudentsInAdvancedCourses() {
    return Student.findAll({
      include: [{
        model: Course,
        as: 'courses',
        where: { credits: { [Op.gt]: 3 } },
        required: true,
        through: { attributes: [] }
      }],
      order: [
        ['name', 'ASC'],
        [{ model: Course, as: 'courses' }, 'title', 'ASC']
      ],
    });
  }

  const results = await getStudentsInAdvancedCourses();
  return results.map(s => s.toJSON());
}

module.exports = { runTask3 };
