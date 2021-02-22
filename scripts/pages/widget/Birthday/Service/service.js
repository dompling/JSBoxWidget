const Calendar = require('../Calendar');

class Service {
  constructor(config) {
    this.mode = config.get('calendarType');
    this.birthday = new Date(config.get('birthday'));
    this.leapMonth = config.get('leapMonth');
    this.name = config.get('name');
    this.dataSource = {
      avatar: config.get('avatar'),
      name: this.name,
    };
  }

  dataSource = {};

  fetch = () => {
    const year = this.birthday.getFullYear();
    const month = this.birthday.getMonth() + 1;
    const day = this.birthday.getDate();
    const date = new Date();
    const nYear = date.getFullYear();
    if (this.mode) {
      this.dataSource.data = Calendar.solar2lunar(year, month, day);
      this.dataSource.data = Calendar.lunar2solar(
        nYear,
        this.dataSource.data.lMonth,
        this.dataSource.data.lDay,
      );
    } else {
      this.dataSource.data = Calendar.lunar2solar(nYear, month, day);
    }
    let time = this.getBirthday();
    const now = new Date();
    if (time.getTime() < now.getTime()) {
      this.dataSource.data = Calendar.lunar2solar(nYear + 1, month, day);
      time = this.getBirthday();
    }
    this.dataSource.next = Math.floor(
      (time.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    this.dataSource.birthday = time;
  };

  getBirthday = () => {
    const birthday = this.dataSource.data.date;
    const [tYear, tMonth, tday] = birthday.split('-');
    const time = new Date();
    time.setFullYear(tYear, parseInt(tMonth) - 1, tday);
    return time;
  };
}

module.exports = Service;
