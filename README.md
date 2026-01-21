# eslint-plugin-indent-in-parens

Enforce indent alignment after opening parenthesis in control statements.

This plugin is created with Google Antigravity (Geminit 3 Pro (High)).

## Installation

You'll first need to install [ESLint](https://eslint.org/):

```sh
npm i eslint --save-dev
```

Next, install `eslint-plugin-indent-in-parens`:

```sh
npm install eslint-plugin-indent-in-parens --save-dev
```

## Usage

Add `indent-in-parens` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "indent-in-parens"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "indent-in-parens/indent-in-parens": "error"
    }
}
```

## Rules

### `indent-in-parens`

Enforces that content follows the alignment of the opening parenthesis in control statements (`if`, `while`, `for`, `switch`) and `return` statements, if the content starts on the same line as the opening parenthesis.

**Incorrect:**

```javascript
if (condition &&
  otherCondition) {
}
```

**Correct:**

```javascript
if (condition &&
    otherCondition) {
}
```

It relaxes standard indentation rules for:
- Content inside block scopes `{ ... }` (uses standard indent).
- Content inside array literals `[ ... ]` (uses standard indent).
- Opening parentheses immediately followed by a newline (uses standard indent).
- Ternary operators or other expressions where indentation is *deeper* than the alignment column.
