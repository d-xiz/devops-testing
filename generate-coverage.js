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
      // Only collect coverage for Danish DELETE feature
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
// Retrieve overall coverage summary data from the coverage map
const summary = coverageMap.getCoverageSummary().data;
// Define minimum acceptable coverage thresholds for each metric (in percentage)
const thresholds = {
lines: 90, // Minimum 90% of lines must be covered
statements: 90, // Minimum 90% of statements must be covered
functions: 90, // Minimum 90% of functions must be covered
branches: 90 // Minimum 90% of branches must be covered
};
// Array to store any metrics that do not meet the defined threshold
let belowThreshold = [];
// Loop through each coverage metric (lines, statements, functions, branches)
for (const [metric, threshold] of Object.entries(thresholds)) {
const covered = summary[metric].pct; // Get the coverage percentage for this metric
// Check if the actual coverage is below the threshold
if (covered < threshold) {
// Add a message to the belowThreshold array for reporting later
belowThreshold.push(`${metric}: ${covered}% (below ${threshold}%)`);
}
}
// If any metrics fall below the required threshold
if (belowThreshold.length > 0) {
console.error('\nX Coverage threshold NOT met:');
// Print each failing metric and its coverage percentage
belowThreshold.forEach(msg => console.error(` - ${msg}`));
// Set exit code to 1 to indicate failure (useful for CI/CD pipelines)
process.exitCode = 1;
} else {
// If all thresholds are met, display a success message
console.log('\n✓ All coverage thresholds met.');
}
  console.log(` Frontend coverage generated at: ${outputDir}`);

}
convertCoverage();
