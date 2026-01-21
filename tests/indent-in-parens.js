'use strict';

const rule = require('../rules/indent-in-parens');
const RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
    }
});

ruleTester.run('indent-in-parens', rule, {
    valid: [
        // Basic aligned examples
        {
            code: `
if (options.force ||
    raw?.type == TreeItem.TYPE_GROUP_COLLAPSED_MEMBERS_COUNTER) {
}
`
        },
        {
            code: `
if (internalOrder.join('\\n') == actualOrder.join('\\n') &&
    internalOrder.join('\\n') == nativeOrder.join('\\n')) {
}
`
        },
        {
            code: `
if (insertBefore &&
    nextElement === undefined &&
    (containerElement == win.containerElement ||
     containerElement == win.pinnedContainerElement)) {
}
`
        },
        {
            code: `
if (shouldApplyAnimation() &&
    item.$TST.states.has(Constants.kTAB_STATE_EXPANDING) &&
    !item.$TST.states.has(Constants.kTAB_STATE_COLLAPSED)) {
}
`
        },
        // Return statements
        {
            code: `
function test() {
  return (message.type != \`treestyletab:\${TabPreviewPanel.TYPE}:show\` ||
          hoveringItemIds.has(message.targetId));
}
`
        },
        // Return statement with newline (should be ignored by this rule)
        {
            code: `
function test() {
  return (
    message.type != \`treestyletab:\${TabPreviewPanel.TYPE}:show\` ||
    hoveringItemIds.has(message.targetId)
  );
}
`
        },
        // Block scopes (should be ignored)
        {
            code: `
if (
    tabIds.every(id => {
      const tab = Tab.get(id);
      return !tab || tab.pinned || tab.hidden;
    })) {
}
`
        },
        // Array literals (should be ignored)
        {
            code: `
for (const [lastIds, currentIds, place] of [
  [[...mLastStickyItemIdsAbove], [...stickyItemIdsAbove], 'above'],
  [[...mLastStickyItemIdsBelow].reverse(), [...stickyItemIdsBelow].reverse(), 'below'],
]) {
}
`
        },
        // Ternary relaxed alignment (deeper indent allowed)
        {
            code: `
while (bestFrom + bestSize < fromEnd &&
       bestTo + bestSize < toEnd &&
       (shouldJunk ?
          this.junks[this.to[bestTo + bestSize]] :
          !this.junks[this.to[bestTo + bestSize]]) &&
       this.from[bestFrom + bestSize] == this.to[bestTo + bestSize]) {
}
`
        }
    ],

    invalid: [
        {
            code: `
if (options.force ||
  raw?.type == TreeItem.TYPE_GROUP_COLLAPSED_MEMBERS_COUNTER) {
}
`,
            output: `
if (options.force ||
    raw?.type == TreeItem.TYPE_GROUP_COLLAPSED_MEMBERS_COUNTER) {
}
`,
            errors: [{ messageId: 'wrongAlignment' }]
        },
        {
            code: `
if (insertBefore &&
  nextElement === undefined &&
  (containerElement == win.containerElement ||
  containerElement == win.pinnedContainerElement)) {
}
`,
            output: `
if (insertBefore &&
    nextElement === undefined &&
    (containerElement == win.containerElement ||
     containerElement == win.pinnedContainerElement)) {
}
`,
            errors: [
                { messageId: 'wrongAlignment' },
                { messageId: 'wrongAlignment' },
                { messageId: 'wrongAlignment' }
            ]
        },
        {
            code: `
function test() {
  return (message.type != \`treestyletab:\${TabPreviewPanel.TYPE}:show\` ||
    hoveringItemIds.has(message.targetId));
}
`,
            output: `
function test() {
  return (message.type != \`treestyletab:\${TabPreviewPanel.TYPE}:show\` ||
          hoveringItemIds.has(message.targetId));
}
`,
            errors: [{ messageId: 'wrongAlignment' }]
        }
    ]
});
