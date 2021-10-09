import { EPPort, TimerPort, MailPort, SMSPort, EscalationPolicy, PersistencePort, Incident } from "./ports"
import { ServiceId } from "./types"

const timeout = 15 * 60 // 15min

export class PagerService {
	constructor(
		private epPort: EPPort,
		private timePort: TimerPort,
		private persistencePort: PersistencePort,
		private mailPort: MailPort,
		private smsPort: SMSPort
	) {}

	public fireAlert(serviceId: ServiceId, message: string): void {
		const ep = this.epPort.getEscalationPolicy(serviceId)

		this._notify(ep[0], message)
		this.persistencePort.createIncident(serviceId, { message, escalationLevel: 0 })
		this.timePort.setTimeout(serviceId, timeout)
	}

	public setTimeoutExpired(serviceId: ServiceId): void {
		const incident = this.persistencePort.getIncident(serviceId)
		const ep = this.epPort.getEscalationPolicy(serviceId)

		if (!incident) {
			return // Service is healthy
		}

		if (incident.acknowledged) {
			return // Incident has already ben acknowledged
		}

		if (incident.escalationLevel <= ep.length) {
			incident.escalationLevel++
			this._notify(ep[incident.escalationLevel], incident.message)
			this.persistencePort.updateIncidentEscalationLevel(serviceId, incident.escalationLevel)
			this.timePort.setTimeout(serviceId, timeout)
		}
	}

	public acknowledgeAlert(serviceId: ServiceId): void {
		const incident = this.persistencePort.getIncident(serviceId)

		if (!incident) {
			return // Service is healthy
		}

		this.persistencePort.updateIncidentAcknowledged(serviceId, true)
	}

	/**
	 * Notify all the targets of the given escalation policy
	 */
	private _notify(ep: EscalationPolicy, message: string): void {
		for (const target of ep) {
			switch (target.type) {
				case "SMS": {
					this.smsPort.send(target.phoneNumber, message)
					break
				}
				case "EMAIL": {
					this.mailPort.send(target.emailAddress, message)
					break
				}
			}
		}
	}
}
