import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

const here = path.dirname(fileURLToPath(import.meta.url));
const validator = path.resolve(here, "../zuhui-ppt-master/scripts/validate-research-ledgers.mjs");

function fixture() {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "zuhui-ledger-"));
  fs.mkdirSync(path.join(temp, "assets"));
  fs.writeFileSync(path.join(temp, "assets", "fig.png"), "fixture");
  const figure = {
    paper_id: "example", source_version: "v1", source_pdf: "paper.pdf",
    source_page: 4, figure_id: "Fig.3",
    expected_panels: ["a", "b"], included_panels: ["a", "b"],
    scope: "complete", image_file: "assets/fig.png",
    used_on_slides: [37], figure_legend_intact: true, axes_intact: true,
    caption_removed: true, compared_with_source: true,
    human_review_status: "pass"
  };
  const formula = {
    slide: 38, formula_id: "example-1", source_paper: "example",
    source_location: "Sec.3", latex: "y=wx+b",
    symbols: [
      {token: "y", meaning: "输出", domain_or_shape: "实数标量"},
      {token: "w", meaning: "权重", domain_or_shape: "实数标量"},
      {token: "x", meaning: "输入", domain_or_shape: "实数标量"},
      {token: "b", meaning: "偏置", domain_or_shape: "实数标量"}
    ],
    input_output: "输入 x；输出 y", why_this_formula: "说明线性映射",
    assumptions_or_limits: "仅用于测试", source_verified: true,
    visible_explanation_verified: true
  };
  return { temp, figure, formula };
}
function run(t, figures, formulas) {
  const figuresFile = path.join(t.temp, "figures.json");
  const formulasFile = path.join(t.temp, "formulas.json");
  fs.writeFileSync(figuresFile, JSON.stringify(figures));
  fs.writeFileSync(formulasFile, JSON.stringify(formulas));
  return spawnSync(process.execPath, [validator, figuresFile, formulasFile], {
    encoding: "utf8"
  });
}
function withFixture(fn) {
  const t = fixture();
  try { fn(t); }
  finally { fs.rmSync(t.temp, { recursive: true, force: true }); }
}

test("完整且经人工对照的图表与公式账本可通过结构校验", () => {
  withFixture(t => {
    const res = run(t, [t.figure], [t.formula]);
    assert.equal(res.status, 0, res.stderr);
    assert.match(res.stdout, /只能|不能证明/);
  });
});

test("声称完整但漏掉一个子面板时拒绝通过", () => {
  withFixture(t => {
    t.figure.included_panels = ["a"];
    const res = run(t, [t.figure], [t.formula]);
    assert.equal(res.status, 1);
    assert.match(res.stderr, /面板清单不完整/);
  });
});

test("有意截取独立完整子面板但未标记范围时拒绝通过", () => {
  withFixture(t => {
    t.figure.scope = "intentional-partial";
    t.figure.included_panels = ["a"];
    t.figure.omitted_panels = ["b"];
    const res = run(t, [t.figure], [t.formula]);
    assert.equal(res.status, 1);
    assert.match(res.stderr, /crop_reason|on_slide_scope_disclosure/);
  });
});

test("有意截取且说明省略范围时可通过结构校验", () => {
  withFixture(t => {
    Object.assign(t.figure, {
      scope: "intentional-partial", included_panels: ["a"],
      omitted_panels: ["b"], crop_reason: "仅讨论 a",
      on_slide_scope_disclosure: "只展示 Fig.3(a)"
    });
    const res = run(t, [t.figure], [t.formula]);
    assert.equal(res.status, 0, res.stderr);
  });
});

test("没有人工源图核验的图片不得通过", () => {
  withFixture(t => {
    t.figure.human_review_status = "pending";
    const res = run(t, [t.figure], [t.formula]);
    assert.equal(res.status, 1);
    assert.match(res.stderr, /human_review_status/);
  });
});

test("重要符号未定义或解释未核实时拒绝通过", () => {
  withFixture(t => {
    t.formula.symbols = [{ token: "w", meaning: "权重" }];
    t.formula.visible_explanation_verified = false;
    const res = run(t, [t.figure], [t.formula]);
    assert.equal(res.status, 1);
    assert.match(res.stderr, /domain_or_shape|visible_explanation_verified/);
  });
});

test("账本登记的图片文件不存在时拒绝通过", () => {
  withFixture(t => {
    t.figure.image_file = "assets/missing.png";
    const res = run(t, [t.figure], [t.formula]);
    assert.equal(res.status, 1);
    assert.match(res.stderr, /找不到图像文件/);
  });
});
