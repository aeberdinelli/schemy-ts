export interface SchemyPlugin {
	pluginsInitialized?: Function,
	beforeParse?: Function,
	afterParse?: Function,
	beforeValidate?: Function,
	afterValidate?: Function,
	getValidationErrors?: Function,
	getGroupedValidationErrors?: Function,
	Schemy?: any
};

export type SchemyPluginEvent = 
'pluginsInitialized' | 
'beforeParse' | 
'afterParse' | 
'beforeValidate' | 
'afterValidate' | 
'getGroupedValidationErrors' | 
'getValidationErrors';

export type SchemyTyped<Type> = SchemyProperties | {
	[Property in keyof Type]: SchemyTyped<Type[Property]>
};

export type SchemyAcceptedTypes = 
	String
	| StringConstructor
	| Boolean
	| BooleanConstructor
	| Function
	| FunctionConstructor
	| Number
	| NumberConstructor
	| Date
	| DateConstructor
	| SchemySchema;

export interface SchemyProperties {
	type: SchemyAcceptedTypes|SchemyAcceptedTypes[],
	required?: Boolean,
	custom?: (value: string, body?: any, schema?: SchemySchema) => string|boolean,
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

export interface ValidationError {
	key: string;
	message: string|string[];
}