import { EPAdapter, EscalationPolicy } from "../../src/adapters"
import { ServiceId } from "../../src/types"

export class EPAdapterMock implements EPAdapter {
	getEscalationPolicy(serviceId: ServiceId): EscalationPolicy[] {
		return [
			// first level
			[{ type: "EMAIL", emailAddress: "aljosha@aircall.com" }],
			// second level
			[
				{ type: "SMS", phoneNumber: "123456789" },
				{ type: "SMS", phoneNumber: "234567890" }
			]
		]
	}
}
