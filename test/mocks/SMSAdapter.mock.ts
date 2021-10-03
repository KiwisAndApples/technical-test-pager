import { SMSAdapter } from "../../src/adapters"

export class SMSAdapterMock implements SMSAdapter {
	send(mailAddress: string, message: string): void {}
}
