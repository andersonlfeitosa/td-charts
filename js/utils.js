/**
 * Utilitários de conversão e parsing para dados do Tesouro Direto.
 */

/**
 * Converte valor no formato brasileiro (ex: "19729,11" ou "1.234,56") para float numérico (19729.11).
 * @param {string} valorStr - Valor em formato de string.
 * @returns {number|null} Valor numérico float ou null se inválido/vazio.
 */
function parseValorBR(valorStr) {
  if (!valorStr) return null;
  const valorFormatado = valorStr.replace(/\./g, '').replace(',', '.');
  return parseFloat(valorFormatado);
}

/**
 * Converte string de data no padrão brasileiro "DD/MM/AAAA" em objeto Date do JS para ordenação correta.
 * @param {string} dataStr - Data no formato "DD/MM/AAAA".
 * @returns {Date} Objeto Date.
 */
function parseDataBR(dataStr) {
  if (!dataStr) return new Date(0);
  const partes = dataStr.split('/');
  return new Date(partes[2], partes[1] - 1, partes[0]);
}
