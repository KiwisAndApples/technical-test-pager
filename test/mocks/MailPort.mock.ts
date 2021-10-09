import { MailPort } from "../../src/ports"

export class MailPortMock implements MailPort {
	send(mailAddress: string, message: string): void {}
}
