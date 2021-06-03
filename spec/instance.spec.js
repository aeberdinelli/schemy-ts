const Schemy = require('../index');

describe('Schemy instance validation', function() {
	it('Should fail if using a non supported type', function() {
		expect(function() {
			new Schemy({
				title: {
					type: function() {return undefined},
					required: true
				}
			})
		}).toThrow();
	});

	it('Should fail if using regex rule on a non string property', function() {
		expect(function() {
			new Schemy({
				title: {
					type: Number,
					regex: /^([a-z]+)$/i
				}
			});
		}).toThrow(new Error('Invalid schema for title: regex and enum can be set only for strings'));
	});

	it('Should fail if custom validator is not a function', function() {
		expect(function() {
			new Schemy({
				title: {
					type: String,
					custom: 'string'
				}
			});
		}).toThrow(new Error('Custom validator for title must be a function, was string'));
	});

	it('Should fail if using enum on a non string property', function() {
		expect(function() {
			new Schemy({
				title: {
					type: Number,
					enum: ['value']
				}
			})
		}).toThrow(new Error('Invalid schema for title: regex and enum can be set only for strings'));
	});

	it('Should fail if defined regex property without a regex type', function() {
		expect(function() {
			new Schemy({
				title: {
					type: String,
					regex: 'not a regex'
				}
			});
		}).toThrow(new Error('Invalid schema for title: regex must be an instance of RegExp'));
	});

	it('Should fail if type is not supported', function() {
		expect(function() {
			new Schemy({
				title: {
					type: 'not_supported'
				}
			});
		}).toThrow(new Error('Unsupported type on title: not_supported'));
	});

	it('Should fail if passing an array type with multiple sub-types', function() {
		expect(function() {
			new Schemy({
				title: {
					type: [String, Number]
				}
			});
		}).toThrow(new Error('Invalid schema for title. Array items must be declared of any type, or just one type: [String], [Number]'));
	});

	it('Should pass if schema declared correctly', function() {
		const schema = new Schemy({
			title: {
				type: String
			},
			types: {
				type: [String],
				required: true
			}
		});

		expect(schema).toEqual(jasmine.any(Schemy));
	});

	it('Should fail if min property is not a number', function() {
		expect(function() {
			new Schemy({
				age: {
					type: Number,
					min: '4'
				}
			})
		}).toThrow(new Error('Invalid schema for age: min property must be a number'));
	});

	it('Should fail if min property is not a number', function() {
		expect(function() {
			new Schemy({
				age: {
					type: Number,
					max: '4'
				}
			})
		}).toThrow(new Error('Invalid schema for age: max property must be a number'));
	});

	it('Should auto parse child schemas', function() {
		const schema = new Schemy({
			child: {
				title: {type: String, required: true},
				subtitle: {type: String}
			}
		});

		expect(schema.validate({
			child: {
				title: 'abc',
				subtitle: 1
			}
		})).toBe(false);
	});

	it('Should throw error trying to auto parse a malformed schema', function() {
		expect(function() {
			const schema = new Schemy({
				data: {
					title: {
						type: [String, Number]
					}
				}
			});
		}).toThrow(new Error('Could not parse property data as schema'));
	});
});