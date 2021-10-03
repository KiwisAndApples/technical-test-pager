import { TimerAdapter } from "../../src/adapters"

export class TimerAdapterMock implements TimerAdapter {
	setTimeout(id: string, time: number): boolean {
		return true
	}
}
