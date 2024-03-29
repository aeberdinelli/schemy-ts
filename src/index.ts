import { 
	SchemyOptions, 
	SchemyPlugin, 
	SchemyPluginEvent, 
	SchemyProperties, 
	SchemySchema,
	SchemyTyped,
	ValidationError,
} from "./types";

export class Schemy {
	static plugins: SchemyPlugin[];
	
	schemaParsed: boolean = false;
	validationErrors: ValidationError[];
	flex: boolean;
	data: any;
	schema: SchemySchema

	/**
	 * Extend Schemy functionality with plugins
	 * 
	 * @param plugins Array of plugins or just one plugin
	 */
	static extend(plugins: SchemyPlugin|SchemyPlugin[]): void {
		plugins = Array.isArray(plugins) ? plugins : [plugins];

		Schemy.plugins = [
			...(Schemy.plugins || []),
			...plugins.map(plugin => {
				// Inject Schemy into the plugin to make it available for use internally
				plugin.Schemy = Schemy;
				return plugin;
			})
		];

		Schemy.triggerEvent.call(this, 'pluginsInitialized', plugins);
	}

	// Get current version
	static getVersion(): string {
		return '1.6.2';
	}

	/**
	 * Creates a Schemy instance with typed non strict Schema 
	 * 
	 * @param schema Schema object
	 * @param settings Schemy options
	 * @returns Schema object
	 */
	static schema<Type>(schema: SchemyTyped<Type>): Schemy {
		return new Schemy(schema as SchemySchema, { strict: false });
	}

	/**
	 * Creates a Schemy instance with typed strict Schema 
	 * 
	 * @param schema Schema object
	 * @returns Schema object
	 */
	static strict<Type>(schema: SchemyTyped<Type>): Schemy {
		return new Schemy(schema as SchemySchema, { strict: true });
	}

	/**
	 * Invokes the plugin callbacks for the event
	 * 
	 * @param event Event to trigger
	 * @param body Object to pass as a parameter to the plugin
	 */
	static triggerEvent(event: SchemyPluginEvent, body: any): void {
		if (Schemy.plugins && Schemy.plugins.length > 0) {
			for (var plugin of Schemy.plugins) {
				if (typeof plugin[event] === 'function') {
					(plugin[event] as any).call(this, body);
				}
			}
		}
	}

	/**
	 * Async validates an object against a schema and returns the body
	 * 
	 * @param body Object to validate
	 * @param schema Schemy instance or raw schema to validate against to
	 * @param includeAll Include properties not declared in schema, defaults to false
	 * @param orderBody Order the body based on the schema, defaults to false
	 */
	static async validate<OutputType>(body: any, schema: Schemy|SchemySchema, includeAll = false, orderBody = false): Promise<OutputType> {
		if (!(schema instanceof Schemy)) {
			schema = new Schemy(schema);
		}

		if (schema.validate(body)) {
			return (schema.getBody(includeAll, orderBody) as OutputType);
		}

		throw schema.getValidationErrors();
	}

	constructor(schema: SchemySchema, settings: SchemyOptions = {}) {
		Schemy.triggerEvent.call(this, 'beforeParse', schema);

		// If schema was already parsed by a plugin, prevent parsing it again
		if (!this.schemaParsed) {
			for (var [key, properties] of Object.entries<SchemyProperties>(schema)) {
				if (key !== 'required' && !(properties || {}).type) {
					if (typeof properties === 'function') {
						schema[key] = { type: (properties as any), required: true };
					}
					
					else if (typeof properties === 'object') {
						try {
							const parsed: any = {};
	
							if (schema[key].custom) {
								const { custom } = schema[key];
								parsed.custom = custom;
							}
	
							parsed.type = new Schemy(properties as any);
							parsed.required = !!properties.required;
	
							schema[key] = parsed;
						} catch (err) {
							throw `Could not parse property ${key} as schema`;
						}
					}
				}

				else if (typeof properties.type === 'function') {
					if (['boolean','string','number','object','function'].indexOf(typeof properties.type()) === -1) {
						throw `Unsupported type on ${key}: ${typeof properties.type()}`;
					}

					if (typeof properties.type() !== 'string' && (properties.enum || properties.regex)) {
						throw `Invalid schema for ${key}: regex and enum can be set only for strings`;
					}
				}

				else if (typeof properties.type === 'string' && ['uuid/v1','uuid/v4'].indexOf(properties.type) === -1) {
					throw `Unsupported type on ${key}: ${properties.type}`;
				}

				else if (typeof properties.type === 'object' && Array.isArray(properties.type)) {
					if (properties.type.length > 1) {
						throw `Invalid schema for ${key}. Array items must be declared of any type, or just one type: [String], [Number]`;
					}

					// Auto parse array item as schemy
					if (typeof properties.type[0] === 'object') {
						const [arrayItem] = properties.type as any;

						if (typeof (arrayItem as Schemy).validate === 'undefined') {
							(properties.type as any)[0] = new Schemy(properties.type[0] as SchemySchema);
						}
					}
				}

				// Parse child schema and keep custom validator if it exists
				else if (typeof properties.type === 'object' && !(properties.type instanceof Schemy)) {
					try {
						const parsed: any = {};

						if (schema[key].custom) {
							const { custom } = schema[key];
							parsed.custom = custom;
						}

						parsed.type = new Schemy(properties.type as SchemySchema);
						parsed.required = !!properties.required;

						schema[key] = parsed;
					} catch (err) {}
				}
			}
		}

		Schemy.triggerEvent.call(this, 'afterParse', schema);

		this.validationErrors = [];
		this.flex = (settings.strict === false);
		this.data = null;
		this.schema = schema;
	}

	/**
	 * Add error to the validation errors array
	 * 
	 * @param key Key of the property that failed validation
	 * @param message Default message for this key and specific error
	 */
	pushError({ key, message }: { key: string, message: string }): void {
		const properties: { message?: string } = (key in this.schema) ? this.schema[key] : {};

		this.validationErrors.push({ key, message: properties.message || message });
	}

	/**
	 * Validates data against this schema
	 * If you also want the input data, use the static validate method instead
	 * 
	 * @param data Object to validate agains the schema
	 * @returns True if validated correctly, false otherwise
	 */
	validate(data: any): boolean {
		this.validationErrors = [];
		this.data = data;
		
		Schemy.triggerEvent.call(this, 'beforeValidate', data);

		if (!data || typeof data !== 'object') {
			throw 'Data passed to validate is incorrect. It must be an object.';
		}

		if (!this.flex) {
			Object.keys(data).forEach(key => {
				if (!this.schema[key]) {
					this.pushError({ key, message: `Property ${key} not valid in schema` });
				}
			});
		}

		for (var [key, properties] of Object.entries<SchemyProperties>(this.schema)) {
			// Populate with default value if available
			if (typeof properties.default !== 'undefined' && properties.default !== null) {
				if (typeof properties.default === 'function') {
					try { data[key] = properties.default() } catch (e) {}
				}

				else if (['string','number'].indexOf(typeof properties.default) !== -1) {
					data[key] = properties.default;
				}
			}

			// If key is missing, ignore other validations
			if (!!properties.required && (data[key] === null || data[key] === undefined)) {
				this.pushError({ key, message: `Missing required property ${key}` });
				continue;
			}

			// All optional data and empty should not validate
			if (typeof data[key] === 'undefined') {
				continue;
			}

			if (properties.custom) {
				const customValidationResult = properties.custom(data[key], data, this.schema);

				if (typeof customValidationResult === 'string') {
					this.pushError({ key, message: customValidationResult });
				}
				
				else if (customValidationResult !== true) {
					this.pushError({ key, message: `Custom validation failed for property ${key}` });
				}
			}

			if (properties.type) {
				// Validate child schema
				if (properties.type instanceof Schemy && !properties.type.validate(data[key])) {
					this.validationErrors = [
						...this.validationErrors,
						...[{
							key,
							message: properties.type.getValidationErrors().map(error => error.replace('roperty ',`roperty ${key}.`))
						}]
					];
				}

				else if (properties.type === Date) {
					if (['string','number'].indexOf(typeof data[key]) === -1 || isNaN(Date.parse(data[key]))) {
						this.pushError({ key, message: `Property ${key} is not a valid date` });
					}
				}

				else if (typeof properties.type === 'function') {
					// Check native types
					if (typeof data[key] !== typeof properties.type()) {
						this.pushError({
							key,
							message: `Property ${key} is ${typeof data[key]}, expected ${typeof properties.type()}`
						});
					}

					// Check string: enum, regex, min, max
					else if (typeof properties.type() === 'string') {
						if (properties.enum && properties.enum.indexOf(data[key]) === -1) {
							this.pushError({
								key,
								message: `Value of property ${key} does not contain an acceptable value`
							});
						}

						if (properties.regex && !properties.regex.test(data[key])) {
							this.pushError({ key, message: `Regex validation failed for property ${key}` });
						}

						if (typeof properties.min !== 'undefined' && data[key].length < properties.min) {
							this.pushError({ key, message: `Property ${key} must contain at least ${properties.min} characters` });
						}

						if (typeof properties.max !== 'undefined' && data[key].length > properties.max) {
							this.pushError({ key, message: `Property ${key} must contain less than ${properties.max} characters` });
						}
					}

					// Check number min/max
					else if (typeof properties.type() === 'number') {
						if (typeof properties.min !== 'undefined' && data[key] < properties.min) {
							this.pushError({ key, message: `Property ${key} must be greater than ${properties.min}` });
						}
						
						if (typeof properties.max !== 'undefined' && data[key] > properties.max) {
							this.pushError({ key, message: `Property ${key} must be less than ${properties.max}` });
						}
					}
				}

				else if (properties.type === 'uuid/v1' && !/([a-z0-9]){8}-([a-z0-9]){4}-([a-z0-9]{4})-([a-z0-9]{4})-([a-z0-9]{12})/.test(data[key])) {
					this.pushError({ key, message: `Property ${key} is not a valid uuid/v1` });
				}

				else if (properties.type === 'uuid/v4' && !/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(data[key])) {
					this.pushError({ key, message: `Property ${key} is not a valid uuid/v4` });
				}

				else if (typeof properties.type === 'object' && Array.isArray(properties.type)) {
					if (!Array.isArray(data[key])) {
						this.pushError({ key, message: `Property ${key} is ${typeof data[key]}, expected array` });
						continue;
					}

					if (typeof properties.min !== 'undefined' && data[key].length < properties.min) {
						this.pushError({ key, message: `Property ${key} must contain at least ${properties.min} elements` });
					}

					if (typeof properties.max !== 'undefined' && data[key].length > properties.max) {
						this.pushError({ key, message: `Property ${key} must contain no more than ${properties.max} elements` });
					}

					else if (properties.type.length === 1 && properties.type[0] instanceof Schemy) {
						const [ schema ] = properties.type;

						if (data[key].some((item: any) => !schema.validate(item))) {
							this.pushError({ key, message: `An item in array of property ${key} is not valid` });
						}

						continue;
					}

					else if (properties.type.length === 1 && data[key].some((item: any) => typeof item !== typeof (properties.type as any)[0]())) {
						this.pushError({ 
							key, 
							message: `An item in array of property ${key} is not valid. All items must be of type ${typeof (properties.type as any)[0]()}`
						});
					}
				}
			}
		}

		Schemy.triggerEvent.call(this, 'afterValidate', data);

		return (this.validationErrors.length === 0);
	}

	/**
	 * Get all the validation errors from the last validation
	 * 
	 * @returns Array with string of errors
	 */
	getValidationErrors(): string[] {
		if (this.validationErrors === null) {
			throw 'You need to call .validate() before .getValidationErrors()';
		}

		Schemy.triggerEvent.call(this, 'getValidationErrors', null);

		return this.validationErrors.map(error => error.message).flat();
	}

	getGroupedValidationErrors(): ValidationError[] {
		if (this.validationErrors === null) {
			throw 'You need to call .validate() before .getValidationErrors()';
		}

		Schemy.triggerEvent.call(this, 'getGroupedValidationErrors', null);

		return this.validationErrors;
	}

	/**
	 * Get the data provided in the last validation
	 * 
	 * @param includeAll Include properties not declared in schema
	 * @param orderBody Order the body based on the schema
	 * @returns Last validated data
	 */
	getBody<OutputType>(includeAll = false, orderBody = true): OutputType {
		let output: any = { ...this.data };
		let ordered: any = {};

		if (this.flex && !includeAll) {
			Object.keys(output).forEach(key => {
				if (!this.schema[key]) {
					delete output[key];
				}
			});
		}

		if (!orderBody) {
			return (output as OutputType);
		}

		// Add key in orders
		for (const key in this.schema) {
			if (typeof output[key] !== 'undefined') {
				ordered[key] = output[key];
				delete output[key];
			}
		}

		// Add remaining things not in the schema
		for (const key in output) {
			ordered[key] = output[key];
		}

		return (ordered as OutputType);
	}
}