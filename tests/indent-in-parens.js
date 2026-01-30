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
            options: [2],
            code: `
if (options.force ||
    raw?.type == TreeItem.TYPE_GROUP_COLLAPSED_MEMBERS_COUNTER) {
}
`
        },
        {
            options: [2],
            code: `
if (internalOrder.join('\\n') == actualOrder.join('\\n') &&
    internalOrder.join('\\n') == nativeOrder.join('\\n')) {
}
`
        },
        {
            options: [2],
            code: `
if (insertBefore &&
    nextElement === undefined &&
    (containerElement == win.containerElement ||
     containerElement == win.pinnedContainerElement)) {
}
`
        },
        {
            options: [2],
            code: `
if (shouldApplyAnimation() &&
    item.$TST.states.has(Constants.kTAB_STATE_EXPANDING) &&
    !item.$TST.states.has(Constants.kTAB_STATE_COLLAPSED)) {
}
`
        },
        // Return statements
        {
            options: [2],
            code: `
function test() {
  return (message.type != \`treestyletab:\${TabPreviewPanel.TYPE}:show\` ||
          hoveringItemIds.has(message.targetId));
}
`
        },
        // Return statement with newline (should be ignored by this rule)
        {
            options: [2],
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
            options: [2],
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
            options: [2],
            code: `
for (const [lastIds, currentIds, place] of [
  [[...mLastStickyItemIdsAbove], [...stickyItemIdsAbove], 'above'],
  [[...mLastStickyItemIdsBelow].reverse(), [...stickyItemIdsBelow].reverse(), 'below'],
]) {
}
`
        },
        // Ternary relaxed alignment (+2 indent)
        {
            options: [2],
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
            options: [2],
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
            options: [2],
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
            options: [2],
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
        },
        // Ternary incorrect alignment (should be +2)
        {
            options: [2],
            code: `
while (bestFrom + bestSize < fromEnd &&
       bestTo + bestSize < toEnd &&
       (shouldJunk ?
        this.junks[this.to[bestTo + bestSize]] :
        !this.junks[this.to[bestTo + bestSize]]) &&
       this.from[bestFrom + bestSize] == this.to[bestTo + bestSize]) {
}
`,
            output: `
while (bestFrom + bestSize < fromEnd &&
       bestTo + bestSize < toEnd &&
       (shouldJunk ?
          this.junks[this.to[bestTo + bestSize]] :
          !this.junks[this.to[bestTo + bestSize]]) &&
       this.from[bestFrom + bestSize] == this.to[bestTo + bestSize]) {
}
`,
            errors: [
                { messageId: 'wrongAlignment' },
                { messageId: 'wrongAlignment' }
            ]
        }
    ]
});
