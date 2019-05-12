const appNames = ["accounts", "users", "questions", "answers", "search", "mail", "media"].map(s => `su-${s}`);

module.exports = {
  apps: appNames.map(name => ({
    name,
    script: `${name}/dist/server.js`
  })),
  deploy: {
    // "production" is the environment name
    production: {
      // SSH user
      user: "ubuntu",
      // SSH host
      host: ["smores02"],
      // SSH options with no command-line flag, see 'man ssh'
      // can be either a single string or an array of strings
      ssh_options: "StrictHostKeyChecking=no",
      // GIT remote/branch
      ref: "origin/feat/instance",
      // GIT remote
      repo: "git@gitlab.com:derivatives_/smores-underflow.git",
      // path in the server
      path: "/home/ubuntu/smores-underflow",
      // Post-setup commands or path to a script on the host machine
      // eg: placing configurations in the shared dir etc
      'post-setup': "ls -la",
      // post-deploy action
      'post-deploy': "bash scripts/install.sh && bash scripts/build.sh",
    },
  }
}
