import chalk from "chalk";
import prettyBytes from "pretty-bytes";
import { fetchTeams, fetchUsage } from "../api";
import { logTable, wait } from "../utils/console";
import { sleep } from "../utils/promise";
import { getGreeting } from "../utils/time";
import { acquireToken } from "../utils/token";

export async function usage() {
  console.log("");
  console.log("  " + getGreeting());
  console.log("  Let's determine your Turboremote usage for the month.");
  console.log("");

  const token = await acquireToken();
  const spinner = wait("Loading this month's usage from Turboremote.");
  const teams = await fetchTeams(token);
  const usage = await fetchUsage(token);
  await sleep(2500);
  spinner.succeed("Done!");
  console.log("  Usage loaded from Turboremote.");
  console.log("");

  if (usage.length === 0) {
    console.log("");
    console.log("  Looks like you're not a part of any team on Turboremote.");
    console.log("");
    console.log("  To create a team on Turboremote, run:");
    console.log(chalk.bold("  npx turboremote teams:create"));
    console.log("");
    return;
  }

  let groupedByTeams: any[] = [];
  usage.forEach((u) => {
    const team = teams.find((t) => t.id === u.team_id)!;
    const g = groupedByTeams.find((g2) => g2.teamId === team.id);
    if (!g) {
      groupedByTeams = [
        ...groupedByTeams,
        {
          teamId: team.id,
          teamName: team.name,
          [`${u.type}Sum`]: u.sum,
          [`${u.type}Count`]: u.count,
        },
      ];
    } else {
      g[`${u.type}Sum`] = u.sum;
      g[`${u.type}Count`] = u.count;
    }
  });

  logTable<any>({
    gutter: 6,
    records: groupedByTeams,
    columns: ["Team Name", "Downloaded", "Uploaded"],
    row: (g) => {
      return [
        g.teamName,
        prettyBytes(parseInt(g.downloadSum, 10)),
        prettyBytes(parseInt(g.uploadSum, 10)),
      ];
    },
  });

  console.log("");
}
