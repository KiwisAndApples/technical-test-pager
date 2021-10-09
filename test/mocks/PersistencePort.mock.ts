import { Incident, PersistencePort } from "../../src/ports"
import { ServiceId } from "../../src/types"

type IncidentStore = {
	[key: string]: Incident
}
export class PersistencePortMock implements PersistencePort {
	private _store: IncidentStore = {}

	public createIncident(serviceId: ServiceId, incident: { message: string; escalationLevel: number }): boolean {
		if (serviceId in this._store) {
			return false
		}

		this._store[serviceId] = {
			...incident,
			healthState: false,
			acknowledged: false,
			serviceId: serviceId
		}
		return true
	}

	public getIncident(serviceId: ServiceId): Incident | undefined {
		return this._store[serviceId] || undefined
	}

	public updateIncidentAcknowledged(serviceId: ServiceId, acknowledged: boolean): boolean {
		this._store[serviceId].acknowledged = acknowledged
		return true
	}

	public updateIncidentEscalationLevel(serviceId: ServiceId, escalationLevel: number): boolean {
		this._store[serviceId].escalationLevel = escalationLevel
		return true
	}

	public updateIncidentHealthState(serviceId: ServiceId, healthState: boolean): boolean {
		this._store[serviceId].healthState = healthState
		return true
	}

	// custom mock methods
	public reset(): void {
		this._store = {}
	}
}
