import { ServiceId } from "../types"

export type EscalationPolicy = Array<SMSPolicy | EmailPolicy>

export type SMSPolicy = {
	type: "SMS"
	phoneNumber: string
}

export type EmailPolicy = {
	type: "EMAIL"
	emailAddress: string
}

export interface EPPort {
	getEscalationPolicy(serviceId: ServiceId): EscalationPolicy[]
}
