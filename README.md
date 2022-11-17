# babel-plugin-transform-remove-consoles
项目全局去除console的插件

## Example
**本地代码**
```js
var a = 1
console.log("foo");
console.error("bar");
```

**打包后代码**
```js
var a = 1
```

## 安装插件
```js
npm install babel-plugin-transform-remove-consoles -D
```

## 使用
babel.config.js
```js
{
  "plugins": ["transform-remove-consoles"]
}
```
**添加配置参数**
```js
{
  "plugins": [["transform-remove-consoles",{
    "exclude":["error","warn"],
    "env":'production',
    "commentWords":['no remove']
  }]]
}
```

## 文档
| 参数   | 类型 |    默认值 | 介绍 |
| :----- | :--: | :--:|:--|----- |
|exclude|	Array|	[]	| 需要被保留的console类型 |
|env|	String	| production	| 默认生产移除 |
|commentWords|	Array|	['no remove','reserve']|	在需要不被的console前面以后或者末尾添加|


## 案例
#### 1、配置exclude:['error']
**本地环境**
```js
console.log('end');
console.error('end');
console.error('21212');
```
**生产环境**

```js
console.error('end');
console.error('21212');
```

#### 2、配置commentWords:['no remove console']
**本地环境**
```js
console.log('start');
console.log('end');  // reserve
// no remove console
console.error('end');
// no remove
console.error('21212');
```
**生产环境**

```js
console.log('end');  // reserve
// no remove console
console.error('end');
// no remove
console.error('21212');
```