import { task } from 'hardhat/config';

import { CannonDeploy } from '../types';
import { ChainBuilder } from '../builder';
import { SUBTASK_CANNON_LOAD_DEPLOY, TASK_CANNON } from '../task-names';
import { printBundledChainBuilderOutput } from '../printer';

task(TASK_CANNON, 'Provision the current deploy.json file using Cannon')
  .addOptionalParam('file', 'Custom cannon deployment file.')
  .addOptionalPositionalParam('label', 'Label of a chain to load')
  .setAction(async ({ file, label }, hre) => {
    let deploy: CannonDeploy | null = null;
    if (file) {
      deploy = (await hre.run(SUBTASK_CANNON_LOAD_DEPLOY, {
        file,
      })) as CannonDeploy;
    } else if (label) {
      deploy = {
        name: label,
        chains: [
          {
            deploy: [label as string],
          },
        ],
      };
    } else {
      // TODO: read from cannonfile
    }

    for (const chainData of deploy!.chains) {
      for (const provision of chainData.deploy) {
        let builder;
        if (typeof provision == 'string') {
          builder = new ChainBuilder(provision, hre);
          await builder.build({});
        } else {
          builder = new ChainBuilder(provision[0], hre);
          await builder.build(provision[1]);
        }

        console.log(
          `${typeof provision == 'string' ? provision : provision[0]} outputs:`
        );
        printBundledChainBuilderOutput(builder.getOutputs());
      }

      await hre.run('node');
    }
  });
