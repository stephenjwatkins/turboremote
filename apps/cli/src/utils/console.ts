import chalk from "chalk";
import cliSpinners from "cli-spinners";
import ora from "ora";
import { getLongest } from "./string";
import { TurborepoConfig } from "./turborepo";

export function wait(text: string) {
  const spinner = ora({
    text,
    spinner: cliSpinners.dots,
  });
  spinner.start();
  return spinner;
}

export function printTurborepoConfig({
  apiUrl,
  teamIdToken,
  teamAccessToken,
}: TurborepoConfig) {
  console.log("  Usage with command line flags:");
  console.log(
    chalk.bold(
      `  turbo run build --api=${apiUrl} --team=team_${teamIdToken} --token=${teamAccessToken}`
    )
  );
  console.log("");
  console.log("  Usage with environment variables:");
  console.log(
    chalk.bold(
      `  TURBO_TOKEN=${teamAccessToken} TURBO_TEAM=team_${teamIdToken} turbo run build --api=${apiUrl}`
    )
  );
}

export function logTable<T>({
  gutter,
  records,
  columns,
  row,
}: {
  gutter: number;
  records: T[];
  columns: string[];
  row: (record: T) => string[];
}) {
  const rows = records.map((r) => row(r));
  const padding = columns.map((c, i) => {
    const iGutter = i === columns.length - 1 ? 0 : gutter;
    return getLongest([c, ...rows.map((r) => r[i])]) + iGutter;
  });
  const headerCols = columns.map((c, i) => [c, padding[i]]) as [
    string,
    number
  ][];

  console.log(chalk.bold(`  ${cols(headerCols)}`));
  rows.forEach((row) => {
    const rowCols = row.map((r, i) => [r, padding[i]]) as [string, number][];
    console.log(`  ${cols(rowCols)}`);
  });
}

function cols(cols: [string, number][]) {
  return cols.map(([name, pad]) => col(name, pad)).join("");
}

function col(label: string, pad: number) {
  return label.padEnd(pad, " ");
}
