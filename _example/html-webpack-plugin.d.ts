interface ProcessedOptions {
	/**
	 * 	仅当文件已更改时才发出该文件。
	 * @default true
	 */
	cache: boolean;
	/**
	 * 列出应注入的所有条目
	 */
	chunks: "all" | string[];
	/**
	 * 允许控制在将块包括到html中之前应该如何对其进行排序。
	 * @default 'auto'
	 */
	chunksSortMode:
		| "auto"
		| "manual"
		| ((entryNameA: string, entryNameB: string) => number);
	/**
	 * 列出不应注入的所有条目
	 */
	excludeChunks: string[];
	/**
	 * Path to the favicon icon
	 */
	favicon: false | string;
	/**
	 *要写入HTML的文件。
	 *支持子目录，例如:' assets/admin.html '
	 * @default 'index.html'
	 */
	filename: string;
	/**
	 * By default the public path is set to `auto` - that way the html-webpack-plugin will try
	 * to set the publicPath according to the current filename and the webpack publicPath setting
	 */
	publicPath: string | "auto";
	/**
	 * If `true` then append a unique `webpack` compilation hash to all included scripts and CSS files.
	 * This is useful for cache busting
	 */
	hash: boolean;
	/**
	 * Inject all assets into the given `template` or `templateContent`.
	 */
	inject:
		| false // Don't inject scripts
		| true // Inject scripts into body
		| "body" // Inject scripts into body
		| "head"; // Inject scripts into head
	/**
	 * Set up script loading
	 * blocking will result in <script src="..."></script>
	 * defer will result in <script defer src="..."></script>
	 *
	 * @default 'blocking'
	 */
	scriptLoading: "blocking" | "defer";
	/**
	 * Inject meta tags
	 */
	meta:
		| false // Disable injection
		| {
				[name: string]:
					| string
					| false // name content pair e.g. {viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no'}`
					| { [attributeName: string]: string | boolean }; // custom properties e.g. { name:"viewport" content:"width=500, initial-scale=1" }
		  };
	/**
	 * HTML Minification options accepts the following values:
	 * - Set to `false` to disable minifcation
	 * - Set to `'auto'` to enable minifcation only for production mode
	 * - Set to custom minification according to
	 * {@link https://github.com/kangax/html-minifier#options-quick-reference}
	 */
	minify: "auto" | boolean | MinifyOptions;
	/**
	 * Render errors into the HTML page
	 */
	showErrors: boolean;
	/**
	 * The `webpack` require path to the template.
	 * @see https://github.com/jantimon/html-webpack-plugin/blob/master/docs/template-option.md
	 */
	template: string;
	/**
	 * Allow to use a html string instead of reading from a file
	 */
	templateContent:
		| false // Use the template option instead to load a file
		| string
		| ((templateParameters: {
				[option: string]: any;
		  }) => string | Promise<string>)
		| Promise<string>;
	/**
	 * Allows to overwrite the parameters used in the template
	 */
	templateParameters:
		| false // Pass an empty object to the template function
		| ((
				compilation: any,
				assets: {
					publicPath: string;
					js: Array<string>;
					css: Array<string>;
					manifest?: string;
					favicon?: string;
				},
				assetTags: {
					headTags: HtmlTagObject[];
					bodyTags: HtmlTagObject[];
				},
				options: ProcessedOptions
		  ) => { [option: string]: any } | Promise<{ [option: string]: any }>)
		| { [option: string]: any };
	/**
	 * The title to use for the generated HTML document
	 */
	title: string;
	/**
	 * Enforce self closing tags e.g. <link />
	 */
	xhtml: boolean;
	/**
	 * In addition to the options actually used by this plugin, you can use this hash to pass arbitrary data through
	 * to your template.
	 */
	[option: string]: any;
}
