'use strict';

module.exports = {
    meta: {
        type: 'layout',
        fixable: 'whitespace',
        docs: {
            description: 'Enforce indent alignment after opening parenthesis in control statements',
        },
        messages: {
            wrongAlignment: 'Expected indentation of at least {{expected}} spaces but found {{actual}} spaces.',
        },
    },
    create(context) {
        const sourceCode = context.sourceCode;

        function validateAlignment(node, startToken, endToken) {
            if (!startToken || !endToken) return;

            // Get all tokens between the start and end tokens (inclusive)
            const tokens = sourceCode.getTokensBetween(startToken, endToken, { includeComments: true });

            // We need to process the sequence of tokens including the start/end to track parens correctly
            // effectively we want to scan [startToken, ...tokens, endToken]
            // But getTokensBetween excludes start/end.

            const allTokens = [startToken, ...tokens, endToken];

            // Stack to hold the valid indentations.
            // Each entry is the column index where the next line should start.
            const indentStack = [];

            // Push the initial control statement paren
            if (startToken.value === '(') {
                // Check if the FIRST token inside the range (allTokens[1]) is on a new line
                if (allTokens.length > 1 && allTokens[1].loc.start.line > startToken.loc.start.line) {
                    indentStack.push(null);
                }
                else {
                    indentStack.push(startToken.loc.end.column);
                }
            }

            let lastTokenLine = startToken.loc.start.line;

            // We iterate from the second token since the first one (startToken) set the initial stack
            for (let i = 1; i < allTokens.length; i++) {
                const token = allTokens[i];
                const tokenLine = token.loc.start.line;

                // If this token is on a new line compared to the previous one
                if (tokenLine > lastTokenLine) {
                    // Check if it's the first token on the line
                    const tokenIndex = sourceCode.getIndexFromLoc(token.loc.start);
                    const lineStartContext = sourceCode.getText().slice(sourceCode.getIndexFromLoc({ line: tokenLine, column: 0 }), tokenIndex);

                    // Only check indentation if it's the first token on the line (only whitespace before)
                    if (/^\s*$/.test(lineStartContext) && indentStack.length > 0) {
                        const expectedIndent = indentStack[indentStack.length - 1];
                        // If expectedIndent is null, it means we are in a block that should be ignored (standard indent)
                        if (expectedIndent !== null) {
                            if (token.loc.start.column < expectedIndent) {
                                context.report({
                                    node: token,
                                    loc: token.loc,
                                    messageId: 'wrongAlignment',
                                    data: {
                                        expected: expectedIndent,
                                        actual: token.loc.start.column
                                    },
                                    fix(fixer) {
                                        const diff = expectedIndent - token.loc.start.column;
                                        if (diff > 0) {
                                            return fixer.insertTextBefore(token, ' '.repeat(diff));
                                        }
                                        else {
                                            return fixer.removeRange([
                                                token.range[0] - (token.loc.start.column - expectedIndent),
                                                token.range[0]
                                            ]);
                                        }
                                    }
                                });
                            }
                        }
                    }
                }

                // Update stack based on current token
                if (token.value === '(') {
                    // Check if the next token is on the same line
                    if (i + 1 < allTokens.length) {
                        const nextToken = allTokens[i + 1];
                        if (nextToken.loc.start.line > token.loc.start.line) {
                            // Next token is on a new line. 
                            // We do NOT enforce alignment column for this block.
                            indentStack.push(null);
                        }
                        else {
                            // Next token is on same line. Enforce alignment to the end of this paren (or start of next token).
                            indentStack.push(token.loc.end.column);
                        }
                    }
                    else {
                        // End of tokens? Should usually not happen if scanned properly.
                        indentStack.push(token.loc.end.column);
                    }
                }
                else if (token.value === ')') {
                    indentStack.pop();
                }
                else if (token.value === '{') {
                    // Start of a block (function body, object literal, etc.)
                    // Usually we want standard indentation here, not alignment to the parens.
                    indentStack.push(null);
                }
                else if (token.value === '}') {
                    indentStack.pop();
                }
                else if (token.value === '[') {
                    // Start of an array literal etc.
                    indentStack.push(null);
                }
                else if (token.value === ']') {
                    indentStack.pop();
                }

                lastTokenLine = tokenLine;
            }
        }

        return {
            IfStatement(node) {
                const openParen = sourceCode.getTokenBefore(node.test);
                const closeParen = sourceCode.getTokenAfter(node.test);
                validateAlignment(node, openParen, closeParen);
            },
            WhileStatement(node) {
                const openParen = sourceCode.getTokenBefore(node.test);
                const closeParen = sourceCode.getTokenAfter(node.test);
                validateAlignment(node, openParen, closeParen);
            },
            DoWhileStatement(node) {
                const openParen = sourceCode.getTokenBefore(node.test);
                const closeParen = sourceCode.getTokenAfter(node.test);
                validateAlignment(node, openParen, closeParen);
            },
            SwitchStatement(node) {
                const openParen = sourceCode.getTokenBefore(node.discriminant);
                const closeParen = sourceCode.getTokenAfter(node.discriminant);
                validateAlignment(node, openParen, closeParen);
            },
            ForStatement(node) {
                const forToken = sourceCode.getFirstToken(node);
                const openParen = sourceCode.getTokenAfter(forToken);
                // For 'for' loops, finding the closing paren is trickier because of semicolons vs in/of
                // But generally, the logic in previous code was scanning tokens.
                // Let's reuse the scanning logic to find the matching close paren.
                let depth = 1;
                let closeParen = null;
                let token = openParen;
                while (depth > 0) {
                    token = sourceCode.getTokenAfter(token);
                    if (!token) break;
                    if (token.value === '(') depth++;
                    else if (token.value === ')') depth--;

                    if (depth === 0) closeParen = token;
                }
                validateAlignment(node, openParen, closeParen);
            },
            ForInStatement(node) {
                const forToken = sourceCode.getFirstToken(node);
                const openParen = sourceCode.getTokenAfter(forToken);
                let depth = 1;
                let closeParen = null;
                let token = openParen;
                while (depth > 0) {
                    token = sourceCode.getTokenAfter(token);
                    if (!token) break;
                    if (token.value === '(') depth++;
                    else if (token.value === ')') depth--;
                    if (depth === 0) closeParen = token;
                }
                validateAlignment(node, openParen, closeParen);
            },
            ForOfStatement(node) {
                const forToken = sourceCode.getFirstToken(node);
                const openParen = sourceCode.getTokenAfter(forToken);
                let depth = 1;
                let closeParen = null;
                let token = openParen;
                while (depth > 0) {
                    token = sourceCode.getTokenAfter(token);
                    if (!token) break;
                    if (token.value === '(') depth++;
                    else if (token.value === ')') depth--;
                    if (depth === 0) closeParen = token;
                }
                validateAlignment(node, openParen, closeParen);
            },
            ReturnStatement(node) {
                // Check if return statement has parentheses around the argument
                if (!node.argument) return;

                const openParen = sourceCode.getTokenBefore(node.argument);
                if (!openParen || openParen.value !== '(') return;

                // If there is a paren before argument, we need to find the matching one after argument.
                // Simple assumption: if it starts with (, it ends with )
                // But checking if that ( is actually part of the return value or just part of expression
                // e.g. return (a + b); vs return (a + b) * c;  <- in second case parens are part of expression
                // But generally users want alignment inside ANY parens that span lines.
                // However, the rule description is "Enforce indent alignment after opening parenthesis in control statements"
                // The user request included "if, for, while, return".

                // Let's try to match parenthesis around the whole argument if possible.
                // getTokenAfter(node.argument) might include semicolons.

                const closeParen = sourceCode.getTokenAfter(node.argument);
                if (closeParen && closeParen.value === ')') {
                    validateAlignment(node, openParen, closeParen);
                }
                else {
                    // Maybe the argument itself is a ParenthesizedExpression (AST node type usually hidden)
                    // If we just scanned tokens from return keyword:
                    // return ( ... );
                    // openParen found before node.argument.
                    // We need to find balancing paren.

                    let depth = 1;
                    let closeParenFound = null;
                    let token = openParen;
                    while (depth > 0) {
                        token = sourceCode.getTokenAfter(token);
                        if (!token) break;
                        if (token.value === '(') depth++;
                        else if (token.value === ')') depth--;

                        if (depth === 0) closeParenFound = token;
                    }
                    if (closeParenFound) {
                        validateAlignment(node, openParen, closeParenFound);
                    }
                }
            }
        };
    }
};
