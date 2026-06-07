/**
 * Reglas de mensajes de commit del repo.
 * Basado en Conventional Commits: https://www.conventionalcommits.org
 *
 * Formato esperado:
 *   <type>(<scope opcional>): <subject>
 *
 *   <body opcional>
 *
 *   <footer opcional>
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nueva funcionalidad para el usuario
        'fix',      // Corrección de bug
        'docs',     // Solo documentación (README, comentarios, etc.)
        'style',    // Formato, espacios, comas (no afecta lógica)
        'refactor', // Reestructurar código sin cambiar comportamiento
        'perf',     // Mejora de performance
        'test',     // Añadir o corregir tests
        'build',    // Cambios en el sistema de build o deps
        'ci',       // Cambios en configuración de CI
        'chore',    // Tareas de mantenimiento que no encajan arriba
        'revert',   // Revertir un commit anterior
      ],
    ],
    'subject-case': [0],          // permitir mayúsculas/minúsculas a gusto
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
    'body-max-line-length': [2, 'always', 120],
  },
};
