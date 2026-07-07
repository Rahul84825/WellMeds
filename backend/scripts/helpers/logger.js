const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  blue: "\x1b[34m",
  gray: "\x1b[90m"
};

export const logger = {
  success: (msg) => {
    console.log(`${colors.green}✓ ${msg}${colors.reset}`);
  },
  warn: (msg) => {
    console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`);
  },
  error: (msg, err = "") => {
    const errorStr = err ? ` - ${err.message || err}` : "";
    console.error(`${colors.red}✗ ${msg}${errorStr}${colors.reset}`);
  },
  info: (msg) => {
    console.log(`${colors.cyan}i ${msg}${colors.reset}`);
  },
  muted: (msg) => {
    console.log(`${colors.gray}${msg}${colors.reset}`);
  },
  heading: (msg) => {
    console.log(`\n${colors.magenta}=== ${msg} ===${colors.reset}\n`);
  }
};
