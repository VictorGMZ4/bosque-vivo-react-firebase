import {createHash} from 'node:crypto';
import {readFile, writeFile, readdir} from 'node:fs/promises';
import path from 'node:path';

// Runs after Vite writes both copied public assets and all hashed/lazy chunks.
export function pwaPlugin() {
  let root, outDir;
  const onlineOnly = new Set();
  return {
    name: 'flora-viva-public-offline', apply: 'build',
    configResolved(config) {root = config.root; outDir = path.resolve(root, config.build.outDir);},
    generateBundle(_options, bundle) {
      onlineOnly.clear();
      for (const item of Object.values(bundle)) {
        if (item.type === 'chunk' && Object.keys(item.modules).some(id => /[/\\]@google[/\\]model-viewer[/\\]/.test(id))) onlineOnly.add(item.fileName);
      }
    },
    async closeBundle() {
      async function files(directory) {
        const result = [];
        for (const item of await readdir(directory, {withFileTypes:true})) {
          const full = path.join(directory, item.name);
          if (item.isDirectory()) result.push(...await files(full)); else result.push(full);
        }
        return result;
      }
      // Only static application resources. No data exports, source maps or arbitrary documents.
      const precache = (await files(outDir)).map(file => path.relative(outDir, file).replaceAll('\\','/'))
        .filter(file => !onlineOnly.has(file) && !/^assets\/model-viewer[^/]*\.js$/.test(file))
        .filter(file => ['index.html','manifest.webmanifest','botanical.svg'].includes(file) || /^assets\/.*\.(js|css|woff2?|png|svg|webp)$/.test(file) || /^icons\/.*\.png$/.test(file)).sort();
      const hash = createHash('sha256');
      for (const file of precache) {hash.update(file); hash.update(await readFile(path.join(outDir, file)));}
      const source = await readFile(path.join(root, 'public/sw.js'), 'utf8');
      hash.update(source);
      const script = source.replace('__FLORA_VERSION__', hash.digest('hex').slice(0,20)).replace('__FLORA_PRECACHE__', JSON.stringify(precache.map(file => '/' + file)));
      await writeFile(path.join(outDir, 'sw.js'), script);
    },
  };
}
