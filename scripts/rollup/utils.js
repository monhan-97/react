import path from 'node:path';

import { mkdirp } from 'mkdirp';
import NCP from 'ncp';

const ncp = NCP.ncp;

export function asyncCopyTo(from, to) {
  return mkdirp(path.dirname(to)).then(
    () =>
      new Promise((resolve, reject) => {
        ncp(from, to, error => {
          if (error) {
            // Wrap to have a useful stack trace.
            reject(new Error(error));
          } else {
            // Wait for copied files to exist; ncp() sometimes completes prematurely.
            // For more detail, see github.com/facebook/react/issues/22323
            // Also github.com/AvianFlu/ncp/issues/127
            setTimeout(resolve, 10);
          }
        });
      }),
  );
}
