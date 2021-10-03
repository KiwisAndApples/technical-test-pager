export interface MailAdapter {
	send(address: string, message: string): void
}
