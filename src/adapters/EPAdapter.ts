import { ServiceId } from "../types"

export type EscalationPolicy = SMSPolicy | EmailPolicy

export type SMSPolicy = {
	type: "SMS"
	phoneNumber: string
}

export type EmailPolicy = {
	type: "EMAIL"
	emailAddress: string
}

export interface EPAdapter {
	getEscalationPolicy(serviceId: ServiceId): EscalationPolicy[]
}
