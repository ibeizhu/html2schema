/**
 * Created by beizhu on 2019/8/1.
 */

const html2schema = require('../lib');

const html = `<a href="https://github.com/ibzjs/html2schema" target="_blank">
<img class="img" src="https://img.alicdn.com/tfs/TB1PGNuyxTpK1RjSZFGXXcHqFXa-42-42.png" style="display: inline-block;">
<span class="text">hello world</span>
</a>
`;

console.log(html2schema(html));
