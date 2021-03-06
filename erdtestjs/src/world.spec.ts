import { describe } from "mocha"
import { World } from "./world"
import { loadContractCode } from "./index"
import { assert } from "chai";
import { Address } from "@elrondnetwork/erdjs"

describe("test world", () => {
    it("should create account", async () => {
        let world = new World("foo");
        let result = await world.createAccount({ address: new Address("alice"), nonce: 42 });
        assert.equal(result.Account?.Nonce, 42);
    });

    it("should interact well with contract [counter]", async () => {
        let alice = new Address("alice");
        let bob = new Address("bob");
        let code = loadContractCode("../examples/contracts/mycounter/counter.wasm");
        let world = new World("foo");
        await world.createAccount({ address: alice, nonce: 42 });
        await world.createAccount({ address: bob, nonce: 7 });

        let deployResponse = await world.deployContract({ impersonated: "alice", code: code });
        let contract = deployResponse.ContractAddress;

        let runResponse = await world.runContract({ contract: contract, impersonated: "alice", functionName: "increment" });
        assert.isTrue(runResponse.isSuccess());
        runResponse = await world.runContract({ contract: contract, impersonated: "bob", functionName: "increment" });
        assert.isTrue(runResponse.isSuccess());

        let queryResponse = await world.queryContract({ contract: contract, impersonated: "alice", functionName: "get" });
        assert.equal(queryResponse.firstResult().asNumber, 2);
    });
});
