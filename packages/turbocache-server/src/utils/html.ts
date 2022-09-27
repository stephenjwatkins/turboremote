export function mainTemplate({ children }: { children: string }) {
  return `<html>
  <head>
    <title>Turboremote Login</title>
  </head>
  <body>
    <div>
      ${children}
    </div>
  </body>
</html>`;
}

export function expiredLoginLink() {
  return mainTemplate({
    children: `<h1>
        Oops!
      </h1>
      <p>
        That login link expired.
      </p>`,
  });
}

export function validLoginLink() {
  return mainTemplate({
    children: `<h1>
        Logged in!
      </h1>
      <p>
        Return to the command line to continue.
      </p>`,
  });
}

export function home() {
  return mainTemplate({
    children: `<h1>
        Welcome to Turboremote!
      </h1>
      <p>
        We are a standalone Remote Cache provider for Turborepo.
      </p>
      <p>
        To get started, simply run <code>npx turboremote link</code> in a Turborepo project.
      </p>`,
  });
}
