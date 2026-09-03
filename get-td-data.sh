#!/usr/bin/env bash

# Define a URL de origem do arquivo CSV do Tesouro Transparente
URL="https://www.tesourotransparente.gov.br/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/resource/796d2059-14e9-44e3-80c9-2d9e30b405c1/download/precotaxatesourodireto.csv"

# Nome do arquivo de destino
OUTPUT_FILE="data.csv"

echo "Iniciando o download dos dados do Tesouro Direto..."

# Usa curl para baixar o arquivo
# Parâmetros:
# -L: Segue redirecionamentos HTTP (se houver)
# -f: Falha silenciosamente em erros de servidor HTTP (404, 500, etc.)
# -o: Especifica o nome do arquivo de saída
curl -L -f "$URL" -o "$OUTPUT_FILE"

# Verifica se o comando curl foi executado com sucesso
if [ $? -eq 0 ]; then
    echo "Download concluído com sucesso! Arquivo salvo como $OUTPUT_FILE"
else
    echo "Erro ao realizar o download do arquivo." >&2
    exit 1
fi