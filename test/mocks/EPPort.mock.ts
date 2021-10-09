import { EPPort, EscalationPolicy } from "../../src/ports"
import { ServiceId } from "../../src/types"

export class EPPortMock implements EPPort {
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
