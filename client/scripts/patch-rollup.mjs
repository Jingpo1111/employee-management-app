import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const target = path.resolve('node_modules/rollup/dist/native.js');

if (!existsSync(target)) {
  process.exit(0);
}

const source = readFileSync(target, 'utf8');
const marker = "const { parse, parseAsync, xxhashBase64Url, xxhashBase36, xxhashBase16 } = safeRequireBindings();";

if (source.includes(marker)) {
  process.exit(0);
}

const original = `const { parse, parseAsync, xxhashBase64Url, xxhashBase36, xxhashBase16 } = requireWithFriendlyError(
\texistsSync(path.join(__dirname, localName)) ? localName : \`@rollup/rollup-\${packageBase}\`
);`;

const replacement = `const safeRequireBindings = () => {
\ttry {
\t\treturn requireWithFriendlyError(existsSync(path.join(__dirname, localName)) ? localName : \`@rollup/rollup-\${packageBase}\`);
\t} catch (error) {
\t\treturn require('@rollup/wasm-node/dist/native.js');
\t}
};

const { parse, parseAsync, xxhashBase64Url, xxhashBase36, xxhashBase16 } = safeRequireBindings();`;

if (!source.includes(original)) {
  console.warn('Rollup patch skipped: expected source block not found.');
  process.exit(0);
}

writeFileSync(target, source.replace(original, replacement), 'utf8');
console.log('Patched rollup native loader to fall back to @rollup/wasm-node.');
