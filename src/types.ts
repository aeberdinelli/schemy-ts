export interface SchemyPlugin {
	pluginsInitialized?: Function,
	beforeParse?: Function,
	afterParse?: Function,
	beforeValidate?: Function,
	afterValidate?: Function,
	getValidationErrors?: Function,
	Schemy?: any
};

export type SchemyPluginEvent = 
	'pluginsInitialized' | 
	'beforeParse' | 
	'afterParse' | 
	'beforeValidate' | 
	'afterValidate' | 
	'getValidationErrors';

export type SchemyTyped<Type> = SchemyProperties | {
    [Property in keyof Type]: SchemyTyped<Type[Property]>
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