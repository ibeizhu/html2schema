# html2schema

transform html to json schema of React style

## Installation

```
npm i html2schema -S
```

<img src="https://img.alicdn.com/tfs/TB1nuWUcbY1gK0jSZTEXXXDQVXa-1488-761.png" style="max-width: 700px;">

## Usage

```
import html2schema from 'html2schema';

const html = `<a href="https://github.com/ibzjs/html2schema" target="_blank">
<img class="img" src="https://img.alicdn.com/tfs/TB1PGNuyxTpK1RjSZFGXXcHqFXa-42-42.png" style="display: inline-block;">
<span class="text">hello world</span>
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
        "href": "https://github.com/ibzjs/html2schema",
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
              "component": "text",
              "props": {
                "content": "hello world"
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
