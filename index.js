'use strict';

const recast = require(`recast`);
const fs = require(`fs`);
const path = require(`path`);
const builders = recast.types.builders;

function processFile(filePath, basePath, stubs = {}) {
    const script = fs.readFileSync(path.join(basePath, filePath), `utf8`);
    const ast = recast.parse(script);

    recast.visit(ast, {
        visitExpressionStatement: function (p) {
            if (
                p.node.expression &&
                p.node.expression.callee &&
                p.node.expression.callee.name === `load`
            ) {
                const loadPath = p.node.expression.arguments[0].value;
                if (loadPath in stubs) {

                } else {
                    const code = processFile(loadPath, basePath);

                    p.replace(code);
                }
            }

            this.traverse(p);
        }
    });

    return recast.print(ast).code;
}

module.exports = (filePath, stubs) => {
    const code = processFile(path.basename(filePath), path.dirname(filePath), stubs);

    return new Function(code)();
}
