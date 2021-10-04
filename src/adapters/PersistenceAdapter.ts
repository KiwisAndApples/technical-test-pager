import { ServiceId } from "../types"

export type Incident = {
	serviceId: ServiceId
	escalationLevel: number
	acknowled: boolean
	message: string
}

export interface PersistenceAdapter {
	createIncident(serviceId: ServiceId, incident: { message: string; escalationLevel: number }): Boolean
	getIncident(serviceId: ServiceId): Incident
	updateIncident(serviceId: ServiceId, incident: Incident): void
}
