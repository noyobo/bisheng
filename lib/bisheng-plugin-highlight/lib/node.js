'use strict';

const Prism = require('node-prismjs');
const JsonML = require('jsonml.js/lib/utils');
const detective = require('detective-module');
const generator = require('import-generator');
const uppercamelcase = require('uppercamelcase');

function getCode(node) {
  return JsonML.getChildren(
    JsonML.getChildren(node)[0] || ''
  )[0] || '';
}

function highlight(node) {
  if (!JsonML.isElement(node)) return;

  if (JsonML.getTagName(node) !== 'pre') {
    JsonML.getChildren(node).forEach(highlight);
    return;
  }

  const lang = JsonML.getAttributes(node).lang;
  let code = getCode(node);
  let importCode = '';
  let variableCode = '';
  if (lang === 'jsx') {
    let moduleQueue = detective(code);
    // 格式化所有 ICE 的依赖
    const iceImportQueue = [];
    // 保留默认的依赖
    moduleQueue = moduleQueue.filter((dec) => {
      if (dec.name.indexOf('@ali/ice') === 0) {
        iceImportQueue.push(dec);
        return false;
      }
      return true;
    });

    const iceImportScheme = {
      name: '@ali/ice',
      members: [],
    };

    iceImportQueue.forEach((dec) => {
      // 通过小的来引用
      if (dec.name.indexOf('@ali/ice/lib') >= 0) {
        // 直接的引用
        if (dec.default) {
          iceImportScheme.members
            .push({
              name: dec.default,
              alias: dec.default,
            });
        }
        if (dec.members) {
          const name = uppercamelcase(dec.name.substring(13));
          iceImportScheme
            .members
            .push({
              name: name,
              alias: name,
            });
          let beforeChildVariable = 'const { ';
          let childVariable = [];
          dec.members.forEach((childMember) => {
            if (childMember.alias !== childMember.name) {
              childVariable.push(
                `${childMember.name} as ${childMember.alias}`
              );
            } else {
              childVariable.push(childMember.name);
            }
          });
          beforeChildVariable = beforeChildVariable + childVariable.join(', ');
          beforeChildVariable += ` } = ${name};\n`;
          variableCode += beforeChildVariable;
        }
      } else if (dec.name === '@ali/ice') {
        iceImportScheme.members =
          iceImportScheme.members.concat(dec.members || []);
      }
    });


    moduleQueue.push(iceImportScheme);

    const importRE =
      /(\bimport\s+(?:[^'"]+\s+from\s+)??)(['"])([^'"]+)(\2)(;)?/g;

    code = code.replace(importRE, '');

    moduleQueue.forEach((importScheme) => {
      // 添加到开头
      importCode += generator(importScheme) + '\n';
    });

    // 组合代码, 包括 import variable
    code = importCode + variableCode + code;

    // 移除连续的换行符, 保留一个就够了
    code = code.replace(/\n\s*\n/g, '\n\n');
  }

  const language = Prism.languages[lang] || Prism.languages.autoit;

  JsonML.getAttributes(node).highlighted = Prism.highlight(code, language);
}

module.exports = (markdownData /* , config*/ ) => {
  highlight(markdownData.content);
  return markdownData;
};
