import _ from 'lodash';
import { table } from 'table';
export function printChainBuilderOutput(output) {
    if (output.contracts) {
        const formattedData = _.map(output.contracts, (v, k) => [k, v.address]);
        if (formattedData.length) {
            console.log('CONTRACTS:');
            console.log(table(formattedData));
        }
    }
    if (output.txns) {
        const formattedData = _.map(output.txns, (v, k) => [k, v.hash]);
        if (formattedData.length) {
            console.log('TRANSACTIONS:');
            console.log(table(formattedData));
        }
    }
}
