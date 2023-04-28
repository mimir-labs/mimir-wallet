// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { execSync } from 'child_process';
import fs from 'fs-extra';
import humps from 'humps';
import { parse } from 'node-html-parser';
import path from 'path';

function main() {
  const assets = fs.readdirSync('packages/app-config/src/assets');

  fs.removeSync('packages/app-config/src/icons', { recursive: true });
  fs.mkdirSync('packages/app-config/src/icons');

  const icons = [];

  for (const asset of assets) {
    if (!asset.endsWith('.svg')) continue;
    const fileName = humps.pascalize(asset.split('.svg')[0]);
    const svgName = humps.pascalize(asset.replace('.', '_'));

    const viewBox = parse(fs.readFileSync(path.join('packages/app-config/src/assets/', asset)).toString()).getElementsByTagName('svg')[0].attributes.viewBox;

    console.log(`write ${fileName}.tsx`);
    fs.writeFileSync(
      `packages/app-config/src/icons/${fileName}.tsx`,
      `// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

// generate by buildAssets.js

import type { SvgIconProps } from '@mui/material';

import { SvgIcon } from '@mui/material';
import React from 'react';

import ${svgName} from '${`../assets/${asset}`}';

function ${fileName}(props: SvgIconProps) {
  return (
    <SvgIcon component={${svgName}} fontSize="inherit" viewBox="${viewBox}" {...props} />
  );
}

export default React.memo(${fileName});
`
    );
    icons.push(fileName);
  }

  fs.writeFileSync(
    'packages/app-config/src/icons/index.tsx',
    `// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

// generate by buildAssets.js

${icons.map((icon) => `export { default as ${icon} } from './${icon}';`).join('\n')}
`
  );

  fs.writeFileSync(
    'packages/app-config/src/images.ts',
    `// Copyright 2023-2023 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

// generate by buildAssets.js

`
  );

  for (const asset of assets) {
    if (!asset.endsWith('.webp') && !asset.endsWith('.jpg') && !asset.endsWith('.jpeg') && !asset.endsWith('.png')) continue;
    const fileName = humps.pascalize(asset.split('.')[0]);

    fs.appendFileSync(
      'packages/app-config/src/images.ts',
      `export { default as ${fileName} } from './assets/${asset}';
`
    );
  }

  execSync('yarn mimir-exec-eslint --fix --ext .js,.cjs,.mjs,.ts,.tsx packages/app-config/src/icons packages/app-config/src/images.ts', {
    stdio: 'inherit'
  });
}

main();
