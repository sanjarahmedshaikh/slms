/**
 * Escapes regex special characters in a string to prevent ReDoS injection attacks.
 * @param {string} string 
 * @returns {string} Escaped string safe for RegExp construction
 */
function escapeRegExp(string) {
  if (typeof string !== 'string') return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = escapeRegExp;
