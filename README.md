# Schemy TS
This is the TypeScript version of [Schemy](https://github.com/aeberdinelli/schemy). 

## Missing features
All features are shared with the main version, except for the short-style declaration:

```typescript
// This is not available :(
const schema = new Schemy({
    name: String
});

// You need to declare it like this
const schema = new Schemy({
    name: { type: String }
});
```

## Unique features
Available only in the TS version

```typescript
// Schemy needs to be imported this way
import { Schemy } from 'schemy-ts';

// For the following examples we are using the following type
type User = {
    name: string;
    age: number;
};
```

#### Create typed schema
Use this to make sure you declare all the properties in the schema for your Type:

```typescript
// This will give an error because `age` is defined in the type but not in the schema
const UserSchema = Schemy.schema<User>({
    name: { type: String }
});
```

#### Create strict typed schema
This is just the same as the typed schema but the resulting Schemy instance will be `strict`.

```typescript
// You can also do this to make the schema strict
const UserSchema = Schemy.strict<User>({
    name: { type: String }
});
```

#### Validate and return typed body
You can validate and return the body with the specified type. This works extremely well with [VS Code](https://code.visualstudiSco.com/) intellisense.

```typescript
const user: User = await Schemy.validate<User>({ name: 'schemy' });
```

#### Return typed body 
This is similar to the previous example, but in this case you are not validating. You're just returning the last validated input.

```typescript
const user: User = Schemy.getBody<User>();
```

## And more...
To see all the features, please visit the [Schemy wiki](https://github.com/aeberdinelli/schemy/wiki).
