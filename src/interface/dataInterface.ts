export interface IData {
	id: string;
	name: string;
	version: number;
	type: string;
	enable: boolean;
	url: string;
	cronKey: string;
	children?: Array<IData>;
}
