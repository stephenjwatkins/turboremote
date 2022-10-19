#!/usr/bin/env node

import yargs from "yargs";

import { Sentry } from "./utils/sentry";
import { turborepoCommand } from "./utils/turborepo";

import { logIn } from "./commands/logIn";
import { logOut } from "./commands/logOut";
import { link } from "./commands/link";
import { unlink } from "./commands/unlink";
import { status } from "./commands/status";
import { tokensList } from "./commands/tokensList";
import { tokensCreate } from "./commands/tokensCreate";
import { tokensDelete } from "./commands/tokensDelete";
import { teamsList } from "./commands/teamsList";
import { teamsCreate } from "./commands/teamsCreate";
import { membersList } from "./commands/membersList";
import { membersAdd } from "./commands/membersAdd";
import { membersRemove } from "./commands/membersRemove";

(async () => {
  await yargs
    .scriptName("")
    .usage("turboremote <cmd> [args]")
    .command(
      "login",
      "Sign in to Turboremote",
      () => {},
      turborepoCommand(logIn)
    )
    .command(
      "logout",
      "Sign out of Turboremote",
      () => {},
      turborepoCommand(logOut)
    )
    .command(
      "link",
      "Link a project to Turboremote",
      () => {},
      turborepoCommand(link)
    )
    .command(
      "unlink",
      "Unlink a project from Turboremote",
      () => {},
      turborepoCommand(unlink)
    )
    .command(
      "status",
      "View a project's status with Turboremote",
      () => {},
      turborepoCommand(status)
    )
    .command(
      "tokens",
      "List access tokens",
      () => {},
      turborepoCommand(tokensList)
    )
    .command(
      "tokens:create",
      "Create an access token (for CI, etc)",
      () => {},
      turborepoCommand(tokensCreate)
    )
    .command(
      "tokens:delete",
      "Delete an access token",
      () => {},
      turborepoCommand(tokensDelete)
    )
    .command(
      "teams",
      "List teams that you're a member of",
      () => {},
      turborepoCommand(teamsList)
    )
    .command(
      "teams:create",
      "Create a team",
      () => {},
      turborepoCommand(teamsCreate)
    )
    .command(
      "members",
      "List members of a team",
      () => {},
      turborepoCommand(membersList)
    )
    .command(
      "members:add",
      "Add a member to a team",
      () => {},
      turborepoCommand(membersAdd)
    )
    .command(
      "members:remove",
      "Remove a member from a team",
      () => {},
      turborepoCommand(membersRemove)
    )
    .showHelpOnFail(true)
    .demandCommand()
    .recommendCommands()
    .strict()
    .help()
    .fail(function (msg, err, yargs) {
      if (err) {
        Sentry.captureException(err);
      }
      console.log("");
      console.log("Looks like we ran into an error.");
      console.log("Try running the command again.");
      console.log(
        "If the problem persists, send us an email at hello@turboremote.org."
      );
      console.log("");
      yargs.showHelp();
      process.exit(1);
    }).argv;
})();
