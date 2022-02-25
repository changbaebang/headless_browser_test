function getOwnPropertyNames(object) {
  if(typeof object !== 'object') {
    throw new Error('Invailid argument for getOwnPropertyNames');
  }
  return Object.getOwnPropertyNames(object);
}

module.exports = {
  getOwnPropertyNames,
};