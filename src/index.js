/**
 * transform html to json schema of React style
 * Created by beizhu on 2019/7/27.
 */

// import htmlParser from 'html-parse-stringify2';
import parse from './parse/index';

export const html2schema = (html, useNewSchema = true) => {
  // schema key config
  const options = {
    name: 'component',
    attrs: 'props',
  };
  const htmlTree = parse(html, options);
  let root = {
    children: htmlTree,
    props: {},
    component: 'div',
    type: 'tag',
  };
  return transformTree2Schema(root, useNewSchema);
};

const transformTree2Schema = (htmlTree, useNewSchema) => {
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
    let stack = [];
    stack.push(node);
    while (stack.length !== 0) {
      let item = stack.pop();
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
          let style = {};
          let styleList = item.props.style.split(';');
          for (let key in styleList) {
            let styleItem = styleList[key];
            let styleName = styleItem.substr(0, styleItem.indexOf(':')).trim();
            let styleValue = styleItem
              .substr(styleItem.indexOf(':') + 1)
              .trim();
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
          item.children = item.children.map(child => {
            if (child.content !== undefined) {
              child = {
                component: 'gourd.text',
                props: {
                  content: child.content,
                },
                children: [],
              };
            }
            return child;
          });
        } else {
          // use old schema
          item.children = item.children.filter(child => {
            if (child.content !== undefined) {
              item.props['data_text'] = child.content;
              return false;
            }
            return true;
          });
        }
        let children = item.children;
        for (let i = children.length - 1; i >= 0; i--) {
          stack.push(children[i]);
        }
      }
    }
  }
  return node;
}

export default html2schema;
