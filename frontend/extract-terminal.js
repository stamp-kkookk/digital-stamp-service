const chunks = [];
process.stdin.on('data', c => chunks.push(c));
process.stdin.on('end', () => {
  const spec = JSON.parse(Buffer.concat(chunks).toString());
  const paths = spec.paths;
  const terminalPaths = {};
  for (const [path, methods] of Object.entries(paths)) {
    if (path.startsWith('/api/terminal/') || path.startsWith('/api/public/terminal/')) {
      terminalPaths[path] = methods;
    }
  }
  console.log('=== TERMINAL ENDPOINTS ===');
  console.log(JSON.stringify(terminalPaths, null, 2));

  // Collect referenced schemas
  const schemaRefs = new Set();
  const collectRefs = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    if (obj['$ref']) schemaRefs.add(obj['$ref'].replace('#/components/schemas/', ''));
    for (const v of Object.values(obj)) collectRefs(v);
  };
  collectRefs(terminalPaths);

  // Recursively resolve all referenced schemas
  const schemas = spec.components?.schemas || {};
  const relevantSchemas = {};
  const processed = new Set();
  const resolve = (name) => {
    if (processed.has(name) || !schemas[name]) return;
    processed.add(name);
    relevantSchemas[name] = schemas[name];
    // Find nested $ref in this schema
    const innerRefs = new Set();
    const findInner = (obj) => {
      if (!obj || typeof obj !== 'object') return;
      if (obj['$ref']) innerRefs.add(obj['$ref'].replace('#/components/schemas/', ''));
      for (const v of Object.values(obj)) findInner(v);
    };
    findInner(schemas[name]);
    for (const r of innerRefs) resolve(r);
  };
  for (const ref of schemaRefs) resolve(ref);

  console.log('\n=== REFERENCED SCHEMAS ===');
  console.log(JSON.stringify(relevantSchemas, null, 2));
});
