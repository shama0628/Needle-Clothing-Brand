import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

let products = [];
try {
  const mod = await import("../src/data/products.ts");
  products = mod.PRODUCTS;
} catch (e) {
  const ts = (await import("typescript")).default;
  const rawCode = fs.readFileSync(path.join(projectRoot, "src/data/products.ts"), "utf8");
  const sanitized = rawCode.replace(/import\s+type\s+[^;]+;/g, "")
                           .replace(/import\s+\{[^}]*\}\s+from\s+['"][^'"]+['"];/g, "");
  const transpiled = ts.transpileModule(sanitized, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  
  const tempPath = path.join(__dirname, ".temp_products_eval.mjs");
  fs.writeFileSync(tempPath, transpiled, "utf8");
  try {
    const mod = await import("file://" + tempPath.replace(/\\/g, "/"));
    products = mod.PRODUCTS;
  } finally {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }
}

console.log("========================================================================================");
console.log("                 NEEDLE PRODUCT DATA & ASSET VERIFICATION AUDIT                         ");
console.log("========================================================================================\n");

let missingCount = 0;
let singleImageCount = 0;
let multiImageCount = 0;
let duplicateCount = 0;

const rows = [];

for (let i = 0; i < products.length; i++) {
  const p = products[i];
  const primaryRel = p.primaryImage.startsWith("/") ? p.primaryImage.slice(1) : p.primaryImage;
  const primaryDiskPath = path.join(projectRoot, "public", primaryRel);
  const primaryExists = fs.existsSync(primaryDiskPath);

  if (!primaryExists) missingCount++;

  const images = p.images || [p.primaryImage];
  const uniqueImages = new Set(images);
  const hasDuplicates = uniqueImages.size !== images.length;
  if (hasDuplicates) duplicateCount++;

  let validDiskImages = 0;
  for (const img of images) {
    const rel = img.startsWith("/") ? img.slice(1) : img;
    if (fs.existsSync(path.join(projectRoot, "public", rel))) {
      validDiskImages++;
    }
  }

  if (images.length === 1) {
    singleImageCount++;
  } else {
    multiImageCount++;
  }

  const photoshootStatus = images.length === 1 
    ? "Needs Photoshoot (1/4 Angles)"
    : `Full Studio Set (${images.length} Angles)`;

  rows.push({
    index: i + 1,
    id: p.id,
    name: p.name.length > 28 ? p.name.slice(0, 25) + "..." : p.name,
    category: p.category,
    imagesInModel: images.length,
    validOnDisk: validDiskImages,
    primaryStatus: primaryExists ? "EXISTS" : "MISSING",
    photoshootStatus,
    primaryPath: p.primaryImage
  });
}

console.log(
  "Idx".padEnd(4) + " | " +
  "Product ID".padEnd(12) + " | " +
  "Name".padEnd(30) + " | " +
  "Category".padEnd(14) + " | " +
  "Disk Imgs".padEnd(10) + " | " +
  "Primary".padEnd(8) + " | " +
  "Photoshoot Status"
);
console.log("-".repeat(120));

for (const r of rows) {
  console.log(
    String(r.index).padEnd(4) + " | " +
    r.id.padEnd(12) + " | " +
    r.name.padEnd(30) + " | " +
    r.category.padEnd(14) + " | " +
    String(r.validOnDisk).padEnd(10) + " | " +
    r.primaryStatus.padEnd(8) + " | " +
    r.photoshootStatus
  );
}

console.log("\n" + "=".repeat(120));
console.log("AUDIT SUMMARY METRICS:");
console.log(`• Total Products Catalogued:               ${products.length}`);
console.log(`• Products with Valid Primary Image:       ${products.length - missingCount}/${products.length} (${missingCount === 0 ? "ALL VERIFIED ON DISK" : "FAILURES DETECTED"})`);
console.log(`• Products Requiring Additional Angles:    ${singleImageCount}/${products.length} (Strict 1-to-1 asset reality on disk)`);
console.log(`• Products with Full Multi-Angle Sets:     ${multiImageCount}/${products.length}`);
console.log(`• Products with Fabricated/Duplicate Imgs: ${duplicateCount} (${duplicateCount === 0 ? "CLEAN: 0 duplicated angles" : "WARNING"})`);
console.log("=".repeat(120) + "\n");

if (missingCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}