var topLevelObject;
if (typeof window !== 'undefined') {
  topLevelObject = window;
} else if (typeof global !== 'undefined') {
  topLevelObject = global;
} else if (typeof self !== 'undefined'){
  topLevelObject = self;
} else {
  module.exports = {};
}
export default topLevelObject;
