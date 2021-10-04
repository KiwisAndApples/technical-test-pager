import { ServiceId } from "../types"

export type Incident = {
	serviceId: ServiceId
	escalationLevel: number
	acknowledged: boolean
	message: string
}

export interface PersistenceAdapter {
	createIncident(serviceId: ServiceId, incident: { message: string; escalationLevel: number }): Boolean
	getIncident(serviceId: ServiceId): Incident | undefined
	updateIncidentAcknowledged(serviceId: ServiceId, acknowledged: boolean): void
	updateIncidentEscalationLevel(serviceId: ServiceId, escalationLevel: number): void
}
