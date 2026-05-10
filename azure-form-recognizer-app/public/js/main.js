document.addEventListener("DOMContentLoaded", () => {
  const uploadForm = document.getElementById("uploadForm");
  const fileInput = document.getElementById("fileInput");
  const dropZone = document.getElementById("dropZone");
  const fileList = document.getElementById("fileList");
  const fileItems = document.getElementById("fileItems");
  const fileCount = document.getElementById("fileCount");
  const removeFiles = document.getElementById("removeFiles");
  const analyzeBtn = document.getElementById("analyzeBtn");
  const bulkAnalyzeBtn = document.getElementById("bulkAnalyzeBtn");
  const loadingCard = document.getElementById("loadingCard");
  const errorCard = document.getElementById("errorCard");
  const resultArea = document.getElementById("resultArea");
  const emptyState = document.getElementById("emptyState");
  const singleResult = document.getElementById("singleResult");
  const bulkResult = document.getElementById("bulkResult");
  const printBtn = document.getElementById("printBtn");
  const exportCsvBtn = document.getElementById("exportCsvBtn");
  const exportXmlBtn = document.getElementById("exportXmlBtn");

  let selectedFiles = [];
  let lastSingleData = null;
  let lastBulkResults = null;

  dropZone.addEventListener("click", () => fileInput.click());
  dropZone.addEventListener("dragover", (e) => { e.preventDefault(); dropZone.classList.add("drag-over"); });
  dropZone.addEventListener("dragleave", () => dropZone.classList.remove("drag-over"));
  dropZone.addEventListener("drop", (e) => { e.preventDefault(); dropZone.classList.remove("drag-over"); if (e.dataTransfer.files.length) addFiles(Array.from(e.dataTransfer.files)); });
  fileInput.addEventListener("change", () => { if (fileInput.files.length) addFiles(Array.from(fileInput.files)); });

  removeFiles.addEventListener("click", () => { selectedFiles = []; fileInput.value = ""; fileList.classList.add("d-none"); analyzeBtn.disabled = true; bulkAnalyzeBtn.disabled = true; });

  function addFiles(files) {
    const allowed = [".pdf", ".png", ".jpg", ".jpeg", ".tiff", ".tif", ".bmp", ".heif"];
    selectedFiles = files.filter((f) => allowed.some((ext) => f.name.toLowerCase().endsWith(ext)));
    renderFileList();
  }

  function renderFileList() {
    if (!selectedFiles.length) { fileList.classList.add("d-none"); analyzeBtn.disabled = true; bulkAnalyzeBtn.disabled = true; return; }
    fileList.classList.remove("d-none");
    fileCount.textContent = selectedFiles.length;
    analyzeBtn.disabled = false;
    bulkAnalyzeBtn.disabled = selectedFiles.length < 2;
    fileItems.innerHTML = selectedFiles.map((f) => `
      <div class="d-flex align-items-center p-2 bg-light rounded mb-1">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-earmark me-2" viewBox="0 0 16 16"><path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5z"/></svg>
        <span class="small flex-grow-1 text-truncate">${escapeHtml(f.name)}</span>
        <small class="text-muted ms-2">${formatSize(f.size)}</small>
      </div>`).join("");
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  }

  uploadForm.addEventListener("submit", async (e) => { e.preventDefault(); if (selectedFiles.length) await analyzeSingle(selectedFiles[0]); });
  bulkAnalyzeBtn.addEventListener("click", async () => { if (selectedFiles.length >= 2) await analyzeBulk(); });

  async function analyzeSingle(file) {
    const formData = new FormData();
    formData.append("file", file);
    showLoading(`Analiz ediliyor: ${file.name}`);
    try {
      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      let data;
      try { data = await res.json(); } catch { throw new Error(`Sunucu hatası (${res.status})`); }
      if (!res.ok || data.error) throw new Error(data.error || "Analiz başarısız");
      lastSingleData = data;
      lastBulkResults = null;
      document.getElementById("resultTitle").textContent = file.name;
      renderSingleResult(data);
    } catch (err) { loadingCard.classList.add("d-none"); errorCard.textContent = err.message; errorCard.classList.remove("d-none"); emptyState.classList.remove("d-none"); resultArea.classList.add("d-none"); }
    finally { loadingCard.classList.add("d-none"); }
  }

  async function analyzeBulk() {
    const formData = new FormData();
    selectedFiles.forEach((f) => formData.append("files", f));
    showLoading(`${selectedFiles.length} dosya analiz ediliyor...`, "Sırayla işleniyor");
    try {
      const res = await fetch("/api/analyze-bulk", { method: "POST", body: formData });
      let data;
      try { data = await res.json(); } catch { throw new Error(`Sunucu hatası (${res.status})`); }
      if (!res.ok || data.error) throw new Error(data.error || "Toplu analiz başarısız");
      lastBulkResults = data.results;
      lastSingleData = null;
      document.getElementById("resultTitle").textContent = `${data.results.length} Dosya - Toplu Sonuç`;
      renderBulkResult(data.results);
    } catch (err) { loadingCard.classList.add("d-none"); errorCard.textContent = err.message; errorCard.classList.remove("d-none"); emptyState.classList.remove("d-none"); resultArea.classList.add("d-none"); }
    finally { loadingCard.classList.add("d-none"); }
  }

  function showLoading(title, sub) {
    loadingCard.classList.remove("d-none"); errorCard.classList.add("d-none"); resultArea.classList.add("d-none"); emptyState.classList.add("d-none");
    document.getElementById("loadingText").textContent = title;
    document.getElementById("loadingSubText").textContent = sub || "Bu işlem birkaç saniye sürebilir";
  }

  function renderSingleResult(data) {
    const { data: result, raw, llmResult } = data;
    resultArea.classList.remove("d-none"); emptyState.classList.add("d-none"); singleResult.classList.remove("d-none"); bulkResult.classList.add("d-none");
    renderDocFields(result.documentFields || []);
    renderLlmResult(llmResult, data.fileName);
    renderTables(result.tables || []);
    renderKeyValue(result.keyValuePairs || []);
    renderDocuments(result.documents || []);
    document.getElementById("rawJson").textContent = raw || "{}";
    document.getElementById("copyJson").onclick = () => { navigator.clipboard.writeText(document.getElementById("rawJson").textContent).then(() => { document.getElementById("copyJson").textContent = "Kopyalandı!"; setTimeout(() => (document.getElementById("copyJson").textContent = "JSON Kopyala"), 2000); }); };
  }

  function renderBulkResult(results) {
    resultArea.classList.remove("d-none"); emptyState.classList.add("d-none"); singleResult.classList.add("d-none"); bulkResult.classList.remove("d-none");
    bulkResult.innerHTML = `
      <div class="alert alert-info"><strong>${results.length}</strong> dosya analiz edildi. <span class="badge bg-success ms-2">${results.filter((r) => r.success).length} başarılı</span><span class="badge bg-danger ms-1">${results.filter((r) => !r.success).length} başarısız</span></div>
      ${results.filter((r) => r.success).map((r) => `
        <div class="card mb-3 bulk-card">
          <div class="card-header bg-light d-flex justify-content-between align-items-center"><strong>${escapeHtml(r.fileName)}</strong><span class="badge bg-secondary">${r.data.documentFields?.length || 0} alan</span></div>
          <div class="card-body p-0">${renderFieldsTable(r.data.documentFields || [], true)}</div>
          ${r.llmResult ? `<div class="card-footer bg-light"><strong>LLM Sonuç:</strong><div class="mt-1 small">${escapeHtml(r.llmResult)}</div></div>` : ""}
        </div>`).join("")}`;
  }

  function renderDocFields(fields) {
    const container = document.getElementById("docFieldsContent");
    if (!fields.length) { container.innerHTML = '<div class="text-muted text-center py-4">Belge alanı bulunamadı</div>'; return; }
    container.innerHTML = `<div class="card"><div class="card-header bg-success text-white"><strong>Tanımlanan Belge Alanları</strong><span class="badge bg-light text-dark ms-2">${fields.length} alan</span></div><div class="card-body p-0">${renderFieldsTable(fields, true)}</div></div>`;
  }

  function renderLlmResult(llmResult, fileName) {
    const container = document.getElementById("llmContent");
    if (!llmResult) {
      container.innerHTML = '<div class="alert alert-warning"><strong>LLM analizi aktif değil</strong> veya henüz bir sonuç yok. Admin sayfasından LLM ayarlarını yapılandırın.</div>';
      return;
    }
    container.innerHTML = `
      <div class="card">
        <div class="card-header bg-info text-white"><strong>LLM Analiz Sonucu</strong> <small class="ms-2 opacity-75">${escapeHtml(fileName || "")}</small></div>
        <div class="card-body">
          <div class="llm-result">${escapeHtml(llmResult).replace(/\n/g, "<br>")}</div>
        </div>
      </div>`;
  }

  function renderFieldsTable(fields, full) {
    return `<div class="table-responsive"><table class="table table-striped table-hover mb-0">
      <thead class="table-dark"><tr>${full ? '<th style="width:4%">#</th>' : ""}<th style="width:18%">Alan</th><th style="width:30%">Değer</th><th style="width:8%">Tip</th><th style="width:8%">Güven</th><th style="width:6%">Sayfa</th><th style="width:26%">Koordinat</th></tr></thead>
      <tbody>${fields.map((f, i) => `<tr>${full ? `<td class="text-muted">${i + 1}</td>` : ""}<td><strong>${escapeHtml(f.name)}</strong></td><td>${escapeHtml(f.value)}</td><td><span class="badge bg-info">${escapeHtml(f.type)}</span></td><td><span class="badge ${confidenceClass(f.confidence)}">${f.confidence}</span></td><td class="text-center">${f.page ? `<span class="badge bg-secondary">S${f.page}</span>` : "-"}</td><td><code class="coord">${f.bbox || "-"}</code></td></tr>`).join("")}</tbody></table></div>`;
  }

  function renderTables(tables) {
    const container = document.getElementById("tablesContent");
    if (!tables.length) { container.innerHTML = '<div class="text-muted text-center py-4">Tablo bulunamadı</div>'; return; }
    container.innerHTML = tables.map((table) => `<div class="card mb-3"><div class="card-header d-flex justify-content-between align-items-center"><strong>Tablo ${table.index + 1}</strong><small class="text-muted">${table.rowCount} satır × ${table.colCount} sütun</small></div><div class="card-body p-0"><div class="table-responsive"><table class="table table-striped table-hover table-sm mb-0"><thead class="table-dark"><tr>${table.headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${table.rows.map((row) => `<tr>${Object.values(row).map((v) => `<td>${escapeHtml(v)}</td>`).join("")}</tr>`).join("")}</tbody></table></div></div></div>`).join("");
  }

  function renderKeyValue(pairs) {
    const container = document.getElementById("keyValueContent");
    if (!pairs.length) { container.innerHTML = '<div class="text-muted text-center py-4">Anahtar-değer çifti bulunamadı</div>'; return; }
    container.innerHTML = `<div class="table-responsive"><table class="table table-striped table-hover"><thead class="table-dark"><tr><th>Anahtar</th><th>Değer</th><th>Güven</th></tr></thead><tbody>${pairs.map((p) => `<tr><td>${escapeHtml(p.key)}</td><td>${escapeHtml(p.value)}</td><td><span class="badge ${confidenceClass(p.confidence)}">${p.confidence}</span></td></tr>`).join("")}</tbody></table></div>`;
  }

  function renderDocuments(docs) {
    const container = document.getElementById("documentsContent");
    if (!docs.length) { container.innerHTML = '<div class="text-muted text-center py-4">Belge bulunamadı</div>'; return; }
    container.innerHTML = docs.map((doc) => `<div class="card mb-3"><div class="card-header d-flex justify-content-between"><div><strong>Belge ${doc.index + 1}</strong> — ${escapeHtml(doc.docType)}</div><span class="badge ${confidenceClass(doc.confidence)}">${doc.confidence}</span></div><div class="card-body p-0">${doc.fields.length ? `<div class="table-responsive"><table class="table table-striped table-hover table-sm mb-0"><thead class="table-dark"><tr><th>Alan</th><th>Değer</th><th>Tip</th><th>Güven</th><th>Sayfa</th><th>Koordinat</th></tr></thead><tbody>${doc.fields.map((f) => `<tr><td><code>${escapeHtml(f.name)}</code></td><td>${escapeHtml(f.value)}</td><td><span class="badge bg-info">${f.type}</span></td><td><span class="badge ${confidenceClass(f.confidence)}">${f.confidence}</span></td><td>${f.page || "-"}</td><td><code class="coord">${f.bbox || "-"}</code></td></tr>`).join("")}</tbody></table></div>` : '<div class="text-muted text-center py-3">Alan bulunamadı</div>'}</div></div>`).join("");
  }

  printBtn.addEventListener("click", () => window.print());

  function downloadCsv(items) {
    const cols = ["Dosya", "Alan", "Değer", "Tip", "Güven", "LLM Sonuç"];
    const rows = [];
    items.forEach((item) => {
      const llm = (item.llmResult || "").replace(/[\n\r]+/g, " ");
      item.fields.forEach((f) => {
        rows.push([item.fileName, f.name, f.value, f.type, f.confidence, item.fields.indexOf(f) === 0 ? llm : ""]);
      });
      if (!item.fields.length) rows.push([item.fileName, "", "", "", "", llm]);
    });
    const csvContent = [cols.join(";"), ...rows.map((r) => r.map((c) => `"${String(c || "").replace(/"/g, '""')}"`).join(";"))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `form-recognizer-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  }

  function buildXml(fileName, fields, raw, llmResult, tables, keyValuePairs, ocrContent) {
    const esc = (s) => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const fieldsXml = fields.map((f) => `    <Alan>
      <Ad>${esc(f.name)}</Ad>
      <Deger>${esc(f.value)}</Deger>
      <Tip>${esc(f.type)}</Tip>
      <Guven>${esc(f.confidence)}</Guven>
      <Sayfa>${esc(f.page)}</Sayfa>
      <Koordinat>${esc(f.bbox)}</Koordinat>
    </Alan>`).join("\n");

    const tablesXml = (tables || []).map((t) => {
      const rowsXml = t.rows.map((row) => {
        const cellsXml = Object.values(row).map((v) => `          <Hucre>${esc(v)}</Hucre>`).join("\n");
        return `        <Satir>\n${cellsXml}\n        </Satir>`;
      }).join("\n");
      const headersXml = t.headers.map((h) => `        <Baslik>${esc(h)}</Baslik>`).join("\n");
      return `    <Tablo index="${t.index}" satir="${t.rowCount}" sutun="${t.colCount}">
      <Basliklar>
${headersXml}
      </Basliklar>
      <Satirlar>
${rowsXml}
      </Satirlar>
    </Tablo>`;
    }).join("\n");

    const kvpXml = (keyValuePairs || []).map((p) => `    <AnahtarDeger>
      <Anahtar>${esc(p.key)}</Anahtar>
      <Deger>${esc(p.value)}</Deger>
      <Guven>${esc(p.confidence)}</Guven>
    </AnahtarDeger>`).join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<BelgeAnalizi>
  <DosyaAdi>${esc(fileName)}</DosyaAdi>
  <AnalizTarihi>${new Date().toISOString()}</AnalizTarihi>
  <Alanlar>
${fieldsXml}
  </Alanlar>
${tablesXml ? `  <Tablolar>\n${tablesXml}\n  </Tablolar>` : "  <Tablolar/>"}
${kvpXml ? `  <AnahtarDegerler>\n${kvpXml}\n  </AnahtarDegerler>` : "  <AnahtarDegerler/>"}
  ${llmResult ? `<LLMAnalizi><![CDATA[${llmResult}]]></LLMAnalizi>` : ""}
  <OCRContent><![CDATA[${ocrContent || ""}]]></OCRContent>
  <HamOCR><![CDATA[${raw || ""}]]></HamOCR>
</BelgeAnalizi>`;
  }

  async function downloadXmlSingle() {
    if (!lastSingleData) return;
    const d = lastSingleData;
    const xml = buildXml(d.fileName || "dosya", d.data.documentFields || [], d.raw, d.llmResult, d.data.tables || [], d.data.keyValuePairs || [], d.ocrContent);
    const blob = new Blob([xml], { type: "application/xml;charset=utf-8;" });
    const baseName = (d.fileName || "dosya").replace(/\.[^.]+$/, "");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${baseName}.xml`;
    a.click();
  }

  async function downloadXmlBulk() {
    if (!lastBulkResults) return;
    const zip = new JSZip();
    lastBulkResults.filter((r) => r.success).forEach((r) => {
      const xml = buildXml(r.fileName, r.data.documentFields || [], r.raw, r.llmResult, r.data.tables || [], r.data.keyValuePairs || [], r.ocrContent);
      const baseName = r.fileName.replace(/\.[^.]+$/, "");
      zip.file(`${baseName}.xml`, xml);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `form-recognizer-${new Date().toISOString().slice(0, 10)}.zip`;
    a.click();
  }

  exportCsvBtn.addEventListener("click", () => {
    if (lastBulkResults) {
      downloadCsv(lastBulkResults.filter((r) => r.success).map((r) => ({ fileName: r.fileName, fields: r.data.documentFields || [], llmResult: r.llmResult })));
    } else if (lastSingleData) {
      downloadCsv([{ fileName: lastSingleData.fileName || "dosya", fields: lastSingleData.data.documentFields || [], llmResult: lastSingleData.llmResult }]);
    }
  });

  exportXmlBtn.addEventListener("click", () => {
    if (lastBulkResults) downloadXmlBulk();
    else if (lastSingleData) downloadXmlSingle();
  });

  function confidenceClass(conf) {
    if (!conf || conf === "-") return "bg-secondary";
    const val = parseFloat(conf);
    if (val >= 90) return "bg-success";
    if (val >= 70) return "bg-warning text-dark";
    return "bg-danger";
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }
});
