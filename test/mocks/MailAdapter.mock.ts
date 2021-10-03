import { MailAdapter } from "../../src/adapters"

export class MailAdapterMock implements MailAdapter {
	send(mailAddress: string, message: string): void {}
}
