/**
 * parse tag
 * @type {RegExp}
 */
import voidElements from 'void-elements';

var attrRE = /([\w-]+)|=|(['"])([.\s\S]*?)\2/g;

export default function parseTag(tag, options) {
  var i = 0;
  var key;
  var expectingValueAfterEquals = true;
  var res = {
    [options.type]: 'tag',
    [options.name]: '',
    [options.voidElement]: false,
    [options.attrs]: {},
    [options.children]: [],
  };

  tag.replace(attrRE, function(match) {
    if (match === '=') {
      expectingValueAfterEquals = true;
      i++;
      return;
    }

    if (!expectingValueAfterEquals) {
      if (key) {
        res[options.attrs][key] = key; // boolean attribute
      }
      key = match;
    } else {
      if (i === 0) {
        if (voidElements[match] || tag.charAt(tag.length - 2) === '/') {
          res[options.voidElement] = true;
        }
        res[options.name] = match;
      } else {
        res[options.attrs][key] = match.replace(/^['"]|['"]$/g, '');
        key = undefined;
      }
    }
    i++;
    expectingValueAfterEquals = false;
  });

  return res;
}
