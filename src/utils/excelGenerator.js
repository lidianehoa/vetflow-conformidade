// src/utils/excelGenerator.js
import ExcelJS from "exceljs";

/**
 * Gera e faz download de uma planilha Excel baseada no objeto da planilha do seed.
 * @param {Object} planilha - Objeto da planilha do planilhasSistema.json
 * @param {Object} userData - Dados do usuário logado
 * @param {Object} unidade  - Dados da unidade/clínica ativa
 */
export async function gerarPlanilhaExcel(planilha, userData, unidade) {
  // Caso a planilha ainda use o formato antigo (XLSX puro sem arquivo_excel)
  if (!planilha.arquivo_excel) {
    console.warn("Planilha sem configuração de arquivo_excel. Utilize a versão anterior.");
    return;
  }

  const wb = new ExcelJS.Workbook();
  wb.creator  = "VERTOS OS";
  wb.created  = new Date();
  wb.modified = new Date();

  const excel = planilha.arquivo_excel;
  const ws = wb.addWorksheet(excel.nome_aba);

  // ── Cabeçalho com identidade do estabelecimento ───────────────────────
  const nomeClinica = unidade?.razaoSocial || unidade?.nomeFantasia || "Estabelecimento";
  const nomeRT      = userData?.rtNome || userData?.displayName || "";
  const crmvRT      = userData?.rtCrmv || userData?.crmv || "";
  const dataGeracao = new Date().toLocaleDateString("pt-BR");

  const titleRow = ws.addRow([`${planilha.nome} — ${nomeClinica}`]);
  titleRow.getCell(1).font = { bold: true, size: 13, color: { argb: "FF" + excel.cor_cabecalho } };
  ws.mergeCells(`A1:${String.fromCharCode(64 + excel.colunas.length)}1`);

  const infoRow = ws.addRow([
    `RT: ${nomeRT} — ${crmvRT}   |   Gerado em: ${dataGeracao}   |   Ref.: ${planilha.legislacao}`
  ]);
  infoRow.getCell(1).font = { italic: true, size: 9, color: { argb: "FF666666" } };
  ws.mergeCells(`A2:${String.fromCharCode(64 + excel.colunas.length)}2`);
  ws.addRow([]); // linha em branco

  // ── Linha de cabeçalho das colunas ───────────────────────────────────
  const headerRow = ws.addRow(excel.colunas.map(c => c.cabecalho));
  const HEADER_ROW_NUM = 4;

  headerRow.eachCell((cell, colNum) => {
    cell.fill = {
      type: "pattern", pattern: "solid",
      fgColor: { argb: "FF" + excel.cor_cabecalho },
    };
    cell.font = {
      bold: true,
      color: { argb: "FF" + (excel.cor_fonte_cabecalho || "FFFFFF") },
      size: 10,
    };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = {
      bottom: { style: "medium", color: { argb: "FF" + excel.cor_cabecalho } },
    };
  });
  headerRow.height = 30;

  // ── Largura das colunas ───────────────────────────────────────────────
  if (excel.largura_colunas) {
    excel.largura_colunas.forEach((w, i) => {
      ws.getColumn(i + 1).width = w;
    });
  }

  // ── Linhas de exemplo ─────────────────────────────────────────────────
  const FIRST_DATA_ROW = HEADER_ROW_NUM + 1;
  const linhasExemplo = excel.linhas_exemplo || [];

  linhasExemplo.forEach((linhaData, rowIdx) => {
    const row = ws.addRow(linhaData);
    const excelRowNum = FIRST_DATA_ROW + rowIdx;

    row.eachCell({ includeEmpty: true }, (cell, colNum) => {
      const colDef = excel.colunas[colNum - 1];
      if (!colDef) return;

      // Formatação por tipo
      if (colDef.tipo === "data") {
        cell.numFmt = "dd/mm/yyyy";
        cell.alignment = { horizontal: "center" };
      }
      if (colDef.tipo === "status_calculado" || colDef.tipo === "status_manual") {
        cell.alignment = { horizontal: "center" };
      }

      // Cores condicionais para status
      if (colDef.tipo === "status_calculado" && colDef.cores) {
        const val = String(cell.value || "");
        const corKey = Object.keys(colDef.cores).find(k => val.includes(k));
        if (corKey) {
          cell.fill = {
            type: "pattern", pattern: "solid",
            fgColor: { argb: "FF" + colDef.cores[corKey] },
          };
        }
      }
      if (colDef.tipo === "status_manual" && colDef.cores) {
        const val = String(cell.value || "");
        const corKey = Object.keys(colDef.cores).find(k => val.includes(k));
        if (corKey) {
          cell.fill = {
            type: "pattern", pattern: "solid",
            fgColor: { argb: "FF" + colDef.cores[corKey] },
          };
        }
      }
    });
  });

  // ── Linhas em branco para preenchimento (30 linhas) ──────────────────
  const TOTAL_DATA_ROWS = 30;
  for (let i = linhasExemplo.length; i < TOTAL_DATA_ROWS; i++) {
    const row = ws.addRow(Array(excel.colunas.length).fill(""));
    row.eachCell({ includeEmpty: true }, (cell, colNum) => {
      const colDef = excel.colunas[colNum - 1];
      if (!colDef) return;
      if (colDef.tipo === "data") {
        cell.numFmt = "dd/mm/yyyy";
        cell.alignment = { horizontal: "center" };
      }

      // Dropdown para status_manual
      if (colDef.tipo === "status_manual" && colDef.opcoes?.length) {
        cell.dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: [`"${colDef.opcoes.join(",")}"`],
          showDropDown: false,
        };
      }
    });
  }

  // ── Fórmulas calculadas (ex: Status Geral Vacinação) ─────────────────
  const colsCalculadas = excel.colunas.filter(c => c.tipo === "status_calculado");
  if (colsCalculadas.length > 0) {
    const dataStartRow = FIRST_DATA_ROW;
    const dataEndRow   = FIRST_DATA_ROW + TOTAL_DATA_ROWS - 1;

    for (let r = dataStartRow; r <= dataEndRow; r++) {
      colsCalculadas.forEach(colDef => {
        const colIdx = excel.colunas.findIndex(c => c.letra === colDef.letra) + 1;
        const cell   = ws.getRow(r).getCell(colIdx);
        const formula = colDef.formula_excel.replace(/\{linha\}/g, r);
        cell.value = { formula };
        cell.alignment = { horizontal: "center" };
      });
    }
  }

  // ── Rodapé de assinatura ──────────────────────────────────────────────
  if (excel.rodape) {
    ws.addRow([]); // linha em branco
    ws.addRow([]); // linha em branco
    const rodapeRow = ws.addRow([excel.rodape.texto_assinatura]);
    rodapeRow.getCell(1).font = { italic: true, size: 9 };
    ws.mergeCells(`A${rodapeRow.number}:${String.fromCharCode(64 + excel.colunas.length)}${rodapeRow.number}`);

    const refRow = ws.addRow([excel.rodape.referencia_legal]);
    refRow.getCell(1).font = { italic: true, size: 8, color: { argb: "FF888888" } };
    ws.mergeCells(`A${refRow.number}:${String.fromCharCode(64 + excel.colunas.length)}${refRow.number}`);
  }

  // ── Aba de instruções (se existir) ───────────────────────────────────
  if (excel.aba_instrucoes) {
    const wsInstr = wb.addWorksheet(excel.aba_instrucoes.nome);
    wsInstr.getColumn(1).width = 80;
    excel.aba_instrucoes.conteudo.forEach(linha => {
      const r = wsInstr.addRow([linha]);
      if (linha && !linha.startsWith("•") && !linha.startsWith(" ")) {
        r.getCell(1).font = { bold: true };
      }
    });
  }

  // ── Download ──────────────────────────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer();
  const blob   = new Blob(
    [buffer],
    { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
  );
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href     = url;
  a.download = `${planilha.nome.replace(/[^a-z0-9]/gi, "_")}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
