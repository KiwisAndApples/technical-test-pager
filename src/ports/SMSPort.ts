export interface SMSPort {
	send(phoneNumber: string, message: string): void
}
