document.addEventListener("DOMContentLoaded", () => {
  const icraForm = document.getElementById("icraForm");
  const fileInput = document.getElementById("fileInput");
  const processBtn = document.getElementById("processBtn");
  const fileCount = document.getElementById("fileCount");
  const fileList = document.getElementById("fileList");
  const statusCard = document.getElementById("statusCard");
  const loadingInfo = document.getElementById("loadingInfo");
  const resultInfo = document.getElementById("resultInfo");
  const progressBar = document.getElementById("progressBar");
  const statusText = document.getElementById("statusText");
  const resultSummary = document.getElementById("resultSummary");
  const downloadBtn = document.getElementById("downloadBtn");
  const emptyState = document.getElementById("emptyState");
  const logCard = document.getElementById("logCard");
  const logOutput = document.getElementById("logOutput");
  const clearLogs = document.getElementById("clearLogs");

  function addLog(msg, type = "info") {
    const time = new Date().toLocaleTimeString("tr-TR");
    const color = type === "error" ? "#ff4d4d" : type === "success" ? "#00ff00" : "#00ff00";
    const line = document.createElement("div");
    line.style.color = color;
    line.textContent = `[${time}] ${msg}`;
    logOutput.appendChild(line);
    logOutput.scrollTop = logOutput.scrollHeight;
    logCard.classList.remove("d-none");
  }

  fileInput.addEventListener("change", () => {
    const count = fileInput.files.length;
    fileCount.textContent = count;
    fileList.classList.toggle("d-none", count === 0);
    processBtn.disabled = count === 0;
  });

  clearLogs.addEventListener("click", () => {
    logOutput.innerHTML = "";
    logCard.classList.add("d-none");
  });

  icraForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const files = fileInput.files;
    if (files.length === 0) return;

    emptyState.classList.add("d-none");
    statusCard.classList.remove("d-none");
    loadingInfo.classList.remove("d-none");
    resultInfo.classList.add("d-none");
    processBtn.disabled = true;
    progressBar.style.width = "0%";
    statusText.textContent = "Dosyalar yükleniyor ve işleniyor...";

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      addLog(`${files.length} dosya sunucuya gönderiliyor...`);
      const response = await fetch("/api/process-icra", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "İşlem sırasında bir hata oluştu");
      }

      // Stream handling for progress would be nice, but for now let's just wait for JSON
      const result = await response.json();
      
      if (result.success) {
        addLog("İşlem başarıyla tamamlandı.", "success");
        loadingInfo.classList.add("d-none");
        resultInfo.classList.remove("d-none");
        resultSummary.textContent = `${result.totalProcessed} dosya işlendi. Toplam ${result.totalRows} satır veri çıkarıldı.`;
        
        // Excel linki
        downloadBtn.href = `/api/download-result/${result.outputFile}`;
        
        // CSV linki
        const downloadCsvBtn = document.getElementById("downloadCsvBtn");
        if (result.csvFile && downloadCsvBtn) {
          downloadCsvBtn.href = `/api/download-result/${result.csvFile}`;
        }

        // XML listesi
        const xmlList = document.getElementById("xmlList");
        if (xmlList) {
          xmlList.innerHTML = "";
          if (result.xmlFiles && result.xmlFiles.length > 0) {
            result.xmlFiles.forEach(xmlFile => {
              const li = document.createElement("li");
              li.className = "mb-1";
              li.innerHTML = `<a href="/api/download-result/${xmlFile}" class="text-decoration-none text-success">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-file-code me-1" viewBox="0 0 16 16"><path d="M6.646 5.646a.5.5 0 1 1 .708.708L5.707 8l1.647 1.646a.5.5 0 0 1-.708.708l-2-2a.5.5 0 0 1 0-.708l2-2zM9.354 5.646a.5.5 0 0 0-.708.708L10.293 8l-1.647 1.646a.5.5 0 0 0 .708.708l2-2a.5.5 0 0 0 0-.708l-2-2z"/><path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z"/></svg>
                ${xmlFile}
              </a>`;
              xmlList.appendChild(li);
            });
          }
        }

        progressBar.style.width = "100%";
      } else {
        throw new Error(result.error || "Bilinmeyen bir hata oluştu");
      }
    } catch (err) {
      addLog(`HATA: ${err.message}`, "error");
      alert(err.message);
      statusCard.classList.add("d-none");
      emptyState.classList.remove("d-none");
    } finally {
      processBtn.disabled = false;
    }
  });
});
