import { SMSPort } from "../../src/ports"

export class SMSPortMock implements SMSPort {
	send(mailAddress: string, message: string): void {}
}
