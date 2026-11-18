#!/usr/bin/env node
/**
 * Research slide evidence ledger STRUCTURAL checks.
 * IMPORTANT: This cannot detect visually missing or incorrectly cropped figure panels.
 * Source PDF ↔ extracted asset ↔ rendered slide comparison is still mandatory.
 *
 * Usage:
 *   node zuhui-ppt-master/scripts/validate-research-ledgers.mjs \
 *     ppt_vN/figure_manifest_vN.json ppt_vN/formula_ledger_vN.json
 */
import fs from "node:fs";
import path from "node:path";

const [figurePath, formulaPath] = process.argv.slice(2);
if (!figurePath || !formulaPath) {
  console.error("用法：node validate-research-ledgers.mjs <figure_manifest.json> <formula_ledger.json>");
  process.exit(2);
}
const failures = [];
const warnings = [];
function fail(msg) { failures.push(msg); }
function warn(msg) { warnings.push(msg); }
function loadJSON(p, key) {
  try {
    const raw = JSON.parse(fs.readFileSync(p, "utf8"));
    const data = Array.isArray(raw) ? raw : raw?.[key];
    if (!Array.isArray(data)) {
      fail(p + " 必须是数组或包含 " + key + " 数组的对象");
      return [];
    }
    return data;
  } catch (e) {
    fail("无法读取或解析 " + p + ": " + e.message);
    return [];
  }
}
function textField(obj, key, label) {
  if (typeof obj?.[key] !== "string" || !obj[key].trim()) {
    fail(label + " 缺少字符串字段 " + key);
  }
}
function trueField(obj, key, label) {
  if (obj?.[key] !== true) fail(label + " 未确认 " + key + " = true");
}
function arrayOfStrings(obj, key, label) {
  if (!Array.isArray(obj?.[key]) || obj[key].length === 0
      || obj[key].some(v => typeof v !== "string" || !v.trim())) {
    fail(label + " 缺少非空字符串数组 " + key);
    return [];
  }
  if (new Set(obj[key]).size !== obj[key].length) {
    fail(label + " 的 " + key + " 存在重复项");
  }
  return obj[key];
}

const figures = loadJSON(figurePath, "figures");
const formulas = loadJSON(formulaPath, "formulas");
const baseDir = path.dirname(path.resolve(figurePath));
const ids = new Set();

for (const [index, fig] of figures.entries()) {
  const tag = "图[" + (index + 1) + "] " + (fig?.figure_id || "?");
  for (const key of ["paper_id", "source_version", "source_pdf", "figure_id", "image_file"]) {
    textField(fig, key, tag);
  }
  if (!Number.isInteger(fig?.source_page) || fig.source_page < 1) {
    fail(tag + " 的 source_page 必须是正整数");
  }
  const expected = arrayOfStrings(fig, "expected_panels", tag);
  const included = arrayOfStrings(fig, "included_panels", tag);
  if (!["complete", "intentional-partial"].includes(fig?.scope)) {
    fail(tag + " 的 scope 必须是 complete 或 intentional-partial");
  } else if (fig.scope === "complete") {
    const e = [...expected].sort().join("|");
    const i = [...included].sort().join("|");
    if (e !== i) fail(tag + " 声称 complete，但面板清单不完整");
  } else {
    textField(fig, "crop_reason", tag);
    textField(fig, "on_slide_scope_disclosure", tag);
    const omitted = arrayOfStrings(fig, "omitted_panels", tag);
    if (omitted.some(p => included.includes(p))) fail(tag + " 的 omitted_panels 与 included_panels 重叠");
    if ([...included, ...omitted].sort().join("|") !== [...expected].sort().join("|")) {
      fail(tag + " 局部裁图的 included+omitted 与 expected 不一致");
    }
  }
  if (!Array.isArray(fig?.used_on_slides) || fig.used_on_slides.length === 0
      || fig.used_on_slides.some(n => !Number.isInteger(n) || n < 1)) {
    fail(tag + " 必须填写 used_on_slides 正整数页码数组");
  }
  for (const key of ["figure_legend_intact", "axes_intact", "caption_removed", "compared_with_source"]) {
    trueField(fig, key, tag);
  }
  if (fig?.human_review_status !== "pass") {
    fail(tag + " 的 human_review_status 必须是人工核对后填写的 pass");
  }
  if (typeof fig?.image_file === "string"
    && !fs.existsSync(path.resolve(baseDir, fig.image_file))) {
    fail(tag + " 找不到图像文件 " + fig.image_file);
  }
  const uniqueId = String(fig?.paper_id) + ":" + String(fig?.source_version)
    + ":" + String(fig?.figure_id) + ":" + String(fig?.scope) + ":"
    + String(fig?.used_on_slides);
  if (ids.has(uniqueId)) warn(tag + " 似乎重复登记");
  ids.add(uniqueId);
}

for (const [index, f] of formulas.entries()) {
  const tag = "公式[" + (index + 1) + "] " + (f?.formula_id || "?");
  if (!Number.isInteger(f?.slide) || f.slide < 1) fail(tag + " 缺少有效 slide 页码");
  for (const key of ["formula_id", "source_paper", "source_location", "latex",
                     "input_output", "why_this_formula", "assumptions_or_limits"]) {
    textField(f, key, tag);
  }
  if (!Array.isArray(f?.symbols) || !f.symbols.length) {
    fail(tag + " 缺少 symbols 符号定义");
  } else {
    for (const [j, symbol] of f.symbols.entries()) {
      for (const key of ["token", "meaning", "domain_or_shape"]) {
        textField(symbol, key, tag + " 的符号[" + (j + 1) + "]");
      }
    }
  }
  if (f?.requires_example === true) textField(f, "example_or_shape_trace", tag);
  trueField(f, "source_verified", tag);
  trueField(f, "visible_explanation_verified", tag);
}

for (const w of warnings) console.warn("WARN: " + w);
if (failures.length) {
  for (const error of failures) console.error("FAIL: " + error);
  console.error("账本结构校验失败：" + failures.length + " 项。请修正后重新运行。");
  process.exit(1);
}
console.log("账本结构校验通过：" + figures.length + " 张使用图，" + formulas.length + " 条公式。");
console.log("注意：此结果只证明填写一致，不能证明图片像素中真的包含全部子图，");
console.log("也不能证明符号解释在投影时清晰。必须另做人工源图三联对照与浏览器审查。");
