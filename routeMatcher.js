define(function(){

function normalize(path, keys, sensitive, strict) {
  if (path instanceof RegExp) return path;
  path = path
    .concat(strict ? '' : '/?')
    .replace(/\/\(/g, '(?:/')
    .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function(_, slash, format, key, capture, optional){
      keys.push({ name: key, optional: !! optional });
      slash = slash || '';
      return ''
        + (optional ? '' : slash)
        + '(?:'
        + (optional ? slash : '')
        + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')'
        + (optional || '');
    })
    .replace(/([\/.])/g, '\\$1')
    .replace(/\*/g, '(.*)');
  return new RegExp('^' + path + '$', sensitive ? '' : 'i');
}

function RouteMatcher(path,options){
  options = options || {};
  this.path = path;
  this.regexp = normalize(path
  , this.keys = []
  , options.sensitive
  , options.strict);
};

RouteMatcher.prototype.match = function(path) {
  var keys = this.keys
    , params = [];

  if (captures = this.regexp.exec(path)) {
    for (var j = 1, jlen = captures.length; j < jlen; ++j) {
      var key = keys[j-1]
        , val = 'string' == typeof captures[j]
          ? decodeURIComponent(captures[j])
          : captures[j];
      if (key) {
        params[key.name] = val;
      } else {
        params.push(val);
      }
    }
  }
  return params;
}

function matchCur(path,options) {
  return (new RouteMatcher(path,options)).match(window.location.pathname);
}

matchCur.Matcher = RouteMatcher;

return matchCur

});
