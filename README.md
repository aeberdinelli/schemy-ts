# Schemy TS
This is the Schemy version with TS support!

## Features
✅ **Ultra lightweight**<br />
✅ **Ultra fast**<br />
✅ **Plugin support**<br />
✅ **Custom validations**<br />
✅ Easy to read codebase<br />
✅ Nested schemas validation<br />
✅ Custom regex rules<br />
✅ Built-in date support<br />
✅ Built-in whitelist (enum) validations<br />
✅ Built-in min/max rules for string lengths<br />
✅ Built-in min/max rules for numbers<br />
✅ Built-in validations for common strings format, like uuid<br />
✅ Supports validation with async/await, promises and sync<br />
✅ Unit tested with 100% coverage<br />
✅ Easy to read and full documentation<br />

## Usage
Install using npm: `npm install --save schemy-ts`.
Start using Schemy! Here's a full example:

```typescript
import { Schemy } from './src';

const schema = new Schemy({
    name: {
        type: String,
        required: true
    }
});

interface Person {
    name: string;
    lastname?: string
    id?: string
};

export async function validate(input: any) {
    try {
        const person = await Schemy.validate<Person>(input, schema);

        return console.log({
            name: person.name,
            lastname: person.lastname
        });
    }
    catch (err) {
        throw err;
    }
}
```