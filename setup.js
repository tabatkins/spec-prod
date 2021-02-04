// @ts-check
const path = require("path");
const { addPath, env, exit, sh, setEnv } = require("./utils.js");

const toolchain = env("INPUTS_TOOLCHAIN");
main(toolchain).catch(err => exit("Failed.", err.code));

/**
 * @param {"respec" | "bikeshed" | string} toolchain
 */
async function main(toolchain) {
	switch (toolchain) {
		case "respec": {
			await sh("yarn add respec --silent", {
				output: "stream",
				env: {
					PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: "1",
				},
			});
			addPath(path.join(__dirname, "node_modules", ".bin"));
			setEnv("PUPPETEER_EXECUTABLE_PATH", "/usr/bin/google-chrome");
			break;
		}
		case "bikeshed": {
			const PYTHONUSERBASE = path.join(__dirname, "python_modules");
			await sh(`pip3 install bikeshed --quiet`, {
				output: "stream",
				env: {
					PYTHONUSERBASE,
				},
			});
			setEnv("PYTHONUSERBASE", PYTHONUSERBASE);
			addPath(path.join(PYTHONUSERBASE, "bin"));
			await sh("bikeshed update", "stream");
			break;
		}
		default: {
			const msg = `Envirnoment variable "INPUTS_TOOLCHAIN" must be either one of "respec" or "bikeshed". found "${toolchain}"`;
			exit(msg, 1);
		}
	}
}