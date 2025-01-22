import path from 'path';
import fs from 'fs-extra';

const EXCLUDED_DIRECTORIES = ['(core)', 'no-permission'];

const mergeMessages = (target, source) => {
  for (const key in source) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], mergeMessages(target[key], source[key]));
    }
  }
  Object.assign(target || {}, source);
  return target;
};

const flattenMessages = (nestedMessages, prefix = '') => {
  return Object.keys(nestedMessages).reduce((messages, key) => {
    const value = nestedMessages[key];
    const prefixedKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      messages[prefixedKey] = value;
    } else {
      Object.assign(messages, flattenMessages(value, prefixedKey));
    }

    return messages;
  }, {});
};

const combineLocales = async () => {
  const localesDir = path.resolve(process.cwd(), 'src/app');
  const publicLocalesDir = path.resolve(process.cwd(), 'public/locales');

  const baseLocales = {
    en: await fs.readJSON(path.join(process.cwd(), 'src/locales/en.json')),
    zh: await fs.readJSON(path.join(process.cwd(), 'src/locales/zh.json')),
  };

  const mergedMessages = {
    en: flattenMessages(baseLocales.en),
    zh: flattenMessages(baseLocales.zh),
  };

  const apps = await fs.readdir(localesDir, { withFileTypes: true });
  for (const app of apps) {
    if (app.isDirectory() && !EXCLUDED_DIRECTORIES.includes(app.name)) {
      const appLocalesDir = path.join(localesDir, app.name, 'locales');
      for (const locale of ['en', 'zh']) {
        try {
          const filePath = path.join(appLocalesDir, `${locale}.json`);
          if (await fs.pathExists(filePath)) {
            const messages = flattenMessages(await fs.readJSON(filePath));
            mergedMessages[locale] = mergeMessages(mergedMessages[locale], messages);
          }
        } catch (error) {
          console.error(`Error loading locale for ${app.name}:`, error);
        }
      }
    }
  }

  await fs.ensureDir(publicLocalesDir);

  await fs.writeJSON(path.join(publicLocalesDir, 'en.json'), mergedMessages.en, { spaces: 2 });
  await fs.writeJSON(path.join(publicLocalesDir, 'zh.json'), mergedMessages.zh, { spaces: 2 });

  console.log('Locales combined successfully to public/locales directory');
};

const copyPublicDirectories = () => {
  const srcDir = path.resolve(process.cwd(), 'src/app');
  const apps = fs.readdirSync(srcDir).filter(file =>
    fs.lstatSync(path.join(srcDir, file)).isDirectory() && !EXCLUDED_DIRECTORIES.includes(file)
  );

  const mainDestinationPath = path.resolve(process.cwd(), 'public', 'app');
  fs.ensureDirSync(mainDestinationPath);

  apps.forEach(app => {
    const sourcePath = path.join(srcDir, app, 'public');
    const destinationPath = path.join(mainDestinationPath);

    if (fs.existsSync(sourcePath)) {
      try {
        fs.ensureDirSync(destinationPath);
        fs.copySync(sourcePath, destinationPath, {
          dereference: true,
          overwrite: false,
        });
        console.log(`Copied contents of ${sourcePath} to ${destinationPath}`);
      } catch (err) {
        console.error(`Failed to copy contents of ${sourcePath} to ${destinationPath}:`, err);
      }
    } else {
      console.log(`No public directory found for ${app}`);
    }
  });
};

export { mergeMessages, flattenMessages, combineLocales, copyPublicDirectories };
