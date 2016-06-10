module.exports = function () {
  var faker = require('faker');
  var _ = require('lodash');

  return {
    posts : _.times(12,function (n) {
      return {
        id : n,
        author : faker.internet.userName(),
        date : faker.date.recent(),
        title:  faker.lorem.sentence(),
        body : _.times(12, function () {
          return  '<p>' + faker.lorem.paragraph(24) + '</p>'
        })
      }

    })
  }
}
