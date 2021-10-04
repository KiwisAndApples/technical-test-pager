import {
	EPAdapter,
	TimerAdapter,
	MailAdapter,
	SMSAdapter,
	EscalationPolicy,
	PersistenceAdapter,
	Incident
} from "./adapters"
import { ServiceId } from "./types"

const timeout = 15 * 60 // 15min

export class PagerService {
	constructor(
		private epAdapter: EPAdapter,
		private timeAdapter: TimerAdapter,
		private persistenceAdapter: PersistenceAdapter,
		private mailAdapter: MailAdapter,
		private smsAdapter: SMSAdapter
	) {}

	public fireAlert(serviceId: ServiceId, message: string): void {
		const ep = this.epAdapter.getEscalationPolicy(serviceId)

		this._notify(ep[0], message)
		this.persistenceAdapter.createIncident(serviceId, { message, escalationLevel: 0 })
		this.timeAdapter.setTimeout(serviceId, timeout)
	}

	public setTimeoutExpired(serviceId: ServiceId): void {
		const incident = this.persistenceAdapter.getIncident(serviceId)
		const ep = this.epAdapter.getEscalationPolicy(serviceId)

		if (!incident) {
			return // Service is healthy
		}

		if (incident.acknowledged) {
			return // Incident has already ben acknowledged
		}

		if (incident.escalationLevel <= ep.length) {
			incident.escalationLevel++
			this._notify(ep[incident.escalationLevel], incident.message)
			this.persistenceAdapter.updateIncidentEscalationLevel(serviceId, incident.escalationLevel)
			this.timeAdapter.setTimeout(serviceId, timeout)
		}
	}

	public acknowledgeAlert(serviceId: ServiceId): void {
		const incident = this.persistenceAdapter.getIncident(serviceId)

		if (!incident) {
			return // Service is healthy
		}

		this.persistenceAdapter.updateIncidentAcknowledged(serviceId, true)
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
}
