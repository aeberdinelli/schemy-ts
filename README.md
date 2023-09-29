<div align="center">
    <a href="https://schemy.js.org/">
        <img src="https://user-images.githubusercontent.com/1413883/134991554-4ff6464e-c297-4367-8191-088f9919a5e1.png" height="110">
    </a>
</div>

### [Docs 📖](https://github.com/aeberdinelli/schemy/wiki) · [Plugins 🧩](https://github.com/aeberdinelli/schemy/wiki/List-of-plugins) · [Changelog 📝](https://github.com/aeberdinelli/schemy/releases) · [Donate 💰](https://www.paypal.com/donate/?cmd=_donations&business=aeberdinelli%40gmail.com&item_name=Schemy+library&currency_code=USD&source=url)

Schemy is an extremely simple, lightweight yet powerful schema validation library. Perfect for lightweight-oriented projects like cloud functions where size and speed are key features. **It weights less than 18 KB!**

- This is the TypeScript version of [Schemy](https://github.com/aeberdinelli/schemy). 

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
