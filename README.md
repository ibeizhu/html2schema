# html2schema

transform html to json schema of React style

## Installation

```
npm i html2schema -S
```

![preview](https://img.alicdn.com/tfs/TB1xIUwb8r0gK0jSZFnXXbRRXXa-1227-769.png)

## Usage

```
import html2schema from 'html2schema';

const html = `<a href="https://github.com/one-gourd/html2schema" target="_blank">
<img class="img" src="https://img.alicdn.com/tfs/TB1PGNuyxTpK1RjSZFGXXcHqFXa-42-42.png" style="display: inline-block;">
<span class="text">text</span>
</a>
`;

console.log(html2schema(html));
```

output json below
```
{
  "children": [
    {
      "component": "a",
      "props": {
        "href": "https://github.com/one-gourd/html2schema",
        "target": "_blank"
      },
      "children": [
        {
          "component": "img",
          "props": {
            "src": "https://img.alicdn.com/tfs/TB1PGNuyxTpK1RjSZFGXXcHqFXa-42-42.png",
            "style": {
              "display": "inline-block"
            },
            "className": "img"
          },
          "children": []
        },
        {
          "component": "span",
          "props": {
            "className": "text"
          },
          "children": [
            {
              "component": "gourd.text",
              "props": {
                "content": "text"
              },
              "children": []
            }
          ]
        }
      ]
    }
  ],
  "props": {},
  "component": "div"
}
```
## reference code

[html-parse-stringify2](https://github.com/rayd/html-parse-stringify2)
