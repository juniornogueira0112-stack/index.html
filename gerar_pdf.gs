function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({status: "erro", message: "Nenhum dado recebido"}))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader("Access-Control-Allow-Origin", "*")
        .setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
        .setHeader("Access-Control-Allow-Headers", "Content-Type");
    }

    var dados = JSON.parse(e.postData.contents);

    // ✅ FORMATA DATA PARA PADRÃO BRASIL
    var dataFormatada = dados.data;
    if (dataFormatada) {
      var partes = dataFormatada.split("-");
      dataFormatada = partes[2] + "/" + partes[1] + "/" + partes[0];
    }

    // 🧾 Monta HTML do PDF com layout parecido com o app
    var html = `
      <h2>INFORMAÇÕES DO CLIENTE</h2>
      <table width="100%" style="border-collapse: collapse;">
        <tr>
          <td><b>Cliente:</b> ${dados.cliente}</td>
          <td><b>CPF/CNPJ:</b> ${dados.doc}</td>
        </tr>
        <tr>
          <td><b>Cidade:</b> ${dados.cidade}</td>
          <td><b>Data do Pedido:</b> ${dataFormatada}</td>
        </tr>
        <tr>
          <td><b>Vendedor:</b> ${dados.vendedor}</td>
          <td><b>Forma de Pagamento:</b> ${dados.pagamento}</td>
        </tr>
        <tr>
          <td colspan="2"><b>Observações gerais:</b> ${dados.observacoes || "-"}</td>
        </tr>
      </table>

      <hr>

      <h2>PEDIDO</h2>
      <table border="1" width="100%" style="border-collapse: collapse; text-align: center;">
        <tr>
          <th>Código</th>
          <th>Produto</th>
          <th>Qtd</th>
          <th>Valor Unit</th>
          <th>Total</th>
        </tr>
    `;

    var total = 0;

    dados.itens.forEach(function(item) {
      var totalItem = item.qtd * item.preco;
      total += totalItem;

      var obsItem = item.obsExtra && item.obsExtra.trim() !== "" 
        ? `<br><small>Observações: ${item.obsExtra}</small>` 
        : "";

      html += `
        <tr>
          <td>${item.codigo}</td>
          <td>${item.nome}${obsItem}</td>
          <td>${item.qtd}</td>
          <td>R$ ${item.preco.toFixed(2)}</td>
          <td>R$ ${totalItem.toFixed(2)}</td>
        </tr>
      `;
    });

    html += `
      </table>
      <h2 style="text-align: right;">TOTAL DO PEDIDO: R$ ${total.toFixed(2)}</h2>
    `;

    // 📄 Converte HTML em PDF
    var blob = Utilities.newBlob(html, "text/html").getAs("application/pdf");

    var pasta = DriveApp.getFolderById("1kfdYGluqmcFjCozsO097vo7hoguVdm-2");
    var nomeArquivo = "Pedido_" + dados.cliente + "_" + new Date().getTime() + ".pdf";
    pasta.createFile(blob).setName(nomeArquivo);

    return ContentService.createTextOutput(JSON.stringify({status: "ok", message: "PDF criado"}))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*")
      .setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
      .setHeader("Access-Control-Allow-Headers", "Content-Type");

  } catch (erro) {
    return ContentService.createTextOutput(JSON.stringify({status: "erro", message: erro.message}))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*")
      .setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
      .setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
}

// ✅ ESSENCIAL PRA FUNCIONAR NO NAVEGADOR (CORS)
function doOptions(e) {
  return ContentService
    .createTextOutput("")
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}
