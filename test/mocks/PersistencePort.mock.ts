import { Incident, PersistencePort } from "../../src/ports"
import { ServiceId } from "../../src/types"

type IncidentStore = {
	[key: string]: Incident
}
export class PersistencePortMock implements PersistencePort {
	private _store: IncidentStore = {}

	public createIncident(serviceId: ServiceId, incident: { message: string; escalationLevel: number }): Boolean {
		if (serviceId in this._store) {
			return false
		}

		this._store[serviceId] = {
			...incident,
			acknowledged: false,
			serviceId: serviceId
		}
		return true
	}

	public getIncident(serviceId: ServiceId): Incident | undefined {
		return this._store[serviceId] || undefined
	}

	public updateIncidentAcknowledged(serviceId: ServiceId, acknowledged: boolean): void {
		this._store[serviceId].acknowledged = acknowledged
	}

	public updateIncidentEscalationLevel(serviceId: ServiceId, escalationLevel: number): void {
		this._store[serviceId].escalationLevel = escalationLevel
	}
}
