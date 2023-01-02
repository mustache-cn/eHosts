const axios = require('axios');

export class HttpUtil {
	static async getSync(url: string) {
		// console.log("httpGET:", url);
		let data = '';
		await axios
			.get(url)
			.then((res) => {
				// console.log("res:", res.data);
				data = res.data;
			})
			.catch((err) => {
				window.console.log('Error: ', err.message);
			});
		return data;
	}
}
