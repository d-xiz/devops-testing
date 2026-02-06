const fs = require('fs').promises;
const path = require('path');
const v8toIstanbul = require('v8-to-istanbul');
const reports = require('istanbul-reports');
const { createContext } = require('istanbul-lib-report');
const { createCoverageMap } = require('istanbul-lib-coverage');

// Where Playwright stores raw v8 coverage
const coverageDir = path.join(process.cwd(), 'coverage/temp');

// Where final frontend coverage report will be generated
const outputDir = path.join(process.cwd(), 'coverage/frontend');

// Absolute path to YOUR frontend feature file
const TARGET_FILE = path.join(
  process.cwd(),
  'public',
  'js',
  'danish.js'
);

async function convertCoverage() {
  // Check coverage exists
  try {
    await fs.access(coverageDir);
  } catch {
    console.log(' No Playwright coverage data found.');
    return;
  }

  const coverageMap = createCoverageMap({});
  const files = await fs.readdir(coverageDir);

  for (const file of files) {
    if (!file.endsWith('.json')) continue;

    const v8Coverage = JSON.parse(
      await fs.readFile(path.join(coverageDir, file), 'utf-8')
    );

    for (const entry of v8Coverage) {

      if (!entry.url || !entry.url.includes('danish.js')) continue;
      if (!entry.source) continue;

      const converter = v8toIstanbul(TARGET_FILE, 0, {
        source: entry.source,
      });

      await converter.load();
      converter.applyCoverage(entry.functions);
      coverageMap.merge(converter.toIstanbul());
    }
  }

  if (!Object.keys(coverageMap.data).length) {
    console.log(' Coverage map is empty. No frontend code was covered.');
    return;
  }

  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  // Generate reports
  const context = createContext({
    dir: outputDir,
    coverageMap,
  });

  reports.create('html').execute(context);
  reports.create('lcovonly').execute(context);

const summary = coverageMap.getCoverageSummary().data;

const thresholds = {
lines: 90,
statements: 90,
functions: 90,
branches: 90
};

let belowThreshold = [];

for (const [metric, threshold] of Object.entries(thresholds)) {
const covered = summary[metric].pct;
if (covered < threshold) {

belowThreshold.push(`${metric}: ${covered}% (below ${threshold}%)`);
}
}

if (belowThreshold.length > 0) {
console.error('\nX Coverage threshold NOT met:');

belowThreshold.forEach(msg => console.error(` - ${msg}`));

process.exitCode = 1;
} else {
console.log('\nCoverage Summary:');
console.log(`Lines:       ${summary.lines.pct}%`);
console.log(`Statements:  ${summary.statements.pct}%`);
console.log(`Functions:   ${summary.functions.pct}%`);
console.log(`Branches:    ${summary.branches.pct}%`);

console.log('\n✓ All coverage thresholds met.');
}
  console.log(` Frontend coverage generated at: ${outputDir}`);

}
convertCoverage();
