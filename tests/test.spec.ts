import { Builder, CellMessage, CommonMessageInfo, contractAddress, InternalMessage, toNano } from "ton";
import { Cell } from "ton";
import { compileFift, compileFunc } from "ton-compiler";
import { SmartContract } from "ton-contract-executor";

const fs = require("fs");

describe('lis', () => {
    let contract: SmartContract;
    
    async function setup(){
        const file = fs.readFileSync('./src/lol.fc')
        const fift = await compileFunc(file);
        const compiledFift = await compileFift(fift);
        const codeCell = Cell.fromBoc(compiledFift)[0];
        const dataCell = new Builder().storeUint(10, 64).endCell();
        const config = {
            debug: true,
        };
        contract = await SmartContract.fromCell(codeCell, dataCell, config);
        
        const address = contractAddress({
            workchain: 0,
            initialCode: codeCell,
            initialData: dataCell
        });

        contract.setC7Config({
            myself: address
        })

        return {contract, address}
    }

    it('says merhaba',  async () => {
        const {contract} = await setup();
        const result = await contract.invokeGetMethod('get_total', [])            
        expect(result.result[0]?.toString()).toBe('10');
    });

    it('lol',  async () => {
        const {contract,address} = await  setup();
        const im =  await contract.sendInternalMessage(new InternalMessage({
            to: address,
            from: null,
            value:  toNano('1.1'),
            bounce: true,

            body: new CommonMessageInfo({
                body: new CellMessage(new Builder().storeUint(3, 32).endCell())
            })
        }));
        const result = await contract.invokeGetMethod('get_total', []) 
        console.log(im);           
        expect(result.result[0]?.toString()).toBe('13');
    });

    
})