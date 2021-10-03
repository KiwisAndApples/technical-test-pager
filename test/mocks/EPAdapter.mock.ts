import { EPAdapter, EscalationPolicy } from "../../src/adapters"
import { ServiceId } from "../../src/types"

export class EPAdapterMock implements EPAdapter {
	getEscalationPolicy(serviceId: ServiceId): EscalationPolicy[] {
		return [
			{
				type: "EMAIL",
				emailAddress: "aljosha@aircall.com"
			}
		]
	}
}
