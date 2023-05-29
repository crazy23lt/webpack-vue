import { Actor } from "apify";
import { CheerioCrawler } from "crawlee";
await Actor.init();
const ID = `RKI-612`;
//IESP-588f BDA-088 NEO-556 VAGU-192 CJOD-119 CJOD-107 YMDD-106 GVG-586 DASD-386 UMD-608 GHKO-71 GVG-441 XRW-231
//MIDE-316 MIDE-284 MIDE-248 MIDE-307 MIDE-257 MIDE-225 WANZ-319 JUFD-305 REAL-461
let chash = [];
const crawler1 = new CheerioCrawler({
	async requestHandler({ $ }) {
		$(".tbox h3 a").each(function () {
			chash.push(
				$(this)
					.attr("href")
					.match(/(?<=\/hash\/)\w+(?=\.html)/)[0]
			);
		});
	},
	maxRequestsPerCrawl: 10
});
await crawler1.run([`https://clm356.buzz/search-${ID}-0-3-1.html`]);
await Actor.pushData({ chash });
// const url = num =>
// 	`https://t66yx.ga/thread0806.php?fid=26&search=waaa&page=${num}`;
// const regex = new RegExp("工藤拉拉");
// const arr = [
// 	"https://t66yx.ga/htm_data/2304/26/5646660.html",
// 	"https://t66yx.ga/htm_data/2304/26/5644536.html",
// 	"https://t66yx.ga/htm_data/2304/26/5642427.html",
// 	"https://t66yx.ga/htm_data/2304/26/5640348.html",
// 	"https://t66yx.ga/htm_data/2304/26/5642845.html",
// 	"https://t66yx.ga/htm_data/2303/26/5632536.html",
// 	"https://t66yx.ga/htm_data/2303/26/5627069.html",
// 	"https://t66yx.ga/htm_data/2303/26/5599217.html",
// 	"https://t66yx.ga/htm_data/2303/26/5589795.html",
// 	"https://t66yx.ga/htm_data/2303/26/5574694.html",
// 	"https://t66yx.ga/htm_data/2302/26/5572464.html",
// 	"https://t66yx.ga/htm_data/2302/26/5572034.html",
// 	"https://t66yx.ga/htm_data/2302/26/5531963.html"
// ];
// let flag = true;
// const crawler2 = new CheerioCrawler({
// 	maxRequestsPerCrawl: 101,
// 	async requestHandler({ $, enqueueLinks }) {
// 		$(".tal a").each(function (index, el) {
// 			let bool = regex.test($(el).text());
// 			if (bool) {
// 				let i = "https://t66yx.ga/" + $(el).attr("href");
// 				arr.push(i);
// 			}
// 		});
// 		if (flag) {
// 			flag = false;
// 			let urls = [];
// 			for (let i = 2; i <= 100; i++) {
// 				urls.push(url(i));
// 			}
// 			await enqueueLinks({ urls });
// 		}
// 	}
// });
// await crawler2.run([url(1)]);
// await Actor.pushData({ arr });
// let hash = [];
// const crawler3 = new CheerioCrawler({
// 	maxRequestsPerCrawl: 50,
// 	async requestHandler({ $ }) {
// 		$("#conttpc a[style='cursor:pointer;color:#008000;']").each(function () {
// 			hash.push($(this).attr("href"));
// 		});
// 	}
// });
// await crawler3.run(arr);
// await Actor.pushData({ hash });
await Actor.exit();
/**
 * 	pppd-929
		46be2ac15cdd874bc06bf447925d472a22d30225
		53a5a6cde8762eb5efdacddc130f20366163b7d7
		f8dc06d256cd36639f57e4fbe43faa1b40788df2
		6416acaebfa0420672ac2eb2a42c9a41e62aed72
		88979e197799c16aedb31420c886572db571c434
		117e5b4b8d0e85aefa9df6be13b2ce0930e29a21
		ec9fb231560d1c8d7e09f1285c7d17389a53a812
		53b6f4034575f0c57dbdb7573cf59fa4a4ed94a9
		d66b4f78f505cd60cade3433ec4c8c7b1f2360e2
		94bf0da79efd4f9f21005860d3c1f6857396118d
		800f108237eadc0994d5eddc901d46250fecc1de
		0f90708695d0faeef84b3ebe414be9853da1005d
		01091ebbc9ea79adaad50ef3273ab1917003bbdb
		c1587575a512c6a0d1e5bc589c681645da242f54
		4ce06ad7db8baaa2567d1c98aa9bbf1e45b3b8dd
		c2b1ab331096754d6f57fccaf5c40da7bc100dc3
		c9ac725b9db6f331d1550a0ae2d06144605c9471

		midv147
		"d85741b9e9fa9ce1ee429848fa990808f0634736",
		"8e0bc65bcf631568e03f83d063e10a61b9408143",
		"10f68529b74061419e02b52c15184cb4c99f7d2d",
		"8623ea79a3ed3b7977f9ba970aefc14e05c50192",
		"ee809df8fd3d13155e4ae45dfc71fed3ce0a77c7",
		"a9ec07cc85b63114f39cb3b1a6b9601e603c6e0e",
		"96ae85cbf0053f20be467dd2d9159298eb55538b",
		"7a53a0d5ea60ecaaa2039e9321b646ccafc80fd1",
		"07175cc9bc39918e4d8da858146bd17b979c6560",
		"a173c6178d0d4bf8f485a9f2274ff83fbe3d3e4a",
		"9ea4fb4385b3fda56b2023e3f291cc8049009b8f",
		"bada92e5dc2c1f2f38cb2f239f4c1476506318c3",
		"e04f6f6f079fb92e8163cf0867e45d9dc6c3101a",
		"307ddaa72499954663fda9890672eeffcc6e659c",
		"8189194ccc4d580b67e6a9de04c0e880195ecccf"


 */
