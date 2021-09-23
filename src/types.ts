export interface SchemyPlugin {
	beforeParse?: Function,
	afterParse?: Function,
	beforeValidate?: Function,
	afterValidate?: Function,
	getValidationErrors?: Function
};

export type SchemyPluginEvent = 'beforeParse' | 'afterParse' | 'beforeValidate' | 'afterValidate' | 'getValidationErrors';

export type SchemyTyped<Type> = {
	[Property in keyof Type]: SchemyProperties|Record<string, SchemyProperties>;
};

export interface SchemyProperties {
	type: String|Boolean|Function|Number|Date|SchemySchema,
	required?: Boolean,
	custom?: Function,
	regex?: RegExp,
	min?: Number,
	max?: Number,
	enum?: String[],
	default?: any
};

export interface SchemySchema {
	[key: string]: SchemyProperties
};

export interface SchemyOptions {
	strict?: Boolean
};