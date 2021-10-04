import { EPAdapter, TimerAdapter, MailAdapter, SMSAdapter, EscalationPolicy } from "./adapters"
import { ServiceId } from "./types"

const timeout = 15 * 60 // 15min

export class PagerService {
	constructor(
		private epAdapter: EPAdapter,
		private timeAdapter: TimerAdapter,
		private mailAdapter: MailAdapter,
		private smsAdapter: SMSAdapter
	) {}

	public fireAlert(serviceId: ServiceId, message: string): void {
		const ep = this.epAdapter.getEscalationPolicy(serviceId)

		this._notify(ep[0], message)
		this.timeAdapter.setTimeout(serviceId, timeout)
	}

	/**
	 * Notify all the targets of the given escalation policy
	 */
	private _notify(ep: EscalationPolicy, message: string): void {
		for (const target of ep) {
			switch (target.type) {
				case "SMS": {
					this.smsAdapter.send(target.phoneNumber, message)
					break
				}
				case "EMAIL": {
					this.mailAdapter.send(target.emailAddress, message)
					break
				}
			}
		}
	}

	public setTimeoutExpired(serviceId: ServiceId): void {}
}
