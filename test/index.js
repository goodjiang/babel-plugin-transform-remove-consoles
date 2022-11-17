const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');
const noDebuggerPlugin = require('../index');
const code = fs.readFileSync(path.resolve(__dirname, './code.js'), 'utf-8');

const babelConfig = {
  plugins: [
    [
      noDebuggerPlugin,
      {
        env: 'production',
        exclude: ['error'],
        commentWords: ['no remove console']
      }
    ]
  ]
};
const result = babel.transformSync(code, babelConfig);
console.log(result.code); //把code里面的代码全部打印出来了
