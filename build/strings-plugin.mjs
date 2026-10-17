import { createFilter } from '@rollup/pluginutils';

export function string(opts = {}) {
  if (!opts.include) {
    throw Error('include option should be specified');
  }

  const filter = createFilter(opts.include, opts.exclude);

  return {
    name: 'string',

    transform(code, id) {
      if (filter(id)) {
        // Normalize checkout line endings before embedding text assets in the userscript.
        code = code.replace(/\r\n?/g, '\n');
        if (opts.transform) code = opts.transform(code, id, opts);
        return {
          code: 'export default ' + JSON.stringify(code) + ';',
          map: { mappings: '' }
        };
      }
    }
  };
}
