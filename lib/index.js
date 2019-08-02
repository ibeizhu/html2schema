(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.library = {}));
}(this, function (exports) { 'use strict';

  /**
   * This file automatically generated from `pre-publish.js`.
   * Do not manually edit.
   */

  var _voidElements_3_1_0_voidElements = {
    "area": true,
    "base": true,
    "br": true,
    "col": true,
    "embed": true,
    "hr": true,
    "img": true,
    "input": true,
    "link": true,
    "meta": true,
    "param": true,
    "source": true,
    "track": true,
    "wbr": true
  };

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  var attrRE = /([\w-]+)|=|(['"])([.\s\S]*?)\2/g;

  function parseTag(tag, options) {
    var _res;

    var i = 0;
    var key;
    var expectingValueAfterEquals = true;
    var res = (_res = {}, _defineProperty(_res, options.type, 'tag'), _defineProperty(_res, options.name, ''), _defineProperty(_res, options.voidElement, false), _defineProperty(_res, options.attrs, {}), _defineProperty(_res, options.children, []), _res);

    tag.replace(attrRE, function (match) {
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
          if (_voidElements_3_1_0_voidElements[match] || tag.charAt(tag.length - 2) === '/') {
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

  /**
   * parse html to tree
   * @type {RegExp}
   */

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
    if (!ignoreWhitespace && end > -1 && level + list.length >= 0 || content !== ' ') {
      list.push({
        type: 'text',
        content: content
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
    voidElement: 'voidElement'
  };

  function parse(html) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    options = Object.assign({}, defaultOptions, options);

    var result = [];
    var current;
    var level = -1;
    var arr = [];
    var byTag = {};
    var inComponent = false;

    html.replace(tagRE, function (tag, index) {
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
        if (current[options.type] === 'tag' && options.components[current[options.name]]) {
          current[options.type] = 'component';
          inComponent = true;
        }

        if (!current[options.voidElement] && !inComponent && nextChar && nextChar !== '<') {
          pushTextNode(current[options.children], html, level, start, options.ignoreWhitespace);
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

  /**
   * transform html to json schema of React style
   * Created by beizhu on 2019/7/27.
   */

  var html2schema = function html2schema(html) {
    var useNewSchema = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    // schema key config
    var options = {
      name: 'component',
      attrs: 'props'
    };
    var htmlTree = parse(html, options);
    var root = {
      children: htmlTree,
      props: {},
      component: 'div',
      type: 'tag'
    };
    return transformTree2Schema(root, useNewSchema);
  };

  var transformTree2Schema = function transformTree2Schema(htmlTree, useNewSchema) {
    return JSON.stringify(deepTraverseTree(htmlTree, useNewSchema));
  };

  /**
   * deep traverse tree
   * @param node
   * @param useNewSchema
   * @return {*}
   */
  function deepTraverseTree(node, useNewSchema) {
    if (node) {
      var stack = [];
      stack.push(node);

      var _loop = function _loop() {
        var item = stack.pop();
        if (item.type !== undefined) {
          delete item.type;
        }
        if (item.voidElement !== undefined) {
          delete item.voidElement;
        }
        if (item.props) {
          // class => className
          if (item.props.class) {
            item.props.className = item.props.class;
            delete item.props.class;
          }
          // style string => style object
          if (item.props.style) {
            var style = {};
            var styleList = item.props.style.split(';');
            for (var key in styleList) {
              var styleItem = styleList[key];
              var styleName = styleItem.substr(0, styleItem.indexOf(':')).trim();
              var styleValue = styleItem.substr(styleItem.indexOf(':') + 1).trim();
              if (styleName) {
                style[styleName] = styleValue;
              }
            }
            item.props.style = style;
          }
        }

        if (item.children) {
          if (useNewSchema) {
            // use new schema
            item.children = item.children.map(function (child) {
              if (child.content !== undefined) {
                child = {
                  component: 'gourd.text',
                  props: {
                    content: child.content
                  },
                  children: []
                };
              }
              return child;
            });
          } else {
            // use old schema
            item.children = item.children.filter(function (child) {
              if (child.content !== undefined) {
                item.props['data_text'] = child.content;
                return false;
              }
              return true;
            });
          }
          var children = item.children;
          for (var i = children.length - 1; i >= 0; i--) {
            stack.push(children[i]);
          }
        }
      };

      while (stack.length !== 0) {
        _loop();
      }
    }
    return node;
  }

  exports.default = html2schema;
  exports.html2schema = html2schema;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.js.map
