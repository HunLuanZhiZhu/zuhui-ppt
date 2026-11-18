import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const json = p => JSON.parse(read(p));
const manifest = json(".claude-plugin/plugin.json");
const marketplace = json(".claude-plugin/marketplace.json");
const skillDirs = [
  "zuhui-ppt-master",
  "zuhui-ppt-source-audit",
  "zuhui-ppt-story-spine",
  "zuhui-ppt-swiss-design",
  "zuhui-ppt-triformat-export",
  "zuhui-ppt-qa",
  "zuhui-ppt-visual-audit",
  "zuhui-ppt-visual-score"
];

test("plugin manifest defines a single namespace with eight original skills", () => {
  assert.equal(manifest.name, "zuhui-ppt");
  assert.equal(manifest.license, "GPL-3.0-only");
  assert.deepEqual(manifest.skills, skillDirs.map(x => "./" + x));
  for (const dir of skillDirs) {
    const p = path.join(dir, "SKILL.md");
    assert.ok(fs.existsSync(path.join(root, p)), p + " missing");
    assert.match(read(p), new RegExp("^---[\\s\\S]*?\\nname:\\s*[\\\"\x27]?" + dir + "[\\\"\x27]?\\s*\\n"));
    assert.match(read(p), /CLAUDE_PLUGIN_ROOT/);
  }
  assert.ok(!manifest.skills.some(dir => dir.includes("group-meeting-ppt-")));
});

test("marketplace lists the repository root as an installable plugin", () => {
  assert.equal(marketplace.name, "zuhui-ppt-marketplace");
  assert.equal(marketplace.owner.name, "HunLuanZhiZhu");
  assert.equal(marketplace.plugins.length, 1);
  assert.equal(marketplace.plugins[0].name, manifest.name);
  assert.equal(marketplace.plugins[0].source, "./");
  assert.equal(Object.hasOwn(marketplace.plugins[0], "version"), false);
});

test("one command starts full workflow and can resolve bundled sources", () => {
  const entry = read("skills/ppt/SKILL.md");
  assert.match(entry, /name: ppt/);
  assert.match(entry, /\$ARGUMENTS/);
  for (const dir of skillDirs) assert.ok(entry.includes(dir + "/SKILL.md"));
  for (const p of [
    "zuhui-ppt-master/assets/template-swiss.html",
    "zuhui-ppt-master/references/research-deck-quality-protocol.md",
    "zuhui-ppt-master/scripts/validate-swiss-deck.mjs",
    "zuhui-ppt-master/scripts/validate-research-ledgers.mjs"
  ]) {
    assert.ok(fs.existsSync(path.join(root, p)), "bundled asset missing: " + p);
  }
  assert.match(entry, /用户当前项目工作区/);
});

test("README keeps both Claude Code and Agent Skills install flows", () => {
  const readme = read("README.md");
  assert.match(readme, /claude plugin marketplace add HunLuanZhiZhu\/zuhui-ppt/);
  assert.match(readme, /claude plugin install zuhui-ppt@zuhui-ppt-marketplace/);
  assert.match(readme, /npx skills add hunluanzhizhu\/zuhui-ppt/);
  assert.match(read("docs/claude-code-plugin.md"), /claude plugin validate/);
});
