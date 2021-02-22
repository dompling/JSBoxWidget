class Service {
  constructor(contact) {
    this.contact = contact || {};
  }

  dataSource = {};

  fetch = () => {
    this.dataSource = this.contact;
  };
}

module.exports = Service;
