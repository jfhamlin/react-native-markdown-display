import getTokenTypeByToken from './getTokenTypeByToken';

/**
 *
 * @param {{type: string, tag:string, content: string, children: *, attrs: Array, meta, info, block: boolean}} token
 * @param {number} tokenIndex
 * @return {{type: string, content, tokenIndex: *, index: number, attributes: {}, children: *}}
 */
function createNode(token, tokenIndex, parentKey) {
  const type = getTokenTypeByToken(token);
  const content = token.content;

  let attributes = {};

  if (token.attrs) {
    attributes = token.attrs.reduce((prev, curr) => {
      const [name, value] = curr;
      return {...prev, [name]: value};
    }, {});
  }

  const key = parentKey + '_' + type + '_' + tokenIndex;

  return {
    type,
    sourceType: token.type,
    sourceInfo: token.info,
    sourceMeta: token.meta,
    block: token.block,
    markup: token.markup,
    key,
    content,
    tokenIndex,
    index: 0,
    attributes,
    children: tokensToAST(token.children, key),
  };
}

/**
 *
 * @param {Array<{type: string, tag:string, content: string, children: *, attrs: Array}>}tokens
 * @return {Array}
 */
export default function tokensToAST(tokens, parentKey = 'root') {
  let parentKeyStack = [];
  let stack = [];
  let children = [];

  if (!tokens || tokens.length === 0) {
    return [];
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const astNode = createNode(token, i, parentKey);

    if (
      !(
        astNode.type === 'text' &&
        astNode.children.length === 0 &&
        astNode.content === ''
      )
    ) {
      astNode.index = children.length;

      if (token.nesting === 1) {
        children.push(astNode);
        stack.push(children);
        parentKeyStack.push(parentKey);
        parentKey = astNode.key;
        children = astNode.children;
      } else if (token.nesting === -1) {
        children = stack.pop();
        parentKey = parentKeyStack.pop();
      } else if (token.nesting === 0) {
        children.push(astNode);
      }
    }
  }

  return children;
}
