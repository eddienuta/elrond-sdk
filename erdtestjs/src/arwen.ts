import { Address } from "@elrondnetwork/erdjs"

export interface ArwenDebugProvider {
    deployContract(request: DeployRequest): Promise<DeployResponse>;
    upgradeContract(request: UpgradeRequest): Promise<UpgradeResponse>;
    runContract(request: RunRequest): Promise<RunResponse>;
    queryContract(request: QueryRequest): Promise<QueryResponse>;
    createAccount(request: CreateAccountRequest): Promise<CreateAccountResponse>;
}

export class RequestBase {
    databasePath: string = "";
    world: string = "";
}

export class ResponseBase {
    Error: string = "";

    isSuccess(): Boolean {
        return this.Error ? false : true;
    }
}

export class ContractRequestBase extends RequestBase {
    impersonated: string = "";
    value: string = "";
    gasPrice: number = 0;
    gasLimit: number = 0;
}

export class ContractResponseBase extends ResponseBase {
    Input: any = {};
    Output: VMOutput = new VMOutput();

    isSuccess(): Boolean {
        let ok = this.Output.ReturnCode == 0;
        return ok && super.isSuccess();
    }

    firstResult(): WrappedContractReturnData {
        let first = this.Output.ReturnData[0];
        return new WrappedContractReturnData(first);
    }
}

export class DeployRequest extends ContractRequestBase {
    code: string = "";
    codePath: string = "";
    codeMetadata: string = "";
    arguments: string[] = [];
}

export class DeployResponse extends ContractResponseBase {
    ContractAddress: string = ""
}

export class UpgradeRequest extends DeployRequest {
    contractAddress: string = "";
}

export class UpgradeResponse extends ContractResponseBase {
}

export class RunRequest extends ContractRequestBase {
    contractAddress: string = "";
    function: string = "";
    arguments: string[] = [];
}

export class RunResponse extends ContractResponseBase {
}

export class QueryRequest extends RunRequest {
}

export class QueryResponse extends ContractResponseBase {
}

export class CreateAccountRequest extends RequestBase {
    address: Address = new Address("");
    balance: string = "";
    nonce: number = 0;
}

export class CreateAccountResponse {
    Account: Account | null = null;
}

export class Account {
    Address: string = "";
    Nonce: number = 0;
    Balance: number = 0;
}

export class VMOutput {
    ReturnData: any[] = [];
    ReturnCode: number = 0;
    ReturnMessage: string = "";
    GasRemaining: number = 0;
    GasRefund: number = 0;
    OutputAccounts: any = {};
    DeletedAccounts: any[] = [];
    TouchedAccounts: any[] = [];
    Logs: any[] = [];
}

export class WrappedContractReturnData {
    raw: any;
    asHex: string;
    asNumber: number;
    asString: string;

    constructor(raw: any) {
        let buffer = Buffer.from(raw, "base64");

        this.raw = raw;
        this.asHex = buffer.toString("hex");
        this.asNumber = parseInt(this.asHex, 16);
        this.asString = buffer.toString();
    }
}
