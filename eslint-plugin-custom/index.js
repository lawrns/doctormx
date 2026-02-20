/**
 * Custom ESLint Plugin for DoctorMX
 * 
 * Este plugin contiene reglas personalizadas para mantener la calidad del código
 * y garantizar el cumplimiento de estándares del proyecto.
 */

module.exports = {
  meta: {
    name: 'eslint-plugin-custom',
    version: '1.0.0'
  },
  rules: {
    'no-hardcoded-spanish': require('./rules/no-hardcoded-spanish')
  }
};
