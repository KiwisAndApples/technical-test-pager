export interface SMSAdapter {
	send(phoneNumber: string, message: string): void
}
