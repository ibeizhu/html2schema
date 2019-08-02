/**
 * parse html to tree
 * @type {RegExp}
 */
import parseTag from './parse-tag';

var tagRE = /(?:<!--[\S\s]*?-->|<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>)/g;
// re-used obj for quick lookups of components
var empty = Object.create ? Object.create(null) : {};

/**
 * common logic for pushing a child node onto a list
 * @param list
 * @param html
 * @param level
 * @param start
 * @param ignoreWhitespace
 */
function pushTextNode(list, html, level, start, ignoreWhitespace) {
  // calculate correct end of the content slice in case there's
  // no tag after the text node.
  var end = html.indexOf('<', start);
  var content = html.slice(start, end === -1 ? undefined : end);
  // if a node is nothing but whitespace, collapse it as the spec states:
  // https://www.w3.org/TR/html4/struct/text.html#h-9.1
  if (/^\s*$/.test(content)) {
    content = ' ';
  }
  // don't add whitespace-only text nodes if they would be trailing text nodes
  // or if they would be leading whitespace-only text nodes:
  //  * end > -1 indicates this is not a trailing text node
  //  * leading node is when level is -1 and list has length 0
  if (
    (!ignoreWhitespace && end > -1 && level + list.length >= 0) ||
    content !== ' '
  ) {
    list.push({
      type: 'text',
      content: content,
    });
  }
}

var defaultOptions = {
  ignoreWhitespace: true,
  components: empty,
  // tree key config
  type: 'type',
  name: 'name',
  attrs: 'attrs',
  children: 'children',
  voidElement: 'voidElement',
};

export default function parse(html, options = {}) {
  options = Object.assign({}, defaultOptions, options);

  var result = [];
  var current;
  var level = -1;
  var arr = [];
  var byTag = {};
  var inComponent = false;

  html.replace(tagRE, function(tag, index) {
    if (inComponent) {
      if (tag !== '</' + current[options.name] + '>') {
        return;
      } else {
        inComponent = false;
      }
    }

    var isOpen = tag.charAt(1) !== '/';
    var isComment = tag.indexOf('<!--') === 0;
    var start = index + tag.length;
    var nextChar = html.charAt(start);
    var parent;
    if (isOpen && !isComment) {
      level++;

      current = parseTag(tag, options);
      if (
        current[options.type] === 'tag' &&
        options.components[current[options.name]]
      ) {
        current[options.type] = 'component';
        inComponent = true;
      }

      if (
        !current[options.voidElement] &&
        !inComponent &&
        nextChar &&
        nextChar !== '<'
      ) {
        pushTextNode(
          current[options.children],
          html,
          level,
          start,
          options.ignoreWhitespace,
        );
      }

      byTag[current.tagName] = current;

      // if we're at root, push new base node
      if (level === 0) {
        result.push(current);
      }

      parent = arr[level - 1];

      if (parent) {
        parent.children.push(current);
      }

      arr[level] = current;
    }

    if (isComment || !isOpen || current[options.voidElement]) {
      if (!isComment) {
        level--;
      }
      if (!inComponent && nextChar !== '<' && nextChar) {
        // trailing text node
        // if we're at the root, push a base text node. otherwise add as
        // a child to the current node.
        parent = level === -1 ? result : arr[level][options.children];
        pushTextNode(parent, html, level, start, options.ignoreWhitespace);
      }
    }
  });

  // If the "html" passed isn't actually html, add it as a text node.
  if (!result.length && html.length) {
    pushTextNode(result, html, 0, 0, options.ignoreWhitespace);
  }

  return result;
}
