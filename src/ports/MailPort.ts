export interface MailPort {
	send(address: string, message: string): void
}
