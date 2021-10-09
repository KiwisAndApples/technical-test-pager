import { ServiceId } from "../types"

export type Incident = {
	healthState: boolean
	serviceId: ServiceId
	escalationLevel: number
	acknowledged: boolean
	message: string
}

export interface PersistencePort {
	createIncident(serviceId: ServiceId, incident: { message: string; escalationLevel: number }): Boolean
	getIncident(serviceId: ServiceId): Incident | undefined
	updateIncidentAcknowledged(serviceId: ServiceId, acknowledged: boolean): void
	updateIncidentEscalationLevel(serviceId: ServiceId, escalationLevel: number): void
	updateIncidentHealthState(serviceId: ServiceId, healthState: boolean): boolean
}
