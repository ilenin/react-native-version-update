import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import { getPackage, updatePackage } from './package';
import { setVersionIOS } from './ios';
import { setVersionAndroid } from './android';
import { getVersionNumber } from './version';

const BUILDER = '--builder=';
const DATE = '--date';

const execute = async () => {
  const packagePath = path.resolve('package.json');
  if (!fs.existsSync(packagePath)) {
    return console.log(chalk.red('package.json not found'));
  }

  let pkg = await getPackage(packagePath);
  const basePath = path.dirname(packagePath);
  const builderArg = process.argv.find((arg) => arg.includes(BUILDER));
  const updateDate = process.argv.some((arg) => arg.includes(DATE));

  let buildNumber = null;
  if (builderArg) {
    buildNumber = await getVersionNumber(builderArg.slice(BUILDER.length));
    buildNumber = parseInt(buildNumber.replace(/\D/g,''));
  }

  pkg = await updatePackage(packagePath, pkg, buildNumber, updateDate);

  if (pkg.dependencies['react-native']) {
    console.log(chalk.red('this command is optimized to run with \'react-native\' package'));

    if (!pkg.version) {
      return console.log(chalk.red('Attribute'), chalk.red.bold('Version'), chalk.red('is required in the package.json'));
    }
    await setVersionIOS(basePath, pkg);
    await setVersionAndroid(basePath, pkg);
  }
};

execute();
