export default class VNode {
	constructor(tag, data, children, text, elm, context) {
		this.tag = tag;
		this.data = data;
		this.children = children;
		this.text = text;
		this.elm = elm;
		this.ns = undefined;
		this.context = context;
		this.fnContext = undefined;
		this.fnOptions = undefined;
		this.fnScopeId = undefined;
		this.key = data && data.key;
		this.componentInstance = undefined;
		this.parent = undefined;
		this.raw = false;
		this.isStatic = false;
		this.isRootInsert = true;
		this.isComment = false;
		this.isCloned = false;
		this.isOnce = false;
		this.asyncMeta = undefined;
		this.isAsyncPlaceholder = false;
	}
}
