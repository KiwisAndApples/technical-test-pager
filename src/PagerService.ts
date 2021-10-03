import { EPAdapter, TimerAdapter, MailAdapter, SMSAdapter } from "./adapters"
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

		if (ep[0].type === "SMS") {
			this.smsAdapter.send(ep[0].phoneNumber, message)
		} else if (ep[0].type === "EMAIL") {
			this.mailAdapter.send(ep[0].emailAddress, message)
		}

		this.timeAdapter.setTimeout(serviceId, timeout)
	}
}
