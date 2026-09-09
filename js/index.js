/**
 * Lógica da página principal (index.html) - Gráfico detalhado com zoom e filtros.
 */

let todosOsDados = [];
let meuGrafico = null;

async function inicializar() {
  try {
    // 1. Carrega dados via módulo compartilhado data.js
    todosOsDados = await carregarDadosTesouro('./data.csv');

    // 2. Popula o primeiro filtro (Tipos de Título únicos)
    const tiposTitulos = obterTiposTitulosUnicos(todosOsDados);
    const selectTitulo = document.getElementById('selectTitulo');
    selectTitulo.innerHTML = '';

    tiposTitulos.forEach(titulo => {
      const option = document.createElement('option');
      option.value = titulo;
      option.textContent = titulo;
      selectTitulo.appendChild(option);
    });

    // 3. Configura listeners dos filtros e botões
    selectTitulo.addEventListener('change', atualizarOpcoesVencimento);
    document.getElementById('selectVencimento').addEventListener('change', atualizarGrafico);
    
    const btnResetZoom = document.getElementById('btnResetZoom');
    if (btnResetZoom) {
      btnResetZoom.addEventListener('click', () => {
        if (meuGrafico) meuGrafico.resetZoom();
      });
    }

    // 4. Inicializa os vencimentos para o primeiro título selecionado
    atualizarOpcoesVencimento();
  } catch (erro) {
    console.error('Falha ao inicializar gráfico do Tesouro:', erro);
  }
}

// Atualiza o filtro de vencimentos conforme o Título selecionado
function atualizarOpcoesVencimento() {
  const tituloSelecionado = document.getElementById('selectTitulo').value;
  const selectVencimento = document.getElementById('selectVencimento');
  selectVencimento.innerHTML = '';

  const vencimentos = obterVencimentosPorTitulo(todosOsDados, tituloSelecionado);

  vencimentos.forEach(venc => {
    const option = document.createElement('option');
    option.value = venc;
    option.textContent = venc;
    selectVencimento.appendChild(option);
  });

  atualizarGrafico();
}

// Filtra, ordena e desenha o gráfico com o Título e Vencimento específicos
function atualizarGrafico() {
  const tituloSelecionado = document.getElementById('selectTitulo').value;
  const vencimentoSelecionado = document.getElementById('selectVencimento').value;

  if (!tituloSelecionado || !vencimentoSelecionado) return;

  // Filtra e ordena
  const dadosFiltrados = filtrarEOrdenarDados(todosOsDados, tituloSelecionado, vencimentoSelecionado);
  const series = extrairSeriesGrafico(dadosFiltrados);

  // Destrói gráfico anterior caso já exista
  if (meuGrafico) {
    meuGrafico.destroy();
  }

  // Renderiza o novo gráfico
  const ctx = document.getElementById('graficoTesouro').getContext('2d');
  meuGrafico = new Chart(ctx, {
    type: 'line',
    data: {
      labels: series.datas,
      datasets: criarDatasetsTesouro(series, { borderWidth: 2, borderDash: [5, 5] })
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // Permite preencher a altura do container
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        title: {
          display: true,
          text: `${tituloSelecionado} - Vencimento ${vencimentoSelecionado}`,
          font: { size: 14 }
        },
        legend: {
          labels: { font: { size: 12 } }
        },
        zoom: {
          pan: {
            enabled: true,
            mode: 'x'
          },
          zoom: {
            wheel: {
              enabled: true
            },
            pinch: {
              enabled: true
            },
            drag: {
              enabled: true,
              backgroundColor: 'rgba(31, 119, 180, 0.2)'
            },
            mode: 'x'
          }
        }
      },
      scales: obterEscalasPadraoChart({
        tickFontSize: 11,
        titleFontSize: 12
      })
    }
  });
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', inicializar);
