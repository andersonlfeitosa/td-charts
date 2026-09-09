/**
 * Configurações de cores, datasets e escalas padrão para o Chart.js.
 */

const CORES_TESOURO = {
  puCompra: '#1f77b4',   // Azul
  puVenda: '#d62728',    // Vermelho
  taxaCompra: '#2ca02c', // Verde
  taxaVenda: '#ff7f0e'   // Laranja
};

/**
 * Cria os 4 datasets padronizados para o gráfico (PU Compra, PU Venda, Taxa Compra, Taxa Venda).
 * @param {{ puCompra: Array, puVenda: Array, taxaCompra: Array, taxaVenda: Array }} series - Objeto contendo os arrays de dados.
 * @param {Object} [opcoes={}] - Opções visuais customizadas (ex: borderWidth, pointRadius, borderDash).
 * @returns {Array<Object>} Lista de datasets formatada para o Chart.js.
 */
function criarDatasetsTesouro(series, opcoes = {}) {
  const borderWidth = opcoes.borderWidth ?? 2;
  const pointRadius = opcoes.pointRadius !== undefined ? opcoes.pointRadius : undefined;
  const borderDash = opcoes.borderDash ?? [5, 5];

  const datasetConfig = (label, data, cor, yAxisID, isDashed = false) => {
    const cfg = {
      label,
      data,
      borderColor: cor,
      backgroundColor: cor,
      borderWidth,
      yAxisID,
      fill: false,
      tension: 0.1
    };
    if (pointRadius !== undefined) cfg.pointRadius = pointRadius;
    if (isDashed) cfg.borderDash = borderDash;
    return cfg;
  };

  return [
    datasetConfig('PU Compra (R$)', series.puCompra, CORES_TESOURO.puCompra, 'y'),
    datasetConfig('PU Venda (R$)', series.puVenda, CORES_TESOURO.puVenda, 'y'),
    datasetConfig('Taxa Compra (%)', series.taxaCompra, CORES_TESOURO.taxaCompra, 'y1', true),
    datasetConfig('Taxa Venda (%)', series.taxaVenda, CORES_TESOURO.taxaVenda, 'y1', true)
  ];
}

/**
 * Retorna as definições padrão de escalas com eixos duplos (Y = Preço, Y1 = Taxa).
 * @param {Object} [opcoes={}] - Opções customizadas de escala.
 * @returns {Object} Configuração de scales para o Chart.js.
 */
function obterEscalasPadraoChart(opcoes = {}) {
  const tickFontSize = opcoes.tickFontSize ?? 11;
  const titleFontSize = opcoes.titleFontSize ?? 12;
  const maxRotation = opcoes.maxRotation;

  const xConfig = {
    title: {
      display: opcoes.exibirTituloX ?? true,
      text: 'Data Base',
      font: { size: titleFontSize }
    },
    ticks: {
      font: { size: tickFontSize }
    }
  };

  if (maxRotation !== undefined) {
    xConfig.ticks.maxRotation = maxRotation;
  }

  return {
    x: xConfig,
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      title: {
        display: true,
        text: opcoes.tituloY ?? 'Preço Unitário (R$)',
        font: { size: titleFontSize }
      },
      ticks: {
        font: { size: tickFontSize }
      }
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      title: {
        display: true,
        text: opcoes.tituloY1 ?? 'Taxa (%)',
        font: { size: titleFontSize }
      },
      ticks: {
        font: { size: tickFontSize }
      },
      grid: {
        drawOnChartArea: false // Evita poluição visual das linhas de grade do 2º eixo
      }
    }
  };
}
