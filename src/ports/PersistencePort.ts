import { ServiceId } from "../types"

export type Incident = {
	healthState: boolean
	serviceId: ServiceId
	escalationLevel: number
	acknowledged: boolean
	message: string
}

export interface PersistencePort {
	createIncident(serviceId: ServiceId, incident: { message: string; escalationLevel: number }): boolean
	getIncident(serviceId: ServiceId): Incident | undefined
	updateIncidentAcknowledged(serviceId: ServiceId, acknowledged: boolean): boolean
	updateIncidentEscalationLevel(serviceId: ServiceId, escalationLevel: number): boolean
	updateIncidentHealthState(serviceId: ServiceId, healthState: boolean): boolean
}
