module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Customize rules if needed
    'subject-case': [2, 'never', ['upper-case', 'pascal-case']],
    'body-max-line-length': [2, 'always', 100],
  },
};