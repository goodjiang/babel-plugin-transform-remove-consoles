const isProduction = process.env.NODE_ENV === 'production';
const isArray = arg => Object.prototype.toString.call(arg) === '[object Array]';
const isFunction = arg => Object.prototype.toString.call(arg) === '[object Function]';

//判断是否有关键字匹配 默认no remove || reserve 且如果commentWords和默认值是相斥的
const isReserveComment = (node, commentWords) => {
  if (isFunction(commentWords)) {
    return commentWords(node.value);
  }
  return (
    ['CommentBlock', 'CommentLine'].includes(node.type) &&
    (isArray(commentWords)
      ? commentWords.includes(node.value)
      : /(no[t]? remove\b)|(reserve\b)/.test(node.value))
  );
};
// 判断是否有前缀注释
const hasLeadingComments = node => {
  const leadingComments = node.leadingComments;
  return leadingComments && leadingComments.length;
};
// 判断是否后前缀注释
const hasTrailingComments = node => {
  const trailingComments = node.trailingComments;
  return trailingComments && trailingComments.length;
};
// 封装函数进行操做
const removeConsoleExpression = (path, calleePath, exclude, commentWords) => {
  // 如果传入的有数据不需要删除类型的
  if (isArray(exclude)) {
    const hasTarget = exclude.some(type => {
      return calleePath.matchesPattern('console.' + type);
    });
    //匹配上直接返回不进行操作
    if (hasTarget) {
      return;
    }
  }
  // 不符合exclude里面的内容执行下面步骤
  //获取父path
  const parentPath = path.parentPath;
  const parentNode = parentPath.node;
  //标识是否有前缀注释
  let leadingReserve = false;
  //标识是否有后缀注释
  let trailReserve = false;
  // 前缀处理
  if (hasLeadingComments(parentNode)) {
    parentNode.leadingComments.forEach(comment => {
      //belongCurrentLine是自定义的，官网并没有
      // 如果拿的是上一行的后缀,则!belongCurrentLine=false,进行删除
      if (isReserveComment(comment, commentWords) && !comment.belongCurrentLine) {
        leadingReserve = true;
      }
    });
  }
  // 后缀处理
  if (hasTrailingComments(parentNode)) {
    const {
      start: { line: currentLine }
    } = parentNode.loc; // 当前父级的行数

    // 标记下一个sibling节点遍历的key
    parentNode.trailingComments.forEach(comment => {
      const {
        start: { line: currentCommentLine }
      } = comment.loc; // 当前的行数
      if (currentLine === currentCommentLine) {
        comment.belongCurrentLine = true;
      }
      if (isReserveComment(comment, commentWords) && comment.belongCurrentLine) {
        trailReserve = true;
      }
    });
  }
  //如果没有前缀节点和后缀节点 直接删除节点
  if (!leadingReserve && !trailReserve) {
    path.remove();
  }
};

const visitor = {
  CallExpression(path, { opts }) {
    // path.get 表示获取某个属性的path
    // path.matchesPattern 检查某个节点是否符合某种模式
    // path.remove 删除当前节点
    let { env, exclude, commentWords } = opts; // 插件传过来的参数是否删除
    let calleePath = path.get('callee');
    if (calleePath && calleePath.matchesPattern('console', true)) {
      if (env == 'production' || isProduction) {
        removeConsoleExpression(path, calleePath, exclude, commentWords);
      }
    }
  }
};

module.exports = () => {
  return {
    name: 'transform-remove-consoles',
    visitor
  };
};
