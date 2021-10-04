import { Incident, PersistenceAdapter } from "../../src/adapters"
import { ServiceId } from "../../src/types"

export class PersistenceAdapterMock implements PersistenceAdapter {
	public createIncident(serviceId: ServiceId, incident: { message: string; escalationLevel: number }): Boolean {
		return true
	}

	public getIncident(serviceId: ServiceId): Incident {
		return {
			serviceId: "service_1",
			message: "Test",
			escalationLevel: 0,
			acknowled: false
		}
	}

	public updateIncident(serviceId: ServiceId, incident: Incident): void {}
}
