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

	/**
	 * Called by Alerting Service (3)
	 */
	public fireAlert(serviceId: ServiceId, message: string): void {
		const incident = this.persistencePort.getIncident(serviceId)
		if (incident) {
			return // Service is already in unhealthy state
		}
		const ep = this.epPort.getEscalationPolicy(serviceId)
		this._notify(ep[0], message)
		this.persistencePort.createIncident(serviceId, { message, escalationLevel: 0 })
		this.timePort.setTimeout(serviceId, timeout)
	}

	/**
	 * Called by Timer Service (9)
	 */
	public setTimeoutExpired(serviceId: ServiceId): void {
		const incident = this.persistencePort.getIncident(serviceId)
		const ep = this.epPort.getEscalationPolicy(serviceId)

		if (!incident) {
			return // Service is healthy
		}

		if (incident.acknowledged) {
			return // Incident has already ben acknowledged
		}

		if (incident.escalationLevel + 1 < ep.length) {
			incident.escalationLevel++
			this._notify(ep[incident.escalationLevel], incident.message)
			this.persistencePort.updateIncidentEscalationLevel(serviceId, incident.escalationLevel)
			this.timePort.setTimeout(serviceId, timeout)
		} else {
			return // ERROR: Last escalation level reached
		}
	}

	/**
	 * Called by Aircall Engineer using tge pager web console (8)
	 */
	public acknowledgeAlert(serviceId: ServiceId): void {
		const incident = this.persistencePort.getIncident(serviceId)

		if (!incident) {
			return // Service is healthy
		}

		this.persistencePort.updateIncidentAcknowledged(serviceId, true)
	}

	/**
	 * Called by Aircall Engineer using tge pager web console (2)
	 */
	public stopAlert(serviceId: ServiceId): boolean {
		const incident = this.persistencePort.getIncident(serviceId)

		if (!incident) {
			return false // not incident found
		}

		if (incident.healthState) {
			return false // service is already healthy
		}
		return this.persistencePort.updateIncidentHealthState(serviceId, true)
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
