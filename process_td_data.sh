#!/usr/bin/env bash

CSV_FILE="data.csv"
JSON_DIR="json"

if [ ! -f "$CSV_FILE" ]; then
    echo "Erro: Arquivo $CSV_FILE não encontrado!" >&2
    exit 1
fi

# Cria a pasta 'json' caso não exista
mkdir -p "$JSON_DIR"

echo "Processando $CSV_FILE..."

awk -F';' -v OUTPUT_DIR="$JSON_DIR" '
# Função para converter DD/MM/AAAA em AAAAMMXX para comparação numérica
function data_para_numero(d) {
    split(d, a, "/")
    return sprintf("%04d%02d%02d", a[3], a[2], a[1])
}

# 1. Primeira passada: Descobre a data base mais recente
NR > 1 {
    d_num = data_para_numero($3)
    if (d_num > max_data_num) {
        max_data_num = d_num
        max_data_str = $3
    }
    linhas[NR] = $0
}

# 2. Segunda passada (executada no final do arquivo): Filtra e gera os JSONs
END {
    print "Data mais recente encontrada: " max_data_str

    for (i in linhas) {
        $0 = linhas[i]
        
        # Filtra apenas registros com a data base mais recente
        if ($3 != max_data_str) continue

        tipo_titulo = $1
        vencimento  = $2
        data_base   = $3
        taxa_compra = $4
        taxa_venda  = $5
        pu_compra   = $6
        pu_venda    = $7
        pu_base     = $8

        # Extrai o ano do vencimento (ex: "15/05/2035" -> "2035")
        split(vencimento, v_arr, "/")
        ano_venc = v_arr[3]

        # Normaliza o prefixo do nome do título
        prefixo = ""
        if (tipo_titulo ~ /Tesouro Selic/) {
            prefixo = "SELIC"
        } else if (tipo_titulo ~ /Tesouro Prefixado com Juros Semestrais/) {
            prefixo = "PREFIXADO_JUROS"
        } else if (tipo_titulo ~ /Tesouro Prefixado/) {
            prefixo = "PREFIXADO"
        } else if (tipo_titulo ~ /Tesouro IPCA\+ com Juros Semestrais/) {
            prefixo = "IPCA_JUROS"
        } else if (tipo_titulo ~ /Tesouro IPCA\+/) {
            prefixo = "IPCA"
        } else if (tipo_titulo ~ /Tesouro IGPM\+/) {
            prefixo = "IGPM"
        } else if (tipo_titulo ~ /Tesouro Renda\+/) {
            prefixo = "RENDA_MAIS"
        } else if (tipo_titulo ~ /Tesouro Educa\+/) {
            prefixo = "EDUCA_MAIS"
        } else {
            prefixo = "OUTROS"
        }

        # Constrói o nome do arquivo e o caminho final
        nome_padrao = prefixo "_" ano_venc
        nome_arquivo = tolower(nome_padrao) ".json"
        caminho_arquivo = OUTPUT_DIR "/" nome_arquivo

        # Escreve o arquivo JSON formatado
        printf "{\n" > caminho_arquivo
        printf "  \"nome_original\": \"%s\",\n", tipo_titulo > caminho_arquivo
        printf "  \"nome_padrao\": \"%s\",\n", nome_padrao > caminho_arquivo
        printf "  \"vencimento\": \"%s\",\n", vencimento > caminho_arquivo
        printf "  \"data_base\": \"%s\",\n", data_base > caminho_arquivo
        printf "  \"taxa_compra_manha\": \"%s\",\n", taxa_compra > caminho_arquivo
        printf "  \"taxa_venda_manha\": \"%s\",\n", taxa_venda > caminho_arquivo
        printf "  \"pu_compra_manha\": \"%s\",\n", pu_compra > caminho_arquivo
        printf "  \"pu_venda_manha\": \"%s\",\n", pu_venda > caminho_arquivo
        printf "  \"pu_base_manha\": \"%s\"\n", pu_base > caminho_arquivo
        printf "}\n" > caminho_arquivo

        close(caminho_arquivo)
        print "Gerado: " caminho_arquivo
    }
}
' "$CSV_FILE"

echo "Processamento concluído com sucesso!"