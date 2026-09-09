/**
 * Lógica da página de visão geral (dashboard.html) - Grid com minigráficos de todos os títulos.
 */

async function carregarETodosGraficos() {
  try {
    const todosOsDados = await carregarDadosTesouro('./data.csv');
    const combinacoesUnicas = obterCombinacoesUnicas(todosOsDados);
    const containerGrid = document.getElementById('gridGraficos');
    containerGrid.innerHTML = '';

    // Para cada combinação única de [Título + Vencimento], cria um card com <canvas> e plota o gráfico
    combinacoesUnicas.forEach((comb, index) => {
      const dadosFiltrados = filtrarEOrdenarDados(todosOsDados, comb.titulo, comb.vencimento);
      const series = extrairSeriesGrafico(dadosFiltrados);

      // Cria os elementos do Card no DOM
      const card = document.createElement('div');
      card.className = 'card-grafico';

      const canvas = document.createElement('canvas');
      canvas.id = `grafico_${index}`;

      card.appendChild(canvas);
      containerGrid.appendChild(card);

      // Renderiza o Chart.js com dois eixos Y (Esquerda = PU R$, Direita = Taxa %)
      new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
          labels: series.datas,
          datasets: criarDatasetsTesouro(series, {
            borderWidth: 1.5,
            pointRadius: 1,
            borderDash: [4, 4]
          })
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            title: {
              display: true,
              text: `${comb.titulo} (${comb.vencimento})`,
              font: {
                size: 13
              }
            },
            legend: {
              labels: {
                boxWidth: 10,
                font: {
                  size: 10
                }
              }
            }
          },
          scales: obterEscalasPadraoChart({
            exibirTituloX: false,
            tickFontSize: 9,
            titleFontSize: 9,
            maxRotation: 45,
            tituloY: 'PU (R$)',
            tituloY1: 'Taxa (%)'
          })
        }
      });
    });
  } catch (erro) {
    console.error('Falha ao carregar os minigráficos do dashboard:', erro);
  }
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', carregarETodosGraficos);
