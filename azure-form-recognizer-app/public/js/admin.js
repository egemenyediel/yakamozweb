document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("configForm");
  const modelSelect = document.getElementById("modelId");
  const customGroup = document.getElementById("customModelGroup");
  const toggleKey = document.getElementById("toggleKey");
  const apiKeyInput = document.getElementById("apiKey");
  const eyeIcon = document.getElementById("eyeIcon");
  const statusAlert = document.getElementById("statusAlert");
  const testBtn = document.getElementById("testConnection");

  const llmForm = document.getElementById("llmForm");
  const llmEnabled = document.getElementById("llmEnabled");
  const llmSettings = document.getElementById("llmSettings");
  const llmStatusAlert = document.getElementById("llmStatusAlert");
  const testLlmBtn = document.getElementById("testLlm");

  function showStatus(msg, type = "success", target = statusAlert) {
    target.className = `alert alert-${type}`;
    target.textContent = msg;
    target.classList.remove("d-none");
    setTimeout(() => target.classList.add("d-none"), 6000);
  }

  loadConfig();

  modelSelect.addEventListener("change", () => {
    customGroup.classList.toggle("d-none", modelSelect.value !== "custom");
  });

  toggleKey.addEventListener("click", () => {
    if (apiKeyInput.type === "password") {
      apiKeyInput.type = "text";
      eyeIcon.textContent = "Gizle";
    } else {
      apiKeyInput.type = "password";
      eyeIcon.textContent = "Göster";
    }
  });

  llmEnabled.addEventListener("change", () => {
    llmSettings.style.opacity = llmEnabled.checked ? "1" : "0.5";
    llmSettings.querySelectorAll("input, select, textarea, button").forEach((el) => {
      if (el.id !== "llmEnabled") el.disabled = !llmEnabled.checked;
    });
    fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ llmEnabled: llmEnabled.checked }),
    }).then(() => {
      showStatus(llmEnabled.checked ? "LLM analizi aktif edildi" : "LLM analizi kapatıldı", llmEnabled.checked ? "success" : "warning", llmStatusAlert);
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const body = {
      endpoint: document.getElementById("endpoint").value.trim(),
      apiKey: apiKeyInput.value.trim(),
      modelId: modelSelect.value === "custom" ? document.getElementById("customModelId").value.trim() : modelSelect.value,
      locale: document.getElementById("locale").value,
      pages: document.getElementById("pages").value.trim(),
      readingOrder: document.getElementById("readingOrder").value,
    };
    try {
      const res = await fetch("/api/config", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) showStatus("Azure ayarları kaydedildi!");
      else showStatus("Hata: " + (data.error || "Bilinmeyen hata"), "danger");
    } catch (err) { showStatus("Bağlantı hatası: " + err.message, "danger"); }
  });

  llmForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const body = {
      llmEnabled: llmEnabled.checked,
      llmProvider: document.getElementById("llmProvider").value,
      llmEndpoint: document.getElementById("llmEndpoint").value.trim(),
      llmModel: document.getElementById("llmModel").value.trim(),
      llmTemperature: parseFloat(document.getElementById("llmTemperature").value) || 0.3,
      llmPrompt: document.getElementById("llmPrompt").value,
    };
    try {
      const res = await fetch("/api/config", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) showStatus("LLM ayarları kaydedildi!", "success", llmStatusAlert);
      else showStatus("Hata: " + (data.error || "Bilinmeyen hata"), "danger", llmStatusAlert);
    } catch (err) { showStatus("Bağlantı hatası: " + err.message, "danger", llmStatusAlert); }
  });

  testBtn.addEventListener("click", async () => {
    testBtn.disabled = true;
    testBtn.textContent = "Test ediliyor...";
    try {
      const res = await fetch("/api/config");
      const cfg = await res.json();
      if (cfg.endpoint) showStatus("Azure yapılandırması mevcut: " + cfg.endpoint);
      else showStatus("Henüz yapılandırma yok.", "warning");
    } catch (err) { showStatus("Hata: " + err.message, "danger"); }
    finally { testBtn.disabled = false; testBtn.textContent = "Bağlantıyı Test Et"; }
  });

  testLlmBtn.addEventListener("click", async () => {
    testLlmBtn.disabled = true;
    testLlmBtn.textContent = "Test ediliyor...";
    try {
      const res = await fetch("/api/llm-test", { method: "POST" });
      const data = await res.json();
      if (data.success) showStatus("LLM bağlantısı başarılı! Yanıt: " + (data.response || "").substring(0, 200), "success", llmStatusAlert);
      else showStatus("LLM hatası: " + (data.error || ""), "danger", llmStatusAlert);
    } catch (err) { showStatus("Bağlantı hatası: " + err.message, "danger", llmStatusAlert); }
    finally { testLlmBtn.disabled = false; testLlmBtn.textContent = "LLM Bağlantısını Test Et"; }
  });

  async function loadConfig() {
    try {
      const res = await fetch("/api/config");
      const cfg = await res.json();
      if (cfg.endpoint) document.getElementById("endpoint").value = cfg.endpoint;
      if (cfg.apiKey) apiKeyInput.value = cfg.apiKey;
      if (cfg.modelId) {
        const option = Array.from(modelSelect.options).find((o) => o.value === cfg.modelId);
        if (option) modelSelect.value = cfg.modelId;
        else { modelSelect.value = "custom"; customGroup.classList.remove("d-none"); document.getElementById("customModelId").value = cfg.modelId; }
      }
      if (cfg.locale) document.getElementById("locale").value = cfg.locale;
      if (cfg.pages) document.getElementById("pages").value = cfg.pages;
      if (cfg.readingOrder) document.getElementById("readingOrder").value = cfg.readingOrder;

      llmEnabled.checked = !!cfg.llmEnabled;
      if (cfg.llmProvider) document.getElementById("llmProvider").value = cfg.llmProvider;
      if (cfg.llmEndpoint) document.getElementById("llmEndpoint").value = cfg.llmEndpoint;
      if (cfg.llmModel) document.getElementById("llmModel").value = cfg.llmModel;
      if (cfg.llmTemperature !== undefined) document.getElementById("llmTemperature").value = cfg.llmTemperature;
      if (cfg.llmPrompt) document.getElementById("llmPrompt").value = cfg.llmPrompt;
      llmEnabled.dispatchEvent(new Event("change"));
    } catch {}
  }
});
