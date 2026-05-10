const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");
const XLSX = require("xlsx");
const { parse: parseCsv } = require("csv-parse/sync");
const { parseStringPromise } = require("xml2js");
const { DocumentAnalysisClient, AzureKeyCredential } = require("@azure/ai-form-recognizer");

const app = express();
const PORT = process.env.PORT || 3000;

const CONFIG_PATH = path.join(__dirname, "config.json");
const UPLOAD_DIR = path.join(__dirname, "public", "uploads");

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    const time = new Date().toLocaleString("tr-TR");
    console.log(`[${time}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${ms}ms`);
  });
  next();
});

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".pdf", ".png", ".jpg", ".jpeg", ".tiff", ".tif", ".bmp", ".heif", ".xml", ".csv", ".xlsx", ".xls"];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
  } catch {
    return { endpoint: "", apiKey: "", modelId: "prebuilt-document", locale: "tr-TR" };
  }
}

function saveConfig(cfg) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2), "utf-8");
}

function getClient() {
  const cfg = loadConfig();
  if (!cfg.endpoint || !cfg.apiKey) return null;
  return {
    client: new DocumentAnalysisClient(cfg.endpoint, new AzureKeyCredential(cfg.apiKey)),
    config: cfg,
  };
}

function llmRequest(url, body) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const data = JSON.stringify(body);
    const mod = parsed.protocol === "https:" ? https : http;
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) },
      timeout: 120000,
    };
    const req = mod.request(options, (res) => {
      let chunks = "";
      res.on("data", (c) => (chunks += c));
      res.on("end", () => {
        try { resolve(JSON.parse(chunks)); }
        catch { resolve({ raw: chunks }); }
      });
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("LLM timeout")); });
    req.write(data);
    req.end();
  });
}

async function callLlm(content) {
  const cfg = loadConfig();
  if (!cfg.llmEnabled || !cfg.llmEndpoint || !cfg.llmModel) {
    console.log(`[LLM] Atlanıyor - enabled: ${cfg.llmEnabled}, endpoint: ${cfg.llmEndpoint}, model: ${cfg.llmModel}`);
    return null;
  }

  const prompt = (cfg.llmPrompt || "{CONTENT}").replace("{CONTENT}", content);
  console.log(`[LLM] İstek hazırlanıyor → ${cfg.llmProvider} / ${cfg.llmModel} @ ${cfg.llmEndpoint}`);
  console.log(`[LLM] Prompt boyutu: ${prompt.length} karakter, Temperature: ${cfg.llmTemperature}`);

  try {
    const startTime = Date.now();
    let res;
    if (cfg.llmProvider === "lmstudio") {
      const url = `${cfg.llmEndpoint}/api/v1/chat`;
      console.log(`[LLM] POST → ${url}`);
      res = await llmRequest(url, {
        model: cfg.llmModel,
        messages: [{ role: "user", content: prompt }],
        temperature: cfg.llmTemperature || 0.3,
      });
    } else {
      const url = `${cfg.llmEndpoint}/api/chat`;
      console.log(`[LLM] POST → ${url}`);
      res = await llmRequest(url, {
        model: cfg.llmModel,
        messages: [{ role: "user", content: prompt }],
        stream: false,
        options: { temperature: cfg.llmTemperature || 0.3 },
      });
    }
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const output = cfg.llmProvider === "lmstudio"
      ? (res.choices?.[0]?.message?.content || res.choices?.[0]?.text || null)
      : (res.message?.content || null);
    console.log(`[LLM] Yanıt alındı (${elapsed}s) → ${output ? output.substring(0, 150) + "..." : "BOŞ"}`);
    return output;
  } catch (err) {
    console.error(`[LLM] HATA: ${err.message}`);
    return `LLM Hatası: ${err.message}`;
  }
}

function buildContentForLlm(flattened, rawContent) {
  let text = "=== BELGE İÇERİĞİ ===\n";
  if (rawContent) text += rawContent + "\n\n";
  if (flattened.documentFields?.length) {
    text += "=== TESPİT EDİLEN ALANLAR ===\n";
    flattened.documentFields.forEach((f) => {
      text += `${f.name}: ${f.value}`;
      if (f.page) text += ` (Sayfa ${f.page}, Koordinat: ${f.bbox})`;
      text += "\n";
    });
  }
  return text;
}

const SUFFIX_FIELDS = new Set(["ALICI", "BANKAADI", "BORCLUTAMAD"]);
const TURKISH_SUFFIXES = [
  "'nin", "'nın", "'nin", "'nun",
  "'in", "'ın", "'un", "'ün",
  "'ni", "'nı", "'nu", "'nü",
  "'si", "'sı", "'su", "'sü",
  "'i", "'ı", "'u", "'ü",
  "'ne", "'na", "'te", "'ta",
  "'de", "'da", "'den", "'dan",
  "'ten", "'tan", "'yle", "'yla",
  "'nden", "'ndan", "'nci", "'ncı", "'ncu", "'ncü",
  "'im", "'ım", "'um", "'üm",
  "'imiz", "'ımız", "'umuz", "'ümüz",
  "'nin", "'nın",
];

function cleanSuffixes(value) {
  let cleaned = value;
  for (const suffix of TURKISH_SUFFIXES) {
    if (cleaned.toLowerCase().endsWith(suffix.toLowerCase())) {
      cleaned = cleaned.slice(0, -suffix.length);
      break;
    }
  }
  return cleaned.trim();
}

function splitTutar(value) {
  const parts = value
    .split(/[\n\r]+/)
    .map((p) => p.replace(/\s*TL\s*/gi, "").trim())
    .filter((p) => p !== "" && p !== "-");

  if (parts.length <= 1) {
    const num = parts[0] || "";
    return num ? [{ label: "Tutar", value: num }] : [{ label: "Tutar", value: value.trim() }];
  }

  return parts.map((p, i) => ({ label: `Tutar ${i + 1}`, value: p }));
}

function extractCoords(boundingRegions) {
  try {
    if (!boundingRegions || !boundingRegions.length) {
      return { page: "", bbox: "" };
    }
    const br = boundingRegions[0];
    const page = br.pageNumber || "";
    const p = (br.polygon || []).map(Number);
    if (p.length >= 8 && !p.some(isNaN)) {
      const x1 = p[0].toFixed(2);
      const y1 = p[1].toFixed(2);
      const x2 = p[2].toFixed(2);
      const y2 = p[5].toFixed(2);
      return { page: String(page), bbox: `${x1},${y1} → ${x2},${y2}` };
    }
    if (p.length >= 4 && !p.some(isNaN)) {
      return { page: String(page), bbox: `${p[0].toFixed(2)},${p[1].toFixed(2)} → ${p[2].toFixed(2)},${p[3].toFixed(2)}` };
    }
    return { page: String(page), bbox: "" };
  } catch {
    return { page: "", bbox: "" };
  }
}

function flattenResult(result) {
  try {
  const tables = [];
  if (result.tables) {
    result.tables.forEach((table, idx) => {
      const rows = [];
      const rowCount = table.rowCount || 0;
      const colCount = table.columnCount || 0;

      for (let r = 0; r < rowCount; r++) {
        const row = {};
        for (let c = 0; c < colCount; c++) {
          const cell = table.cells.find(
            (cl) => cl.rowIndex === r && cl.columnIndex === c
          );
          row[`col_${c}`] = cell ? cell.content : "";
        }
        rows.push(row);
      }

      const firstColCells = table.cells.filter((cl) => cl.columnIndex === 0);
      const headers = firstColCells.length === rowCount
        ? firstColCells.map((cl) => cl.content.replace(/\s*:\s*$/, ""))
        : Array.from({ length: colCount }, (_, i) => `Sütun ${i + 1}`);

      tables.push({ index: idx, rowCount, colCount, headers, rows });
    });
  }

  const keyValuePairs = [];
  if (result.keyValuePairs) {
    result.keyValuePairs.forEach((kvp) => {
      keyValuePairs.push({
        key: kvp.key?.content || "",
        value: kvp.value?.content || "",
        confidence: kvp.confidence ? (kvp.confidence * 100).toFixed(1) + "%" : "-",
      });
    });
  }

  const documentFields = [];
  const documents = [];
  if (result.documents) {
    result.documents.forEach((doc, idx) => {
      const fields = [];
      if (doc.fields) {
        for (const [name, field] of Object.entries(doc.fields)) {
          let value = field.content
            || field.valueString
            || (field.valueNumber !== undefined ? String(field.valueNumber) : "")
            || (field.valueDate ? String(field.valueDate) : "")
            || (field.valueInteger !== undefined ? String(field.valueInteger) : "")
            || (field.valueSelectionMark !== undefined ? String(field.valueSelectionMark) : "")
            || "-";

          const coords = extractCoords(field.boundingRegions);

          if (name === "TCKN") {
            value = value.replace(/[^0-9]/g, "");
          }

          if (SUFFIX_FIELDS.has(name)) {
            value = cleanSuffixes(value);
          }

          if (name === "Tutar") {
            const tutarParts = splitTutar(value);
            for (const part of tutarParts) {
              fields.push({
                name: part.label,
                value: part.value,
                type: field.type || "string",
                confidence: field.confidence ? (field.confidence * 100).toFixed(1) + "%" : "-",
                page: coords.page,
                bbox: coords.bbox,
              });
            }
          } else {
            fields.push({
              name,
              value,
              type: field.type || "string",
              confidence: field.confidence ? (field.confidence * 100).toFixed(1) + "%" : "-",
              page: coords.page,
              bbox: coords.bbox,
            });
          }
        }
      }
      documentFields.push(...fields);
      documents.push({
        index: idx,
        docType: doc.docType || "Bilinmiyor",
        confidence: doc.confidence ? (doc.confidence * 100).toFixed(1) + "%" : "-",
        fields,
      });
    });
  }

  const pages = [];
  if (result.pages) {
    result.pages.forEach((page, idx) => {
      pages.push({
        pageNumber: page.pageNumber || idx + 1,
        width: page.width,
        height: page.height,
        unit: page.unit,
        lines: page.lines ? page.lines.map((l) => l.content) : [],
        words: page.words ? page.words.length : 0,
      });
    });
  }

  return { tables, keyValuePairs, documents, documentFields, pages };
  } catch (err) {
    console.error("[FLATTEN] HATA:", err.message);
    return { tables: [], keyValuePairs: [], documents: [], documentFields: [], pages: [] };
  }
}

app.get("/", (_req, res) => {
  const cfg = loadConfig();
  const configured = !!(cfg.endpoint && cfg.apiKey);
  res.render("index", { configured, config: cfg });
});

app.get("/admin", (_req, res) => {
  const cfg = loadConfig();
  res.render("admin", { config: cfg });
});

app.post("/api/config", (req, res) => {
  const cfg = loadConfig();
  const keys = [
    "endpoint", "apiKey", "modelId", "locale", "pages", "readingOrder",
    "llmEnabled", "llmProvider", "llmEndpoint", "llmModel", "llmTemperature", "llmPrompt",
  ];
  const changed = [];
  for (const k of keys) {
    if (req.body[k] !== undefined) { cfg[k] = req.body[k]; changed.push(k); }
  }
  saveConfig(cfg);
  console.log(`[${new Date().toLocaleString("tr-TR")}] [CONFIG] Güncellendi: ${changed.join(", ")}`);
  res.json({ success: true, config: cfg });
});

app.get("/api/config", (_req, res) => {
  const cfg = loadConfig();
  const masked = { ...cfg, apiKey: cfg.apiKey ? "****" + cfg.apiKey.slice(-4) : "" };
  res.json(masked);
});

app.post("/api/llm-test", async (req, res) => {
  console.log(`[${new Date().toLocaleString("tr-TR")}] [LLM-TEST] Bağlantı testi başlatılıyor...`);
  try {
    const result = await callLlm("Test mesajı. Lütfen 'Bağlantı başarılı' yaz.");
    console.log(`[${new Date().toLocaleString("tr-TR")}] [LLM-TEST] Başarılı`);
    res.json({ success: true, response: result });
  } catch (err) {
    console.error(`[${new Date().toLocaleString("tr-TR")}] [LLM-TEST] HATA: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/analyze", upload.single("file"), async (req, res) => {
  const log = (msg) => console.log(`[${new Date().toLocaleString("tr-TR")}] [TEK] ${msg}`);
  try {
    log(`────────── YENİ ANALİZ BAŞLADI ──────────`);
    log(`Dosya alındı: ${req.file?.originalname || "YOK"} (${req.file?.size ? (req.file.size / 1024).toFixed(1) + " KB" : "-"})`);

    log(`[1/5] Azure bağlantısı kontrol ediliyor...`);
    const info = getClient();
    if (!info) { log("HATA: Azure yapılandırması eksik"); return res.status(400).json({ error: "Azure yapılandırması eksik." }); }
    if (!req.file) { log("HATA: Dosya yok"); return res.status(400).json({ error: "Dosya yüklenmedi." }); }
    log(`[1/5] Azure OK - Endpoint: ${info.config.endpoint}, Model: ${info.config.modelId}`);

    const { client, config } = info;
    const filePath = req.file.path;

    log(`[2/5] Azure OCR başlatılıyor → ${req.file.originalname}`);
    const ocrStart = Date.now();
    const poller = await client.beginAnalyzeDocument(config.modelId, () =>
      fs.createReadStream(filePath),
      {
        ...(config.locale ? { locale: config.locale } : {}),
        ...(config.pages ? { pages: config.pages } : {}),
        ...(config.readingOrder ? { readingOrder: config.readingOrder } : {}),
      }
    );
    log(`[2/5] OCR isteği gönderildi, sonuç bekleniyor...`);
    const result = await poller.pollUntilDone();
    log(`[2/5] OCR tamamlandı (${((Date.now() - ocrStart) / 1000).toFixed(1)}s)`);
    fs.unlink(filePath, () => {});

    log(`[3/5] Sonuçlar ayrıştırılıyor (flatten)...`);
    const flattened = flattenResult(result);
    const raw = JSON.stringify(result, null, 2);
    log(`[3/5] Ayrıştırma tamamlandı: ${flattened.documentFields.length} alan, ${flattened.tables.length} tablo, ${flattened.pages.length} sayfa`);
    flattened.documentFields.forEach((f) => log(`  → ${f.name}: "${f.value}" (${f.confidence})`));

    let llmResult = null;
    const cfg = loadConfig();
    log(`[4/5] LLM kontrolü → aktif: ${cfg.llmEnabled}`);
    if (cfg.llmEnabled) {
      log(`[4/5] LLM çağrılıyor → ${cfg.llmProvider} / ${cfg.llmModel} @ ${cfg.llmEndpoint}`);
      const llmStart = Date.now();
      const content = buildContentForLlm(flattened, result.content || "");
      log(`[4/5] Prompt hazırlanıyor (${content.length} karakter)`);
      llmResult = await callLlm(content);
      log(`[4/5] LLM tamamlandı (${((Date.now() - llmStart) / 1000).toFixed(1)}s) → ${llmResult ? llmResult.substring(0, 120) + "..." : "YOK"}`);
    } else {
      log(`[4/5] LLM atlanıyor (devre dışı)`);
    }

    log(`[5/5] Yanıt gönderiliyor → ${req.file.originalname}`);
    log(`────────── ANALİZ TAMAMLANDI ──────────`);
    res.json({ success: true, data: flattened, raw, fileName: req.file.originalname, llmResult, ocrContent: result.content || "" });
  } catch (err) {
    console.error(`[${new Date().toLocaleString("tr-TR")}] [TEK] HATA: ${err.message}`);
    if (req.file) fs.unlink(req.file.path, () => {});
    res.status(500).json({ error: err.message || "Analiz sırasında bir hata oluştu." });
  }
});

app.post("/api/analyze-bulk", upload.array("files", 100), async (req, res) => {
  const log = (msg) => console.log(`[${new Date().toLocaleString("tr-TR")}] [TOPLU] ${msg}`);
  try {
    log(`────────── TOPLU ANALİZ BAŞLADI ──────────`);
    log(`Gelen dosya sayısı: ${req.files?.length || 0}`);

    log(`[0] Azure bağlantısı kontrol ediliyor...`);
    const info = getClient();
    if (!info) { log("HATA: Azure yapılandırması eksik"); return res.status(400).json({ error: "Azure yapılandırması eksik." }); }
    if (!req.files || !req.files.length) { log("HATA: Dosya yok"); return res.status(400).json({ error: "Dosya yüklenmedi." }); }
    log(`[0] Azure OK`);

    const { client, config } = info;
    const results = [];
    const total = req.files.length;
    const cfg = loadConfig();

    for (let fi = 0; fi < total; fi++) {
      const file = req.files[fi];
      try {
        log(`[${fi + 1}/${total}] ── Başlatılıyor: ${file.originalname} (${(file.size / 1024).toFixed(1)} KB)`);

        log(`[${fi + 1}/${total}] [OCR] Azure OCR başlatılıyor...`);
        const ocrStart = Date.now();
        const poller = await client.beginAnalyzeDocument(config.modelId, () =>
          fs.createReadStream(file.path),
          {
            ...(config.locale ? { locale: config.locale } : {}),
            ...(config.pages ? { pages: config.pages } : {}),
            ...(config.readingOrder ? { readingOrder: config.readingOrder } : {}),
          }
        );
        log(`[${fi + 1}/${total}] [OCR] İstek gönderildi, bekleniyor...`);
        const result = await poller.pollUntilDone();
        log(`[${fi + 1}/${total}] [OCR] Tamamlandı (${((Date.now() - ocrStart) / 1000).toFixed(1)}s)`);
        fs.unlink(file.path, () => {});

        log(`[${fi + 1}/${total}] [FLATTEN] Sonuçlar ayrıştırılıyor...`);
        const flattened = flattenResult(result);
        const raw = JSON.stringify(result, null, 2);
        log(`[${fi + 1}/${total}] [FLATTEN] ${flattened.documentFields.length} alan bulundu`);
        flattened.documentFields.forEach((f) => log(`[${fi + 1}/${total}]   → ${f.name}: "${f.value}"`));

        let llmResult = null;
        if (cfg.llmEnabled) {
          log(`[${fi + 1}/${total}] [LLM] Çağrılıyor → ${cfg.llmProvider} / ${cfg.llmModel}...`);
          const llmStart = Date.now();
          const content = buildContentForLlm(flattened, result.content || "");
          llmResult = await callLlm(content);
          log(`[${fi + 1}/${total}] [LLM] Tamamlandı (${((Date.now() - llmStart) / 1000).toFixed(1)}s)`);
        } else {
          log(`[${fi + 1}/${total}] [LLM] Atlanıyor (devre dışı)`);
        }

        results.push({ fileName: file.originalname, success: true, data: flattened, raw, llmResult, ocrContent: result.content || "" });
        log(`[${fi + 1}/${total}] ── Tamamlandı: ${file.originalname}`);
      } catch (err) {
        fs.unlink(file.path, () => {});
        results.push({ fileName: file.originalname, success: false, error: err.message });
        log(`[${fi + 1}/${total}] ── HATA: ${file.originalname} → ${err.message}`);
      }
    }

    const ok = results.filter((r) => r.success).length;
    const fail = results.filter((r) => !r.success).length;
    log(`────────── TOPLU ANALİZ TAMAMLANDI: ${ok} başarılı, ${fail} başarısız / ${total} toplam ──────────`);
    res.json({ success: true, results });
  } catch (err) {
    console.error(`[${new Date().toLocaleString("tr-TR")}] [TOPLU] KRİTİK HATA: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

app.get("/icra", (_req, res) => {
  const cfg = loadConfig();
  res.render("icra", { config: cfg });
});

app.post("/api/process-icra", upload.array("files"), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "Dosya yüklenmedi." });
    }

    const cfg = loadConfig();
    const results = [];
    const templatePath = path.join(__dirname, "ornek.XLSX");
    
    // Varsayılan başlıklar (Genişletilmiş)
    let headers = [
      "Dosya Adı", "İCRA DAİRESİ", "DOSYA NO", "BANKA", "CEVAP TARİHİ", 
      "EVRAK NO", "DURUM", "TUTAR", "BORÇLU ADI", "BORÇLU TCKN", 
      "BANKA REF NO", "ORG REF NO", "YAZI TARİHİ", "TEBLİĞ ŞUBESİ"
    ];

    try {
      if (fs.existsSync(templatePath)) {
        const wb = XLSX.readFile(templatePath);
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        if (data.length > 0) {
          // Şablondaki başlıkları koru ve eksik olanları ekle
          const templateHeaders = data[0];
          headers = ["Dosya Adı", ...templateHeaders];
          const mandatoryHeaders = [
            "İCRA DAİRESİ", "DOSYA NO", "BANKA", "CEVAP TARİHİ", 
            "EVRAK NO", "DURUM", "TUTAR", "BORÇLU ADI", "BORÇLU TCKN", 
            "BANKA REF NO", "ORG REF NO", "YAZI TARİHİ", "TEBLİĞ ŞUBESİ"
          ];
          mandatoryHeaders.forEach(h => {
            if (!headers.includes(h)) headers.push(h);
          });
        }
      }
    } catch (err) {
      console.error("Şablon okuma hatası:", err.message);
    }

    const timestamp = Date.now();
    const generatedFiles = [];

    for (const file of files) {
      const ext = path.extname(file.originalname).toLowerCase();
      let contentItems = [];

      try {
        if (ext === ".csv") {
          const raw = fs.readFileSync(file.path, "utf-8");
          const records = parseCsv(raw, { columns: true, skip_empty_lines: true });
          contentItems = records.map(r => ({ 
            name: file.originalname, 
            text: Object.values(r).join(" "),
            existingData: r
          }));
        } else if (ext === ".xml") {
          const raw = fs.readFileSync(file.path, "utf-8");
          const xmlObj = await parseStringPromise(raw);
          
          let extractedFromXml = {};
          if (xmlObj.BelgeAnalizi && xmlObj.BelgeAnalizi.Alanlar && xmlObj.BelgeAnalizi.Alanlar[0].Alan) {
            xmlObj.BelgeAnalizi.Alanlar[0].Alan.forEach(alan => {
              const name = alan.Ad ? alan.Ad[0] : "Bilinmiyor";
              const value = alan.Deger ? alan.Deger[0] : "";
              extractedFromXml[name] = value;
            });
          }

          const extractText = (obj) => {
            let texts = [];
            for (const key in obj) {
              if (typeof obj[key] === "string") texts.push(obj[key]);
              else if (typeof obj[key] === "object") texts.push(...extractText(obj[key]));
            }
            return texts;
          };
          contentItems = [{ 
            name: file.originalname, 
            text: extractText(xmlObj).join(" "),
            existingData: extractedFromXml
          }];
        } else if (ext === ".xlsx" || ext === ".xls") {
          const wb = XLSX.readFile(file.path);
          const ws = wb.Sheets[wb.SheetNames[0]];
          const records = XLSX.utils.sheet_to_json(ws);
          contentItems = records.map(r => ({ 
            name: file.originalname, 
            text: Object.values(r).join(" "),
            existingData: r
          }));
        }

        for (const item of contentItems) {
          console.log(`[ICRA] Analiz ediliyor: ${item.name}`);
          
          const prompt = `
            İÇERİK ANALİZİ:
            Aşağıdaki metni analiz et ve bilgileri JSON formatında çıkar. 
            Özellikle ödeme durumuna (Sırada/Değil) dikkat et.

            KURALLAR:
            - Eğer metinde "sıraya alınmıştır", "haciz şerhi işlenmiştir", "önceki hacizlerden sonra gelmek üzere", "kuyruğa alınmıştır" gibi ifadeler varsa durum: "Sırada"
            - Eğer bakiye yoksa, haciz uygulanamamışsa veya reddedilmişse durum: "Değil"
            - Tüm para tutarlarını 'tutarlar' listesine ekle.

            ÇIKARILACAK ALANLAR:
            1. icraDairesi
            2. dosyaNo
            3. banka
            4. cevapTarihi
            5. evrakNo
            6. durum (SADECE "Sırada" veya "Değil")
            7. tutarlar (Liste)
            8. borcluAdi
            9. borcluTckn
            10. bankaRefNo
            11. orgRefNo
            12. yaziTarihi
            13. tebligSubesi

            METİN:
            ${item.text}

            JSON ÇIKTISI:
          `;

          const llmResRaw = await callLlmWithPrompt(prompt, cfg);
          let llmJson = { durum: "Değil", tutarlar: ["0"] };
          try {
            const jsonMatch = llmResRaw.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              llmJson = JSON.parse(jsonMatch[0]);
            }
          } catch (e) {
            console.error("LLM JSON parse hatası:", e.message);
          }

          // Mevcut bilgileri LLM'den gelenlerle harmanla
          const baseRow = {
            "Dosya Adı": item.name,
            "İCRA DAİRESİ": llmJson.icraDairesi || item.existingData?.ALICI || item.existingData?.icraDairesi || "",
            "DOSYA NO": llmJson.dosyaNo || item.existingData?.DosyaNo || item.existingData?.dosyaNo || "",
            "BANKA": llmJson.banka || item.existingData?.BANKAADI || item.existingData?.banka || "",
            "CEVAP TARİHİ": llmJson.cevapTarihi || item.existingData?.BELGETARIH || item.existingData?.cevapTarihi || "",
            "EVRAK NO": llmJson.evrakNo || item.existingData?.EvrakNo || item.existingData?.evrakNo || "",
            "DURUM": llmJson.durum || "Değil",
            "BORÇLU ADI": llmJson.borcluAdi || item.existingData?.BORCLUTAMAD || item.existingData?.borcluAdi || "",
            "BORÇLU TCKN": llmJson.borcluTckn || item.existingData?.TCKN || item.existingData?.borcluTckn || "",
            "BANKA REF NO": llmJson.bankaRefNo || item.existingData?.["BANKA REF NO"] || item.existingData?.bankaRefNo || "",
            "ORG REF NO": llmJson.orgRefNo || item.existingData?.["ORG REFNO"] || item.existingData?.orgRefNo || "",
            "YAZI TARİHİ": llmJson.yaziTarihi || item.existingData?.TARİH || item.existingData?.yaziTarihi || "",
            "TEBLİĞ ŞUBESİ": llmJson.tebligSubesi || item.existingData?.tebligSubesi || ""
          };

          const tutarlar = Array.isArray(llmJson.tutarlar) && llmJson.tutarlar.length > 0 ? llmJson.tutarlar : ["0"];
          
          for (const tutar of tutarlar) {
            const fullRow = { ...baseRow, "TUTAR": tutar };
            results.push(fullRow);
          }

          // Her dosya için ayrı XML oluştur
          const xmlContent = objectToXml(baseRow, "IcraAnalizSonuc");
          const xmlFileName = `icra_sonuc_${path.basename(file.originalname, ext)}_${timestamp}.xml`;
          fs.writeFileSync(path.join(UPLOAD_DIR, xmlFileName), xmlContent);
          generatedFiles.push(xmlFileName);
        }
      } catch (err) {
        console.error(`Dosya işleme hatası (${file.originalname}):`, err.message);
      } finally {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      }
    }

    // Toplu CSV oluştur
    const csvContent = resultsToCsv(results);
    const csvFileName = `icra_toplu_sonuc_${timestamp}.csv`;
    fs.writeFileSync(path.join(UPLOAD_DIR, csvFileName), csvContent);
    generatedFiles.push(csvFileName);

    // Excel oluştur
    const outputWs = XLSX.utils.json_to_sheet(results, { header: headers });
    const outputWb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(outputWb, outputWs, "Sonuçlar");
    
    const excelFileName = `icra_sonuc_${timestamp}.xlsx`;
    const excelPath = path.join(UPLOAD_DIR, excelFileName);
    XLSX.writeFile(outputWb, excelPath);
    generatedFiles.push(excelFileName);

    res.json({
      success: true,
      totalProcessed: files.length,
      totalRows: results.length,
      outputFile: excelFileName,
      csvFile: csvFileName,
      xmlFiles: generatedFiles.filter(f => f.endsWith(".xml")),
      allFiles: generatedFiles
    });

  } catch (err) {
    console.error("İcra işlem hatası:", err);
    res.status(500).json({ error: err.message });
  }
});

function escapeXml(unsafe) {
  if (typeof unsafe !== 'string') return unsafe;
  return unsafe.replace(/[<>&"']/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '"': return '&quot;';
      case "'": return '&apos;';
    }
    return c;
  });
}

function objectToXml(obj, rootName = "Kayit") {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>\n`;
  for (const [key, value] of Object.entries(obj)) {
    const safeKey = key.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
    xml += `  <${safeKey}>${escapeXml(value)}</${safeKey}>\n`;
  }
  xml += `</${rootName}>`;
  return xml;
}

function resultsToCsv(results) {
  if (results.length === 0) return "";
  const headers = Object.keys(results[0]);
  const csvRows = [headers.join(",")];
  for (const row of results) {
    const values = headers.map(header => {
      const val = String(row[header] || "");
      const escaped = val.replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  }
  return csvRows.join("\n");
}


app.get("/api/download-result/:filename", (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.filename);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).send("Dosya bulunamadı.");
  }
});

async function callLlmWithPrompt(prompt, cfg) {
  if (!cfg.llmEndpoint || !cfg.llmModel) return "{}";
  
  try {
    let res;
    if (cfg.llmProvider === "lmstudio") {
      res = await llmRequest(`${cfg.llmEndpoint}/api/v1/chat`, {
        model: cfg.llmModel,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      });
      return res.choices?.[0]?.message?.content || "{}";
    } else {
      res = await llmRequest(`${cfg.llmEndpoint}/api/chat`, {
        model: cfg.llmModel,
        messages: [{ role: "user", content: prompt }],
        stream: false,
        options: { temperature: 0.1 },
      });
      return res.message?.content || "{}";
    }
  } catch (err) {
    console.error("LLM Çağrı Hatası:", err.message);
    return "{}";
  }
}

app.listen(PORT, () => {
  console.log(`Sunucu başlatıldı: http://localhost:${PORT}`);
  console.log(`Admin paneli: http://localhost:${PORT}/admin`);
});
