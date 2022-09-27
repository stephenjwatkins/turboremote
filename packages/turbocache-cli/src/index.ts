#!/usr/bin/env node

import yargs from "yargs";

import { turborepoCommand } from "./utils/turborepo";

import { logIn } from "./commands/logIn";
import { logOut } from "./commands/logOut";
import { link } from "./commands/link";
import { unlink } from "./commands/unlink";
import { status } from "./commands/status";
import { tokensList } from "./commands/tokensList";
import { tokensCreate } from "./commands/tokensCreate";

(() => {
  yargs
    .scriptName("")
    .usage("turborepo <cmd> [args]")
    .command("login", "Log in to Turboremote", turborepoCommand(logIn))
    .command("logout", "Log out of Turboremote", turborepoCommand(logOut))
    .command("link", "Link a repo to Turboremote", turborepoCommand(link))
    .command(
      "unlink",
      "Unlink a repo from Turboremote",
      turborepoCommand(unlink)
    )
    .command(
      "status",
      "View a repo's status with Turboremote",
      turborepoCommand(status)
    )
    .command(
      "tokens list",
      "List personal access tokens",
      turborepoCommand(tokensList)
    )
    .command(
      "tokens create",
      "Create a personal access token for CI",
      turborepoCommand(tokensCreate)
    )
    // .command("tokens delete", "Remove a personal access token", logOut)
    // .command("teams list", "List teams", logOut)
    // .command("teams rename", "Rename a team", logOut)
    // .command("teams invite", "Invite a member to a team", logOut)
    // .command("teams revoke", "Revoke a member from a team", logOut)
    // .command("usage", "View your usage of Turboremote", logOut)
    .help().argv;
})();
