/**
 * Módulo de carregamento e manipulação dos dados do Tesouro Direto via CSV.
 */

/**
 * Carrega o arquivo CSV do Tesouro Direto e realiza o parse com PapaParse.
 * @param {string} [caminhoCsv='./data.csv'] - Caminho do arquivo CSV.
 * @returns {Promise<Array<Object>>} Lista de objetos com os registros do CSV.
 */
async function carregarDadosTesouro(caminhoCsv = './data.csv') {
  const resposta = await fetch(caminhoCsv);
  if (!resposta.ok) {
    throw new Error(`Erro ao carregar o arquivo ${caminhoCsv}: ${resposta.statusText}`);
  }
  const textoCsv = await resposta.text();

  return new Promise((resolve, reject) => {
    Papa.parse(textoCsv, {
      header: true,
      delimiter: ";",
      skipEmptyLines: true,
      complete: function (resultado) {
        resolve(resultado.data);
      },
      error: function (erro) {
        reject(erro);
      }
    });
  });
}

/**
 * Retorna lista ordenada de tipos de títulos únicos presentes nos dados.
 * @param {Array<Object>} dados
 * @returns {Array<string>}
 */
function obterTiposTitulosUnicos(dados) {
  return [...new Set(dados.map(item => item['Tipo Titulo']))].filter(Boolean);
}

/**
 * Retorna lista de vencimentos únicos para um determinado tipo de título.
 * @param {Array<Object>} dados
 * @param {string} tipoTitulo
 * @returns {Array<string>}
 */
function obterVencimentosPorTitulo(dados, tipoTitulo) {
  return [...new Set(
    dados
      .filter(item => item['Tipo Titulo'] === tipoTitulo)
      .map(item => item['Data Vencimento'])
  )].filter(Boolean);
}

/**
 * Retorna combinações únicas de [Tipo Titulo] e [Data Vencimento], ordenadas alfabeticamente.
 * @param {Array<Object>} dados
 * @returns {Array<{titulo: string, vencimento: string}>}
 */
function obterCombinacoesUnicas(dados) {
  const combinacoes = [];
  const mapaChaves = new Set();

  dados.forEach(item => {
    const titulo = item['Tipo Titulo'];
    const vencimento = item['Data Vencimento'];

    if (titulo && vencimento) {
      const chave = `${titulo}|${vencimento}`;
      if (!mapaChaves.has(chave)) {
        mapaChaves.add(chave);
        combinacoes.push({ titulo, vencimento });
      }
    }
  });

  combinacoes.sort((a, b) =>
    a.titulo.localeCompare(b.titulo) || a.vencimento.localeCompare(b.vencimento)
  );

  return combinacoes;
}

/**
 * Filtra registros por tipo de título e vencimento, e ordena cronologicamente por Data Base.
 * @param {Array<Object>} dados
 * @param {string} tipoTitulo
 * @param {string} vencimento
 * @returns {Array<Object>} Registros filtrados e ordenados.
 */
function filtrarEOrdenarDados(dados, tipoTitulo, vencimento) {
  const filtrados = dados.filter(item =>
    item['Tipo Titulo'] === tipoTitulo &&
    item['Data Vencimento'] === vencimento
  );

  filtrados.sort((a, b) => parseDataBR(a['Data Base']) - parseDataBR(b['Data Base']));
  return filtrados;
}

/**
 * Extrai as séries temporais necessárias para o Chart.js (Datas, Preços e Taxas).
 * @param {Array<Object>} dadosFiltrados
 * @returns {{ datas: string[], puCompra: (number|null)[], puVenda: (number|null)[], taxaCompra: (number|null)[], taxaVenda: (number|null)[] }}
 */
function extrairSeriesGrafico(dadosFiltrados) {
  return {
    datas: dadosFiltrados.map(item => item['Data Base']),
    puCompra: dadosFiltrados.map(item => parseValorBR(item['PU Compra Manha'])),
    puVenda: dadosFiltrados.map(item => parseValorBR(item['PU Venda Manha'])),
    taxaCompra: dadosFiltrados.map(item => parseValorBR(item['Taxa Compra Manha'])),
    taxaVenda: dadosFiltrados.map(item => parseValorBR(item['Taxa Venda Manha']))
  };
}
